import React, { useEffect, useState } from 'react';
import { FaWifi } from 'react-icons/fa';

interface NetworkStatusProps {
    peerConnection: RTCPeerConnection | undefined;
}

const NetworkStatus: React.FC<NetworkStatusProps> = ({ peerConnection }) => {
    const [quality, setQuality] = useState<'good' | 'medium' | 'poor'>('good');
    const [latency, setLatency] = useState<number>(0);

    if (!peerConnection) return <div>Error on NetworkStatus</div>
    useEffect(() => {
        const interval = setInterval(async () => {
            const stats = await peerConnection.getStats();
            stats.forEach(report => {
                if (report.type === 'candidate-pair' && report.state === 'succeeded') {
                    const rtt = report.currentRoundTripTime;
                    setLatency(Math.round(rtt * 1000)); // Convert to ms
                    if (rtt < 0.1) setQuality('good');
                    else if (rtt < 0.3) setQuality('medium');
                    else setQuality('poor');
                }
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [peerConnection]);

    const getStatusColor = () => {
        switch (quality) {
            case 'good': return 'text-green-500';
            case 'medium': return 'text-yellow-500';
            case 'poor': return 'text-red-500';
            default: return 'text-gray-500';
        }
    };

    return (
        <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/50 rounded-full px-4 py-2">
            <FaWifi className={getStatusColor()} />
            <span className="text-white text-sm">
                {quality.charAt(0).toUpperCase() + quality.slice(1)}
                {latency > 0 && ` (${latency}ms)`}
            </span>
        </div>
    );
};

export default NetworkStatus;