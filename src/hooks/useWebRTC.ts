import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../providers/SocketProvider';
import { toast } from 'react-hot-toast';
import { Participant, WebRTCService } from '../utils/webRTC';

export const useWebRTC = (chatId: string, type: 'video' | 'audio') => {
    const { socket } = useSocket();
    const [participants, setParticipants] = useState<Map<string, Participant>>(new Map());
    const [isConnecting, setIsConnecting] = useState(true);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);

    const webRTCServiceRef = useRef<WebRTCService | null>(null);

    useEffect(() => {
        const webRTCService = new WebRTCService(socket, chatId);
        webRTCServiceRef.current = webRTCService;

        const initializeCall = async () => {
            try {
                const stream = await webRTCService.initializeLocalStream(type === 'video');
                const localUserId = socket.id;

                setParticipants(new Map([
                    [localUserId, {
                        userId: localUserId,
                        username: 'You',
                        stream,
                        muted: false,
                        videoOff: false,
                    }],
                ]));

                setupSocketListeners();
            } catch (error) {
                console.error('Error initializing call:', error);
                toast.error('Failed to access camera/microphone');
            }
        };

        const setupSocketListeners = () => {
            socket.on('userJoinedCall', handleUserJoined);
            socket.on('offer', handleOffer);
            socket.on('answer', handleAnswer);
            socket.on('ice-candidate', handleIceCandidate);
            socket.on('userLeftCall', handleUserLeft);
            socket.on('participantToggleAudio', handleParticipantToggleAudio);
            socket.on('participantToggleVideo', handleParticipantToggleVideo);
        };

        initializeCall();

        return () => {
            webRTCService.cleanup();
            socket.off('userJoinedCall');
            socket.off('offer');
            socket.off('answer');
            socket.off('ice-candidate');
            socket.off('userLeftCall');
            socket.off('participantToggleAudio');
            socket.off('participantToggleVideo');
        };
    }, [chatId, type, socket]);

    const handleUserJoined = async ({ userId, username }: { userId: string; username: string }) => {
        try {
            const webRTCService = webRTCServiceRef.current;
            if (!webRTCService) return;

            const peerConnection = await webRTCService.createPeerConnection(
                userId,
                (userId, stream) => {
                    setParticipants(prev => {
                        const updated = new Map(prev);
                        const participant = updated.get(userId);
                        if (participant) {
                            updated.set(userId, { ...participant, stream });
                        }
                        return updated;
                    });
                },
                (state) => {
                    if (state === 'connected') {
                        setIsConnecting(false);
                    }
                }
            );

            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);

            socket.emit('offer', {
                chatId,
                targetUserId: userId,
                offer,
            });

            setParticipants(prev => {
                const updated = new Map(prev);
                updated.set(userId, {
                    userId,
                    username,
                    muted: false,
                    videoOff: false,
                });
                return updated;
            });

            toast.success(`${username} joined the call`);
        } catch (error) {
            console.error('Error handling user joined:', error);
            toast.error('Failed to connect with new participant');
        }
    };

    const handleOffer = async ({ userId, offer }: { userId: string; offer: RTCSessionDescription }) => {
        try {
            const webRTCService = webRTCServiceRef.current;
            if (!webRTCService) return;

            await webRTCService.handleOffer(userId, offer);
        } catch (error) {
            console.error('Error handling offer:', error);
            toast.error('Failed to establish connection');
        }
    };

    const handleAnswer = async ({ userId, answer }: { userId: string; answer: RTCSessionDescription }) => {
        try {
            const webRTCService = webRTCServiceRef.current;
            if (!webRTCService) return;

            await webRTCService.handleAnswer(userId, answer);
        } catch (error) {
            console.error('Error handling answer:', error);
            toast.error('Failed to establish connection');
        }
    };

    const handleIceCandidate = async ({ userId, candidate }: { userId: string; candidate: RTCIceCandidate }) => {
        try {
            const webRTCService = webRTCServiceRef.current;
            if (!webRTCService) return;

            await webRTCService.handleIceCandidate(userId, candidate);
        } catch (error) {
            console.error('Error handling ICE candidate:', error);
        }
    };

    const handleUserLeft = ({ userId, username }: { userId: string; username: string }) => {
        const webRTCService = webRTCServiceRef.current;
        if (!webRTCService) return;

        webRTCService.removeConnection(userId);

        setParticipants(prev => {
            const updated = new Map(prev);
            updated.delete(userId);
            return updated;
        });

        toast.error(`${username} left the call`);
    };

    const handleParticipantToggleAudio = ({ userId, muted }: { userId: string; muted: boolean }) => {
        setParticipants(prev => {
            const updated = new Map(prev);
            const participant = updated.get(userId);
            if (participant) {
                updated.set(userId, { ...participant, muted });
            }
            return updated;
        });
    };

    const handleParticipantToggleVideo = ({ userId, videoOff }: { userId: string; videoOff: boolean }) => {
        setParticipants(prev => {
            const updated = new Map(prev);
            const participant = updated.get(userId);
            if (participant) {
                updated.set(userId, { ...participant, videoOff });
            }
            return updated;
        });
    };

    const toggleAudio = () => {
        const newMutedState = !isMuted;
        setIsMuted(newMutedState);
        webRTCServiceRef.current?.toggleAudio(newMutedState);
        socket.emit('toggleAudio', { chatId, muted: newMutedState });
    };

    const toggleVideo = () => {
        if (type === 'video') {
            const newVideoOffState = !isVideoOff;
            setIsVideoOff(newVideoOffState);
            webRTCServiceRef.current?.toggleVideo(newVideoOffState);
            socket.emit('toggleVideo', { chatId, videoOff: newVideoOffState });
        }
    };

    const leaveCall = () => {
        const webRTCService = webRTCServiceRef.current;
        if (webRTCService) {
            webRTCService.cleanup();
            socket.emit('leaveCall', { chatId });
        }
    };

    return {
        participants,
        isConnecting,
        isMuted,
        isVideoOff,
        toggleAudio,
        toggleVideo,
        leaveCall,
    };
};