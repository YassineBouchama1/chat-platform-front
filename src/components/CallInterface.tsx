import React, { useEffect, useRef, useState } from 'react';
import { useSocket } from '../providers/SocketProvider';

interface CallInterfaceProps {
    chatId: string;
    participants: Array<{
        userId: string;
        username: string;
        muted: boolean;
        videoOff: boolean;
    }>;
    callType: 'audio' | 'video';
    onLeaveCall: () => void;
    localStream: MediaStream | null;
    onToggleMute: (userId: string) => void;
    onToggleVideo: (userId: string) => void;
    isInitiator: boolean;
}

const CallInterface: React.FC<CallInterfaceProps> = ({
    chatId,
    participants,
    callType,
    onLeaveCall,
    localStream,
    onToggleMute,
    onToggleVideo,
    isInitiator,
}) => {
    const { socket } = useSocket();
    const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<Map<string, string>>(new Map());
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());

    // Set up local video stream
    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    const createPeerConnection = (userId: string) => {
        if (peerConnections.current.has(userId)) {
            return peerConnections.current.get(userId)!;
        }

        const configuration = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                {
                    urls: 'turn:numb.viagenie.ca',
                    username: 'webrtc@live.com',
                    credential: 'muazkh'
                }
            ]
        };

        const pc = new RTCPeerConnection(configuration);

        if (localStream) {
            localStream.getTracks().forEach(track => {
                pc.addTrack(track, localStream);
            });
        }

        pc.ontrack = (event) => {
            setRemoteStreams(prev => {
                const newStreams = new Map(prev);
                newStreams.set(userId, event.streams[0]);
                return newStreams;
            });
        };

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('ice-candidate', {
                    chatId,
                    targetUserId: userId,
                    candidate: event.candidate
                });
            }
        };

        pc.oniceconnectionstatechange = () => {
            setConnectionStatus(prev => {
                const newStatus = new Map(prev);
                newStatus.set(userId, pc.iceConnectionState);
                return newStatus;
            });

            if (pc.iceConnectionState === 'failed') {
                pc.restartIce();
            }
        };

        peerConnections.current.set(userId, pc);
        return pc;
    };

    // Handle signaling
    useEffect(() => {
        const handleOffer = async ({ offer, userId }: { offer: RTCSessionDescriptionInit, userId: string }) => {
            try {
                const pc = createPeerConnection(userId);
                await pc.setRemoteDescription(new RTCSessionDescription(offer));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);

                socket.emit('answer', {
                    chatId,
                    targetUserId: userId,
                    answer
                });
            } catch (error) {
                console.error("Error handling offer:", error);
            }
        };

        const handleAnswer = async ({ answer, userId }: { answer: RTCSessionDescriptionInit, userId: string }) => {
            const pc = peerConnections.current.get(userId);
            if (pc) {
                try {
                    await pc.setRemoteDescription(new RTCSessionDescription(answer));
                } catch (error) {
                    console.error("Error handling answer:", error);
                }
            }
        };

        const handleIceCandidate = async ({ candidate, userId }: { candidate: RTCIceCandidateInit, userId: string }) => {
            const pc = peerConnections.current.get(userId);
            if (pc) {
                try {
                    await pc.addIceCandidate(new RTCIceCandidate(candidate));
                } catch (error) {
                    console.error("Error handling ICE candidate:", error);
                }
            }
        };

        socket.on('offer', handleOffer);
        socket.on('answer', handleAnswer);
        socket.on('ice-candidate', handleIceCandidate);

        return () => {
            socket.off('offer');
            socket.off('answer');
            socket.off('ice-candidate');
        };
    }, [socket, chatId]);

    // Initialize peer connections for new participants
    useEffect(() => {
        participants.forEach(participant => {
            if (!peerConnections.current.has(participant.userId) && participant.userId !== socket.id) {
                const pc = createPeerConnection(participant.userId);
                if (isInitiator) {
                    pc.createOffer()
                        .then(offer => pc.setLocalDescription(offer))
                        .then(() => {
                            socket.emit('offer', {
                                chatId,
                                targetUserId: participant.userId,
                                offer: pc.localDescription
                            });
                        })
                        .catch(console.error);
                }
            }
        });
    }, [participants, isInitiator]);

    const handleToggleMute = () => {
        if (localStream) {
            const audioTracks = localStream.getAudioTracks();
            audioTracks.forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsMuted(!isMuted);
            onToggleMute(socket.id);
        }
    };

    const handleToggleVideo = () => {
        if (localStream && callType === 'video') {
            const videoTracks = localStream.getVideoTracks();
            videoTracks.forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsVideoOff(!isVideoOff);
            onToggleVideo(socket.id);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999]">
            <div className="bg-white p-4 rounded-lg w-full max-w-4xl">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {/* Local video */}
                    <div className="relative">
                        <video
                            ref={localVideoRef}
                            autoPlay
                            muted
                            playsInline
                            className={`w-full h-48 bg-gray-800 rounded ${isVideoOff ? 'hidden' : ''}`}
                        />
                        {isVideoOff && (
                            <div className="w-full h-48 bg-gray-800 rounded flex items-center justify-center">
                                <span className="text-white">Camera Off</span>
                            </div>
                        )}
                        <div className="absolute bottom-2 left-2 text-white bg-black bg-opacity-50 px-2 py-1 rounded">
                            You {isMuted ? '(Muted)' : ''}
                        </div>
                    </div>

                    {/* Remote videos */}
                    {Array.from(remoteStreams).map(([userId, stream]) => {
                        const participant = participants.find(p => p.userId === userId);
                        const connectionState = connectionStatus.get(userId);

                        return (
                            <div key={userId} className="relative">
                                <video
                                    autoPlay
                                    playsInline
                                    className={`w-full h-48 bg-gray-800 rounded ${participant?.videoOff ? 'hidden' : ''}`}
                                    ref={el => {
                                        if (el) el.srcObject = stream;
                                    }}
                                />
                                {participant?.videoOff && (
                                    <div className="w-full h-48 bg-gray-800 rounded flex items-center justify-center">
                                        <span className="text-white">Camera Off</span>
                                    </div>
                                )}
                                <div className="absolute bottom-2 left-2 text-white bg-black bg-opacity-50 px-2 py-1 rounded">
                                    {participant?.username || 'Unknown'}
                                    {participant?.muted ? ' (Muted)' : ''}
                                    {connectionState !== 'connected' && ` (${connectionState})`}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Controls */}
                <div className="mt-4 flex justify-center gap-4">
                    <button
                        onClick={handleToggleMute}
                        className={`px-4 py-2 rounded-full ${isMuted ? 'bg-red-500' : 'bg-blue-500'} text-white hover:opacity-80 transition-opacity`}
                    >
                        {isMuted ? 'Unmute' : 'Mute'}
                    </button>
                    {callType === 'video' && (
                        <button
                            onClick={handleToggleVideo}
                            className={`px-4 py-2 rounded-full ${isVideoOff ? 'bg-red-500' : 'bg-blue-500'} text-white hover:opacity-80 transition-opacity`}
                        >
                            {isVideoOff ? 'Turn On Camera' : 'Turn Off Camera'}
                        </button>
                    )}
                    <button
                        onClick={onLeaveCall}
                        className="px-4 py-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                    >
                        Leave Call
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CallInterface;