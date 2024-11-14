// useWebRTC.ts

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
        let isMounted = true; // To prevent state updates after unmount
        const webRTCService = new WebRTCService(socket, chatId);
        webRTCServiceRef.current = webRTCService;

        const initializeCall = async () => {
            try {
                const isVideo = type === 'video';
                const stream = await webRTCService.initializeLocalStream(isVideo);

                // Wait until socket.id is defined
                const waitForSocketId = () => {
                    return new Promise<string>((resolve, reject) => {
                        if (socket.id) {
                            resolve(socket.id);
                        } else {
                            socket.on('connect', () => {
                                if (socket.id) {
                                    resolve(socket.id);
                                } else {
                                    reject('Socket ID is undefined after connect event.');
                                }
                            });
                        }
                    });
                };

                const localUserId = await waitForSocketId();

                if (!isMounted) return; // Check if component is still mounted

                setParticipants(
                    new Map([
                        [
                            localUserId,
                            {
                                userId: localUserId,
                                username: 'You',
                                stream,
                                muted: false,
                                videoOff: false,
                            },
                        ],
                    ])
                );

                setupSocketListeners();

                // Notify the server that you've joined the call
                socket.emit('joinCall', { chatId, userId: localUserId });
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

            // socket.on('participantToggleAudio', handleParticipantToggleAudio);
            // socket.on('participantToggleVideo', handleParticipantToggleVideo);
        };

        // Initialize the call when the component mounts
        initializeCall();

        return () => {
            isMounted = false;
            webRTCService.cleanup();
            socket.off('userJoinedCall', handleUserJoined);
            socket.off('offer', handleOffer);
            socket.off('answer', handleAnswer);
            socket.off('ice-candidate', handleIceCandidate);
            socket.off('userLeftCall', handleUserLeft);
            socket.off('participantToggleAudio');
            socket.off('participantToggleVideo');
        };
    }, [chatId, type, socket]);

    const handleUserJoined = async ({ userId, username }: { userId: string; username: string }) => {
        try {
            if (!userId || !username) {
                console.error('Received invalid user data:', { userId, username });
                return;
            }

            const webRTCService = webRTCServiceRef.current;
            if (!webRTCService) return;

            const peerConnection = await webRTCService.createPeerConnection(
                userId,
                (userId, stream) => {
                    setParticipants((prev) => {
                        const updated = new Map(prev);
                        const participant = updated.get(userId);
                        if (participant) {
                            updated.set(userId, { ...participant, stream });
                        } else {
                            // If participant doesn't exist yet, add them
                            updated.set(userId, {
                                userId,
                                username,
                                stream,
                                muted: false,
                                videoOff: false,
                            });
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
                offer: peerConnection.localDescription,
            });

            setParticipants((prev) => {
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

    const handleOffer = async ({ userId, offer }: { userId: string; offer: RTCSessionDescriptionInit }) => {
        try {
            if (!userId || !offer) {
                console.error('Received invalid offer data:', { userId, offer });
                return;
            }

            const webRTCService = webRTCServiceRef.current;
            if (!webRTCService) return;

            // Ensure local stream is initialized before handling the offer
            if (!webRTCService.localStream) {
                console.warn('Local stream not initialized, initializing now');
                await webRTCService.initializeLocalStream(type === 'video');
            }

            await webRTCService.handleOffer(
                userId,
                offer,
                (userId, stream) => {
                    setParticipants((prev) => {
                        const updated = new Map(prev);
                        const participant = updated.get(userId);
                        if (participant) {
                            updated.set(userId, { ...participant, stream });
                        } else {
                            // If participant doesn't exist yet, add them
                            updated.set(userId, {
                                userId,
                                username: 'Participant',
                                stream,
                                muted: false,
                                videoOff: false,
                            });
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

            // Optionally, update your UI to reflect the new participant
        } catch (error) {
            console.error('Error handling offer:', error);
            toast.error('Failed to establish connection');
        }
    };

    const handleAnswer = async ({ userId, answer }: { userId: string; answer: RTCSessionDescriptionInit }) => {
        try {
            if (!userId || !answer) {
                console.error('Received invalid answer data:', { userId, answer });
                return;
            }

            const webRTCService = webRTCServiceRef.current;
            if (!webRTCService) return;

            await webRTCService.handleAnswer(userId, answer);
        } catch (error) {
            console.error('Error handling answer:', error);
            toast.error('Failed to establish connection');
        }
    };

    const handleIceCandidate = async ({ userId, candidate }: { userId: string; candidate: RTCIceCandidateInit }) => {
        try {
            if (!userId || !candidate) {
                console.error('Received invalid ICE candidate data:', { userId, candidate });
                return;
            }

            const webRTCService = webRTCServiceRef.current;
            if (!webRTCService) return;

            await webRTCService.handleIceCandidate(userId, candidate);
        } catch (error) {
            console.error('Error handling ICE candidate:', error);
        }
    };

    const handleUserLeft = ({ userId, username }: { userId: string; username: string }) => {
        if (!userId) {
            console.error('Received invalid user data on userLeft:', { userId, username });
            return;
        }

        const webRTCService = webRTCServiceRef.current;
        if (!webRTCService) return;

        webRTCService.removeConnection(userId);

        setParticipants((prev) => {
            const updated = new Map(prev);
            updated.delete(userId);
            return updated;
        });

        toast.error(`${username || 'A user'} left the call`);
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
        }
        socket.emit('leaveCall', { chatId });
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