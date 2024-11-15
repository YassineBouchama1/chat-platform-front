import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSocket } from './SocketProvider';
import { showCallNotification } from '../components/CallNotification';
import CallInterface from '../components/CallInterface';

interface Participant {
    userId: string;
    username: string;
    muted: boolean;
    videoOff: boolean;
}

interface CallState {
    chatId: string;
    type: 'audio' | 'video';
    participants: Participant[];
    isInitiator?: boolean;
}

interface CallContextType {
    initiateCall: (chatId: string, type: 'audio' | 'video') => Promise<boolean>;
    leaveCall: () => void;
    isInCall: boolean;
    currentCall: CallState | null;
    toggleMute: (userId: string) => void;
    toggleVideo: (userId: string) => void;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

export const CallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { socket } = useSocket();
    const [currentCall, setCurrentCall] = useState<CallState | null>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);

    // Handle media stream cleanup
    useEffect(() => {
        return () => {
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [localStream]);

    // Socket event handlers
    useEffect(() => {
        const handleIncomingCall = async ({ chatId, callerId, callerName, type }) => {
            console.log('Incoming call from:', callerName);

            showCallNotification({
                callerName,
                chatId,
                callType: type,
                onAccept: async () => {
                    try {
                        // Request media permissions before accepting
                        const stream = await navigator.mediaDevices.getUserMedia({
                            audio: true,
                            video: type === 'video'
                        });
                        setLocalStream(stream);

                        socket.emit('acceptCall', { chatId, callerId });
                        socket.emit('joinCall', { chatId });

                        setCurrentCall({
                            chatId,
                            type,
                            participants: [],
                            isInitiator: false
                        });
                    } catch (err) {
                        console.error('Failed to get media devices:', err);
                        socket.emit('rejectCall', { chatId, callerId });
                    }
                },
                onReject: () => {
                    socket.emit('rejectCall', { chatId, callerId });
                },
            });
        };

        const handleCallAccepted = ({ userId, username }) => {
            console.log('Call accepted by:', username);
            setCurrentCall(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    participants: [...prev.participants, {
                        userId,
                        username,
                        muted: false,
                        videoOff: false
                    }]
                };
            });
        };

        const handleCallRejected = ({ userId, username }) => {
            console.log('Call rejected by:', username);
            // You might want to show a notification here
        };

        const handleParticipantsUpdate = ({ participants }) => {
            setCurrentCall(prev => prev ? {
                ...prev,
                participants: participants.map(p => ({
                    ...p,
                    muted: false,
                    videoOff: false
                }))
            } : null);
        };

        socket.on('incomingCall', handleIncomingCall);
        socket.on('callAccepted', handleCallAccepted);
        socket.on('callRejected', handleCallRejected);
        socket.on('currentParticipants', handleParticipantsUpdate);
        socket.on('userJoined', handleCallAccepted);
        socket.on('userLeft', ({ userId }) => {
            setCurrentCall(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    participants: prev.participants.filter(p => p.userId !== userId)
                };
            });
        });

        return () => {
            socket.off('incomingCall');
            socket.off('callAccepted');
            socket.off('callRejected');
            socket.off('currentParticipants');
            socket.off('userJoined');
            socket.off('userLeft');
        };
    }, [socket]);

    const initiateCall = async (chatId: string, type: 'audio' | 'video'): Promise<boolean> => {
        try {
            // Request media permissions before initiating
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: type === 'video'
            });
            setLocalStream(stream);

            const response = await socket.emitWithAck('initiateCall', { chatId, type });

            if (response.success) {
                socket.emit('joinCall', { chatId });
                setCurrentCall({
                    chatId,
                    type,
                    participants: [],
                    isInitiator: true
                });
                return true;
            }

            // If call initiation failed, cleanup stream
            stream.getTracks().forEach(track => track.stop());
            setLocalStream(null);
            return false;

        } catch (err) {
            console.error('Failed to initiate call:', err);
            return false;
        }
    };

    const leaveCall = () => {
        if (currentCall) {
            socket.emit('leaveCall', { chatId: currentCall.chatId });

            // Cleanup media stream
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
                setLocalStream(null);
            }

            setCurrentCall(null);
        }
    };

    const toggleMute = (userId: string) => {
        setCurrentCall(prev => {
            if (!prev) return null;
            return {
                ...prev,
                participants: prev.participants.map(p =>
                    p.userId === userId ? { ...p, muted: !p.muted } : p
                )
            };
        });
    };

    const toggleVideo = (userId: string) => {
        setCurrentCall(prev => {
            if (!prev) return null;
            return {
                ...prev,
                participants: prev.participants.map(p =>
                    p.userId === userId ? { ...p, videoOff: !p.videoOff } : p
                )
            };
        });
    };

    return (
        <CallContext.Provider value={{
            initiateCall,
            leaveCall,
            isInCall: !!currentCall,
            currentCall,
            toggleMute,
            toggleVideo
        }}>
            {currentCall && (
                <CallInterface
                    chatId={currentCall.chatId}
                    participants={currentCall.participants}
                    callType={currentCall.type}
                    onLeaveCall={leaveCall}
                    localStream={localStream}
                    onToggleMute={toggleMute}
                    onToggleVideo={toggleVideo}
                    isInitiator={currentCall.isInitiator}
                />
            )}
            {children}
        </CallContext.Provider>
    );
};

export const useCall = () => {
    const context = useContext(CallContext);
    if (context === undefined) {
        throw new Error('useCall must be used within a CallProvider');
    }
    return context;
};