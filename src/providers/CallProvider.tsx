import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSocket } from './SocketProvider';
import { showCallNotification } from '../components/CallNotification';
import CallInterface from '../components/CallInterface';

// Types and Interfaces
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

// Socket event payload types
interface IncomingCallPayload {
    chatId: string;
    callerId: string;
    callerName: string;
    type: 'audio' | 'video';
}

interface CallParticipantPayload {
    userId: string;
    username: string;
}

interface CallResponsePayload {
    success: boolean;
    message?: string;
}

interface ParticipantsUpdatePayload {
    participants: Array<{
        userId: string;
        username: string;
    }>;
}

interface UserLeftPayload {
    userId: string;
}

// Notification props type
interface CallNotificationProps {
    callerName: string;
    chatId: string;
    callType: 'audio' | 'video';
    onAccept: () => void;
    onReject: () => void;
}

// Create the context with type safety
const CallContext = createContext<CallContextType | undefined>(undefined);

// Provider component with proper typing
export const CallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { socket } = useSocket();
    const [currentCall, setCurrentCall] = useState<CallState | null>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);

    // Cleanup effect for media streams
    useEffect(() => {
        return () => {
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [localStream]);

    // Socket event handlers with proper typing
    useEffect(() => {
        const handleIncomingCall = async (payload: IncomingCallPayload) => {
            console.log('Incoming call from:', payload.callerName);

            showCallNotification({
                callerName: payload.callerName,
                chatId: payload.chatId,
                callType: payload.type,
                onAccept: async () => {
                    try {
                        const stream = await navigator.mediaDevices.getUserMedia({
                            audio: true,
                            video: payload.type === 'video'
                        });
                        setLocalStream(stream);

                        socket.emit('acceptCall', { 
                            chatId: payload.chatId, 
                            callerId: payload.callerId 
                        });
                        socket.emit('joinCall', { chatId: payload.chatId });

                        setCurrentCall({
                            chatId: payload.chatId,
                            type: payload.type,
                            participants: [],
                            isInitiator: false
                        });
                    } catch (err) {
                        console.error('Failed to get media devices:', err);
                        socket.emit('rejectCall', { 
                            chatId: payload.chatId, 
                            callerId: payload.callerId 
                        });
                    }
                },
                onReject: () => {
                    socket.emit('rejectCall', { 
                        chatId: payload.chatId, 
                        callerId: payload.callerId 
                    });
                },
            });
        };

        const handleCallAccepted = (payload: CallParticipantPayload) => {
            setCurrentCall(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    participants: [...prev.participants, {
                        userId: payload.userId,
                        username: payload.username,
                        muted: false,
                        videoOff: false
                    }]
                };
            });
        };

        const handleParticipantsUpdate = (payload: ParticipantsUpdatePayload) => {
            setCurrentCall(prev => prev ? {
                ...prev,
                participants: payload.participants.map(p => ({
                    ...p,
                    muted: false,
                    videoOff: false
                }))
            } : null);
        };

        // Socket event listeners
        socket.on('incomingCall', handleIncomingCall);
        socket.on('callAccepted', handleCallAccepted);
        socket.on('callRejected', (payload: CallParticipantPayload) => {
            console.log('Call rejected by:', payload.username);
        });
        socket.on('currentParticipants', handleParticipantsUpdate);
        socket.on('userJoined', handleCallAccepted);
        socket.on('userLeft', (payload: UserLeftPayload) => {
            setCurrentCall(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    participants: prev.participants.filter(p => p.userId !== payload.userId)
                };
            });
        });

        // Cleanup function
        return () => {
            socket.off('incomingCall');
            socket.off('callAccepted');
            socket.off('callRejected');
            socket.off('currentParticipants');
            socket.off('userJoined');
            socket.off('userLeft');
        };
    }, [socket]);

    // Call control functions with type safety
    const initiateCall = async (chatId: string, type: 'audio' | 'video'): Promise<boolean> => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: type === 'video'
            });
            setLocalStream(stream);

            const response: CallResponsePayload = await socket.emitWithAck('initiateCall', { chatId, type });

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

// Custom hook with type safety
export const useCall = (): CallContextType => {
    const context = useContext(CallContext);
    if (context === undefined) {
        throw new Error('useCall must be used within a CallProvider');
    }
    return context;
};