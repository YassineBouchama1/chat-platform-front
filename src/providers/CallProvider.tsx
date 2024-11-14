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
    acceptCall: (callData?: IncomingCall) => void;
    rejectCall: (callData?: IncomingCall) => void;
    endCall: () => void;
    isCallInitiating: boolean;
    activeCall: ActiveCall | null;
    incomingCall: IncomingCall | null;
}

// This context is used to manage call state and handle incoming calls.
const CallContext = createContext<CallContextType | undefined>(undefined);

export const CallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { socket } = useSocket();
    const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
    const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
    const [isCallInitiating, setIsCallInitiating] = useState(false);

    // Function to handle accepting a call
    const handleAcceptCall = async (callData?: IncomingCall) => {
        const data = callData || incomingCall;
        console.log('Accept call:', data);
        if (!data) return;

        try {
            // Request access to the user's media devices
            const constraints: MediaStreamConstraints = {
                audio: true,
                video: data.type === 'video', // Request video only if type is 'video'
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);

            // Notify the caller that the call has been accepted
            socket.emit('acceptCall', {
                chatId: data.chatId,
                callerId: data.callerId,
            });

            // Update the active call state
            setActiveCall({
                type: data.type,
                chatId: data.chatId,
            });

            // Clear the incoming call state
            setIncomingCall(null);
        } catch (error) {
            console.error('Error accepting call:', error);
            toast.error('Failed to accept call: Please check your camera/microphone permissions');


            // Notify the caller that the call was rejected due to permission issues
            socket.emit('rejectCall', {
                chatId: data.chatId,
                callerId: data.callerId,
                reason: 'permission_denied',
            });

            // Clear the incoming call state
            setIncomingCall(null);
        }
    };

    // Function to handle rejecting a call
    const handleRejectCall = (callData?: IncomingCall) => {
        const data = callData || incomingCall;
        if (data) {
            // Notify the caller that the call has been rejected
            socket.emit('rejectCall', {
                chatId: data.chatId,
                callerId: data.callerId,
            });

            // Clear the incoming call state
            setIncomingCall(null);
        }
    };

    // Handle incoming calls and other call-related socket events
    React.useEffect(() => {
        const handleIncomingCall = (data: IncomingCall) => {
            console.log('Incoming call:', data);
            if (activeCall) {
                // If already in an active call, reject the new call
                socket.emit('rejectCall', {
                    chatId: data.chatId,
                    callerId: data.callerId,
                    reason: 'busy',
                });
                return;
            }

            // Set the incoming call data
            setIncomingCall(data);

            // Show call notification with accept and reject options
            toast.custom(
                (t) => (
                    <CallNotification
                        callerName={data.callerName}
                        callType={data.type}
                        onAccept={() => {
                            toast.dismiss(t.id);
                            handleAcceptCall(data);
                        }}
                        onReject={() => {
                            toast.dismiss(t.id);
                            handleRejectCall(data);
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
            toast.error(
                `${data.username} ${data.reason === 'busy' ? 'is busy' : data.reason === 'permission_denied' ? 'cannot accept the call' : 'rejected the call'
                }`
            );
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

        // Register socket event listeners
        socket.on('incomingCall', handleIncomingCall);
        socket.on('callAccepted', handleCallAccepted);
        socket.on('callRejected', handleCallRejected);
        socket.on('callEnded', handleCallEnded);
        socket.on('callError', handleCallError);

        // Cleanup event listeners on unmount
        return () => {
            socket.off('incomingCall', handleIncomingCall);
            socket.off('callAccepted', handleCallAccepted);
            socket.off('callRejected', handleCallRejected);
            socket.off('callEnded', handleCallEnded);
            socket.off('callError', handleCallError);
        };
    }, [socket, activeCall]);

    // Function to initiate a call
    const initiateCall = async (chatId: string, type: 'video' | 'audio') => {
        if (!chatId) return;

        try {
            if (!navigator.mediaDevices?.getUserMedia) {
                throw new Error('Your browser does not support video/audio calls');
            }

            setIsCallInitiating(true);

            // Request access to the user's media devices
            await navigator.mediaDevices.getUserMedia({
                video: type === 'video',
                audio: true,
            });

            // Notify the server to initiate a call
            socket.emit('initiateCall', { chatId, type });

            // Update the active call state
            setActiveCall({ type, chatId });

            toast.success('Initiating call...');
        } catch (error) {
            console.error('Error starting call:', error);
            setIsCallInitiating(false);
            toast.error(error instanceof Error ? error.message : 'Failed to start call');
        }
    };

    // Function to end the current call
    const endCall = () => {
        if (activeCall) {
            // Notify the server that the call has ended
            socket.emit('leaveCall', { chatId: activeCall.chatId });

            // Clear the active call state
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
                incomingCall,
            }}
        >
            {children}
            {/* Render the Call component if there is an active call */}
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

// Custom hook to access the CallContext
export const useCall = () => {
    const context = useContext(CallContext);
    if (!context) {
        throw new Error('useCall must be used within a CallProvider');
    }
    return context;
};