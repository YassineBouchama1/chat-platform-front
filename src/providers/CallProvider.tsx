// providers/CallProvider.tsx
import React, { createContext, useContext, useState } from 'react';
import { useSocket } from './SocketProvider';
import { showCallNotification } from '../components/CallNotification';
import CallInterface from '../components/CallInterface';

interface CallContextType {
  initiateCall: (chatId: string, type: 'audio' | 'video') => void;
  leaveCall: () => void;
  isInCall: boolean;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

export const CallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { socket } = useSocket();
  const [currentCall, setCurrentCall] = useState<{
    chatId: string;
    type: 'audio' | 'video';
    participants: Array<{
      userId: string;
      username: string;
      muted: boolean;
      videoOff: boolean;
    }>;
  } | null>(null);

  // Handle incoming calls
  React.useEffect(() => {
    socket.on('incomingCall', ({ chatId, callerId, callerName, type }) => {
      showCallNotification({
        callerName,
        chatId,
        callType: type,
        onAccept: () => {
          socket.emit('acceptCall', { chatId, callerId });
          setCurrentCall({ chatId, type, participants: [] });
        },
        onReject: () => {
          socket.emit('rejectCall', { chatId, callerId });
        },
      });
    });

    socket.on('currentParticipants', ({ participants }) => {
      setCurrentCall(prev => prev ? { ...prev, participants } : null);
    });

    socket.on('userJoinedCall', ({ userId, username }) => {
      setCurrentCall(prev => {
        if (!prev) return null;
        return {
          ...prev,
          participants: [...prev.participants, { userId, username, muted: false, videoOff: false }],
        };
      });
    });

    socket.on('userLeftCall', ({ userId }) => {
      setCurrentCall(prev => {
        if (!prev) return null;
        return {
          ...prev,
          participants: prev.participants.filter(p => p.userId !== userId),
        };
      });
    });

    return () => {
      socket.off('incomingCall');
      socket.off('currentParticipants');
      socket.off('userJoinedCall');
      socket.off('userLeftCall');
    };
  }, [socket]);

  const initiateCall = (chatId: string, type: 'audio' | 'video') => {
    socket.emit('initiateCall', { chatId, type });
    setCurrentCall({ chatId, type, participants: [] });
  };

  const leaveCall = () => {
    if (currentCall) {
      socket.emit('leaveCall', { chatId: currentCall.chatId });
      setCurrentCall(null);
    }
  };

  return (
    <CallContext.Provider value={{ initiateCall, leaveCall, isInCall: !!currentCall }}>
      {currentCall && (
        <CallInterface
          chatId={currentCall.chatId}
          participants={currentCall.participants}
          callType={currentCall.type}
          onLeaveCall={leaveCall}
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