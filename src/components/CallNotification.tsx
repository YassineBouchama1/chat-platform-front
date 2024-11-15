import React from 'react';
import toast from 'react-hot-toast';

interface CallNotificationProps {
  callerName: string;
  chatId: string;
  callType: 'audio' | 'video';
  onAccept: () => void;
  onReject: () => void;
}

const CallNotification: React.FC<CallNotificationProps> = ({
  callerName,
  callType,
  onAccept,
  onReject,
}) => {
  return (
    <div className="flex flex-col p-4 bg-white rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold">
        Incoming {callType} call from {callerName}
      </h3>
      <div className="flex gap-2 mt-3">
        <button
          onClick={onAccept}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Accept
        </button>
        <button
          onClick={onReject}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Reject
        </button>
      </div>
    </div>
  );
};

export const showCallNotification = (props: CallNotificationProps) => {
  return toast.custom((t) => <CallNotification {...props} />, {
    duration: 30000,
    position: 'top-center',
  });
};