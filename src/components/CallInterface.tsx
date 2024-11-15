// components/CallInterface.tsx
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
}

const CallInterface: React.FC<CallInterfaceProps> = ({
    chatId,
    participants,
    callType,
    onLeaveCall,
}) => {
    const { socket } = useSocket();
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
    const [activeParticipants, setActiveParticipants] = useState<Array<{
        userId: string;
        username: string;
        muted: boolean;
        videoOff: boolean;
    }>>(participants);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());

    const createPeerConnection = (userId: string) => {
        if (peerConnections.current.has(userId)) {
            console.log("Peer connection already exists for:", userId);
            return peerConnections.current.get(userId)!;
        }

        console.log("Creating new peer connection for:", userId);
        const configuration = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' },
                {
                    urls: 'turn:numb.viagenie.ca',
                    username: 'webrtc@live.com',
                    credential: 'muazkh'
                }
            ]
        };

        const pc = new RTCPeerConnection(configuration);

        // Add local stream tracks to peer connection
        if (localStream) {
            localStream.getTracks().forEach(track => {
                console.log('Adding track to peer connection:', track.kind);
                pc.addTrack(track, localStream);
            });
        }

        pc.ontrack = (event) => {
            console.log('Received remote track from:', userId, event.track.kind);
            setRemoteStreams(prev => {
                const newStreams = new Map(prev);
                newStreams.set(userId, event.streams[0]);
                return newStreams;
            });
        };

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                console.log('Sending ICE candidate to:', userId);
                socket.emit('ice-candidate', {
                    chatId,
                    targetUserId: userId,
                    candidate: event.candidate
                });
            }
        };

        pc.oniceconnectionstatechange = () => {
            console.log(`ICE connection state with ${userId}:`, pc.iceConnectionState);
            if (pc.iceConnectionState === 'failed') {
                console.log('Attempting to restart ICE');
                pc.restartIce();
            }
        };

        pc.onconnectionstatechange = () => {
            console.log(`Connection state with ${userId}:`, pc.connectionState);
            if (pc.connectionState === 'failed') {
                console.log('Connection failed, attempting to reconnect');
                peerConnections.current.delete(userId);
                const newPc = createPeerConnection(userId);
                newPc.createOffer()
                    .then(offer => newPc.setLocalDescription(offer))
                    .then(() => {
                        socket.emit('offer', {
                            chatId,
                            targetUserId: userId,
                            offer: newPc.localDescription
                        });
                    });
            }
        };

        peerConnections.current.set(userId, pc);
        return pc;
    };

    // Initialize media and join call
    useEffect(() => {
        const initializeMedia = async () => {
            try {
                console.log("Requesting media access...");
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: callType === 'video',
                    audio: true,
                });
                console.log("Media access granted:", stream.getTracks().map(t => t.kind));
                setLocalStream(stream);

                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }
            } catch (error) {
                console.error('Error accessing media devices:', error);
            }
        };

        initializeMedia();

        return () => {
            localStream?.getTracks().forEach(track => track.stop());
            peerConnections.current.forEach(pc => pc.close());
            peerConnections.current.clear();
        };
    }, [callType]);

    // Join call and create peer connections
    useEffect(() => {
        if (localStream) {
            console.log("Joining call room:", chatId);
            socket.emit('joinCall', { chatId }, (response: { participants: Array<{ userId: string, username: string }> }) => {
                console.log("Joined call, current participants:", response.participants);
                
                response.participants.forEach(participant => {
                    if (participant.userId !== socket.id) {
                        console.log("Creating initial peer connection for:", participant.userId);
                        const pc = createPeerConnection(participant.userId);
                        
                        pc.createOffer()
                            .then(offer => pc.setLocalDescription(offer))
                            .then(() => {
                                socket.emit('offer', {
                                    chatId,
                                    targetUserId: participant.userId,
                                    offer: pc.localDescription
                                });
                            })
                            .catch(err => console.error("Error creating initial offer:", err));
                    }
                });
            });
        }
    }, [localStream, chatId]);

    // Handle signaling
    useEffect(() => {
        const handleOffer = async ({ offer, userId }: { offer: RTCSessionDescriptionInit, userId: string }) => {
            console.log("Received offer from:", userId);
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
            console.log("Received answer from:", userId);
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
            console.log("Received ICE candidate from:", userId);
            const pc = peerConnections.current.get(userId);
            if (pc) {
                try {
                    await pc.addIceCandidate(new RTCIceCandidate(candidate));
                } catch (error) {
                    console.error("Error handling ICE candidate:", error);
                }
            }
        };

        const handleUserJoined = ({ userId, username }: { userId: string, username: string }) => {
            console.log("User joined:", username);
            setActiveParticipants(prev => {
                if (!prev.find(p => p.userId === userId)) {
                    return [...prev, { userId, username, muted: false, videoOff: false }];
                }
                return prev;
            });
        };

        const handleUserLeft = ({ userId }: { userId: string }) => {
            console.log("User left:", userId);
            setActiveParticipants(prev => prev.filter(p => p.userId !== userId));
            setRemoteStreams(prev => {
                const newStreams = new Map(prev);
                newStreams.delete(userId);
                return newStreams;
            });
            const pc = peerConnections.current.get(userId);
            if (pc) {
                pc.close();
                peerConnections.current.delete(userId);
            }
        };

        socket.on('offer', handleOffer);
        socket.on('answer', handleAnswer);
        socket.on('ice-candidate', handleIceCandidate);
        socket.on('userJoined', handleUserJoined);
        socket.on('userLeft', handleUserLeft);
        socket.on('currentParticipants', ({ participants }) => {
            console.log('Received updated participants:', participants);
            setActiveParticipants(participants);
        });

        return () => {
            socket.off('offer', handleOffer);
            socket.off('answer', handleAnswer);
            socket.off('ice-candidate', handleIceCandidate);
            socket.off('userJoined', handleUserJoined);
            socket.off('userLeft', handleUserLeft);
            socket.off('currentParticipants');
        };
    }, [socket, chatId]);

    const toggleMute = () => {
        if (localStream) {
            const audioTracks = localStream.getAudioTracks();
            audioTracks.forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsMuted(!isMuted);
            socket.emit('updateMediaState', {
                chatId,
                muted: !isMuted,
                videoOff: isVideoOff,
            });
        }
    };

    const toggleVideo = () => {
        if (localStream && callType === 'video') {
            const videoTracks = localStream.getVideoTracks();
            videoTracks.forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsVideoOff(!isVideoOff);
            socket.emit('updateMediaState', {
                chatId,
                muted: isMuted,
                videoOff: !isVideoOff,
            });
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999]">
            <div className="bg-white p-4 rounded-lg w-full max-w-4xl">
                <div className="grid grid-cols-2 gap-4">
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
                        <p className="absolute bottom-2 left-2 text-white">You {isMuted ? '(Muted)' : ''}</p>
                    </div>

                    {/* Remote videos */}
                    {Array.from(remoteStreams).map(([userId, stream]) => {
                        const participant = activeParticipants.find(p => p.userId === userId);
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
                                <p className="absolute bottom-2 left-2 text-white">
                                    {participant?.username || 'Unknown'} {participant?.muted ? '(Muted)' : ''}
                                </p>
                            </div>
                        );
                    })}
                </div>

                {/* Debug info */}
                <div className="mt-4 text-sm text-gray-600">
                    <p>Participants: {activeParticipants.length}</p>
                    <p>Remote streams: {remoteStreams.size}</p>
                    <p>Peer connections: {peerConnections.current.size}</p>
                </div>

                {/* Controls */}
                <div className="mt-4 flex justify-center gap-4">
                    <button
                        onClick={toggleMute}
                        className={`px-4 py-2 ${isMuted ? 'bg-red-500' : 'bg-blue-500'} text-white rounded hover:opacity-80`}
                    >
                        {isMuted ? 'Unmute' : 'Mute'}
                    </button>
                    {callType === 'video' && (
                        <button
                            onClick={toggleVideo}
                            className={`px-4 py-2 ${isVideoOff ? 'bg-red-500' : 'bg-blue-500'} text-white rounded hover:opacity-80`}
                        >
                            {isVideoOff ? 'Turn On Camera' : 'Turn Off Camera'}
                        </button>
                    )}
                    <button
                        onClick={onLeaveCall}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        Leave Call
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CallInterface;