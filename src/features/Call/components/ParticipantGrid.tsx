import React from 'react';
import { FaMicrophoneSlash, FaVideoSlash } from 'react-icons/fa';
import socket from '../../../utils/socket';

interface Participant {
    userId: string;
    username: string;
    stream?: MediaStream;
    muted: boolean;
    videoOff: boolean;
}

interface ParticipantGridProps {
    participants: Map<string, Participant>;
    type: 'video' | 'audio';
}

const ParticipantGrid: React.FC<ParticipantGridProps> = ({ participants, type }) => {

    console.log(participants);
    const numParticipants = participants.size;

    // Determine the number of columns based on the number of participants
    const numCols = numParticipants <= 2 ? 1 :
        numParticipants <= 4 ? 2 : 3;

    const gridTemplateColumns = `repeat(${numCols}, minmax(0, 1fr))`;

    const containerStyle: React.CSSProperties = {
        display: 'grid',
        gridTemplateColumns,
        gap: '1rem',
        width: '100%',
        maxWidth: '72rem',
        marginLeft: 'auto',
        marginRight: 'auto',
    };

    return (
        <div style={containerStyle}>
            {Array.from(participants.values()).map((participant) => {
                const participantStyle: React.CSSProperties = {
                    position: 'relative',
                    aspectRatio: '16 / 9',
                    backgroundColor: '#111827',
                    borderRadius: '0.5rem',
                    overflow: 'hidden',
                };

                return (
                    <div key={participant.userId} style={participantStyle}>
                        {type === 'video' && !participant.videoOff ? (
                            <video
                                ref={el => {
                                    if (el && participant.stream) {
                                        el.srcObject = participant.stream;
                                        // Needed to prevent the video from freezing
                                        el.play().catch(error => console.error('Error playing video:', error));
                                    }
                                }}
                                autoPlay
                                playsInline
                                muted={participant.userId === socket.id ? true : participant.muted}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                }}
                            />
                        ) : (
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                bottom: 0,
                                left: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <div style={{
                                    width: '5rem',
                                    height: '5rem',
                                    borderRadius: '9999px',
                                    backgroundColor: '#374151',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    <span style={{
                                        fontSize: '1.5rem',
                                        color: '#ffffff',
                                    }}>
                                        {participant.username[0].toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Participant info overlay */}
                        <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            padding: '0.75rem',
                            backgroundImage: 'linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent)',
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                            }}>
                                <span style={{
                                    color: '#ffffff',
                                    fontWeight: 500,
                                }}>
                                    {participant.username}
                                </span>
                                <div style={{
                                    display: 'flex',
                                    gap: '0.5rem',
                                }}>
                                    {participant.muted && (
                                        <FaMicrophoneSlash style={{ color: '#ef4444' }} />
                                    )}
                                    {type === 'video' && participant.videoOff && (
                                        <FaVideoSlash style={{ color: '#ef4444' }} />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ParticipantGrid;