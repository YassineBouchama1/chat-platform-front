import React, { createContext, useContext, useState } from 'react';
import toast from 'react-hot-toast';
import { useSocket } from './SocketProvider';
import CallNotification from '../features/Call/components/CallNotification';
import Call from '../features/Call/components/Call';

interface ActiveCall {
    type: 'video' | 'audio';
    chatId: string;
}

interface IncomingCall {
    callerId: string;
    callerName: string;
    type: 'video' | 'audio';
    chatId: string;
}

interface CallContextType {
    initiateCall: (chatId: string, type: 'video' | 'audio') => void;
    acceptCall: (chatId: string, callerId: string) => void;
    rejectCall: (chatId: string, callerId: string) => void;
    endCall: () => void;
    isCallInitiating: boolean;
    activeCall: ActiveCall | null;
    incomingCall: IncomingCall | null;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

export const CallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { socket } = useSocket();
    const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
    const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
    const [isCallInitiating, setIsCallInitiating] = useState(false);

    // Handle incoming calls
    React.useEffect(() => {
        const handleIncomingCall = (data: IncomingCall) => {
            console.log('Incoming call:', data);
            if (activeCall) {
                socket.emit('rejectCall', {
                    chatId: data.chatId,
                    callerId: data.callerId,
                    reason: 'busy'
                });
                return;
            }
            setIncomingCall(data);

            // Show call notification
            toast.custom(
                (t) => (
                    <CallNotification
                        callerName={data.callerName}
                        callType={data.type}
                        onAccept={() => {
                            toast.dismiss(t.id);
                            handleAcceptCall();
                        }}
                        onReject={() => {
                            toast.dismiss(t.id);
                            handleRejectCall();
                        }}
                    />
                ),
                {
                    duration: 30000,
                    position: 'top-center',
                }
            );
        };

        const handleCallAccepted = (data: { userId: string; username: string }) => {
            console.log('Call accepted by:', data.username);
            setIsCallInitiating(false);
            toast.success(`${data.username} joined the call`);
        };

        const handleCallRejected = (data: { userId: string; username: string; reason?: string }) => {
            console.log('Call rejected by:', data.username);
            setIsCallInitiating(false);
            setActiveCall(null);
            toast.error(`${data.username} ${data.reason === 'busy' ? 'is busy' : 'rejected the call'}`);
        };

        const handleCallEnded = (data: { userId: string; username: string }) => {
            console.log('Call ended by:', data.username);
            setActiveCall(null);
            toast.success(`${data.username} ended the call`);
        };

        const handleCallError = (error: { message: string }) => {
            console.error('Call error:', error);
            setIsCallInitiating(false);
            setActiveCall(null);
            toast.error(`Call error: ${error.message}`);
        };

        // Socket listeners
        socket.on('incomingCall', handleIncomingCall);
        socket.on('callAccepted', handleCallAccepted);
        socket.on('callRejected', handleCallRejected);
        socket.on('callEnded', handleCallEnded);
        socket.on('callError', handleCallError);

        return () => {
            socket.off('incomingCall', handleIncomingCall);
            socket.off('callAccepted', handleCallAccepted);
            socket.off('callRejected', handleCallRejected);
            socket.off('callEnded', handleCallEnded);
            socket.off('callError', handleCallError);
        };
    }, [socket, activeCall]);

    const initiateCall = async (chatId: string, type: 'video' | 'audio') => {
        if (!chatId) return;

        try {
            if (!navigator.mediaDevices?.getUserMedia) {
                throw new Error('Your browser does not support video/audio calls');
            }

            setIsCallInitiating(true);

            await navigator.mediaDevices.getUserMedia({
                video: type === 'video',
                audio: true,
            });

            socket.emit('initiateCall', { chatId, type });
            setActiveCall({ type, chatId });
            toast.success('Initiating call...');
        } catch (error) {
            console.error('Error starting call:', error);
            setIsCallInitiating(false);
            toast.error(error instanceof Error ? error.message : 'Failed to start call');
        }
    };

    const handleAcceptCall = async () => {
        console.log(incomingCall)
        if (!incomingCall) return;
        console.log('accept call')

        try {
            await navigator.mediaDevices.getUserMedia({
                video: incomingCall.type === 'video',
                audio: true,
            });

            socket.emit('acceptCall', {
                chatId: incomingCall.chatId,
                callerId: incomingCall.callerId,
            });

            setActiveCall({
                type: incomingCall.type,
                chatId: incomingCall.chatId
            });
            setIncomingCall(null);
        } catch (error) {
            console.error('Error accepting call:', error);
            toast.error('Failed to accept call: Please check your camera/microphone permissions');

            socket.emit('rejectCall', {
                chatId: incomingCall.chatId,
                callerId: incomingCall.callerId,
                reason: 'permission_denied'
            });
            setIncomingCall(null);
        }
    };

    const handleRejectCall = () => {
        if (incomingCall) {
            socket.emit('rejectCall', {
                chatId: incomingCall.chatId,
                callerId: incomingCall.callerId,
            });
            setIncomingCall(null);
        }
    };

    const endCall = () => {
        if (activeCall) {
            socket.emit('leaveCall', { chatId: activeCall.chatId });
            setActiveCall(null);
            toast.success('Call ended');
        }
    };

    return (
        <CallContext.Provider
            value={{
                initiateCall,
                acceptCall: handleAcceptCall,
                rejectCall: handleRejectCall,
                endCall,
                isCallInitiating,
                activeCall,
                incomingCall
            }}
        >
            {children}
            {activeCall && (
                <Call
                    chatId={activeCall.chatId}
                    type={activeCall.type}
                    onClose={endCall}
                />
            )}
        </CallContext.Provider>
    );
};

export const useCall = () => {
    const context = useContext(CallContext);
    if (!context) {
        throw new Error('useCall must be used within a CallProvider');
    }
    return context;
};