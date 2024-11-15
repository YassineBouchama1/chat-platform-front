
import React from 'react';
import toast from 'react-hot-toast'; // Make sure to install react-hot-toast

interface CallNotificationProps {
  callerName: string;
  chatId: string;
  callType: 'audio' | 'video';
  onAccept: () => void;
  onReject: () => void;
}

export const showCallNotification = ({
  callerName,
  chatId,
  callType,
  onAccept,
  onReject,
}: CallNotificationProps) => {
  toast.custom(
    (t) => (
      <div className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">
                Incoming {callType} call
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {callerName} is calling you
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-gray-200">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              onAccept();
            }}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-green-600 hover:text-green-500 focus:outline-none"
          >
            Accept
          </button>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              onReject();
            }}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-red-600 hover:text-red-500 focus:outline-none"
          >
            Reject
          </button>
        </div>
      </div>
    ),
    {
      duration: 30000, // 30 seconds
      position: 'top-center',
    }
  );
};