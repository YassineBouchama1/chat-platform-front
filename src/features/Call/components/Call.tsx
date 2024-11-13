import React, { useRef, useState } from 'react';
import { FaExpandAlt, FaCompress } from 'react-icons/fa';
import CallControls from './CallControls';
import ParticipantGrid from './ParticipantGrid';
import ConnectedUsers from './ConnectedUsers';
import { useWebRTC } from '../../../hooks/useWebRTC';


interface CallProps {
    chatId: string;
    type: 'video' | 'audio';
    onClose: () => void;
}

const Call: React.FC<CallProps> = ({ chatId, type, onClose }) => {
    const [isFullScreen, setIsFullScreen] = useState(false);
    const callContainerRef = useRef<HTMLDivElement>(null);

    const {
        participants,
        isConnecting,
        isMuted,
        isVideoOff,
        toggleAudio,
        toggleVideo,
        leaveCall,
    } = useWebRTC(chatId, type);

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            callContainerRef.current?.requestFullscreen();
            setIsFullScreen(true);
        } else {
            document.exitFullscreen();
            setIsFullScreen(false);
        }
    };


    const handleClose = () => {
        leaveCall();
        onClose();
    };

    return (
        <div
            ref={callContainerRef}
            className={`fixed inset-0 bg-gray-900 flex flex-col ${isFullScreen ? 'z-50' : 'z-40'
                }`}
        >
            {/* Header */}
            <div className="flex justify-between items-center p-4 bg-gray-800">
                <h2 className="text-white text-lg font-semibold">
                    {type.charAt(0).toUpperCase() + type.slice(1)} Call
                </h2>
                <button
                    onClick={toggleFullScreen}
                    className="text-white hover:text-gray-300 transition-colors"
                >
                    {isFullScreen ? <FaCompress size={20} /> : <FaExpandAlt size={20} />}
                </button>
            </div>

            {/* Main content */}
            <div className="flex-1 flex overflow-hidden">
                <div className="flex-1 relative">
                    {isConnecting && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
                            <div className="text-white text-xl">Connecting...</div>
                        </div>
                    )}
                    <ParticipantGrid
                        participants={participants}
                        type={type}
                    />
                </div>
                <div className="w-80 bg-gray-800 p-4 overflow-y-auto">
                    <ConnectedUsers
                        participants={participants}
                        type={type}
                    />
                </div>
            </div>

            {/* Controls */}
            <div className="p-4 bg-gray-800">
                <CallControls
                    isVideo={type === 'video'}
                    isMuted={isMuted}
                    isVideoOff={isVideoOff}
                    onToggleAudio={toggleAudio}
                    onToggleVideo={toggleVideo}
                    onClose={handleClose}
                />
            </div>
        </div>
    );
};

export default Call;