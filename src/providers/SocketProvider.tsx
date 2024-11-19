import React, { createContext, useContext, useEffect, useState } from 'react';
import socket from '../utils/socket';
import { useAuth } from '../providers/AuthProvider';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

interface SocketContextType {
    socket: typeof socket;
    onlineUsers: Set<string>;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);
//this is the config socketion 
export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
    const { token, user } = useAuth();
    const queryClient = useQueryClient();


    useEffect(() => {
        if (token && user) {
            // Initialize socket connection
            socket.auth = { token };
            socket.connect();

            // Connection events 
            socket.on('connect', () => {
                setIsConnected(true);
                console.log('Connected to socket server');
            });

            socket.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
                setIsConnected(false);
            });

            // User status events we listn if user connected or not
            socket.on('userConnected', (data) => {
                console.log('conected')
                setOnlineUsers(prev => new Set(prev).add(data.userId));
                queryClient.invalidateQueries({ queryKey: ['chat-members'] });
                queryClient.invalidateQueries({ queryKey: ['chats'] });
                toast.success(`${data.username} is now online`, {
                    position: 'bottom-right',
                    duration: 3000,
                });
            });

            //we listn if user Disconnected or not
            socket.on('userDisconnected', (data) => {
                setOnlineUsers(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(data.userId);
                    return newSet;
                });
                queryClient.invalidateQueries({ queryKey: ['chat-members'] });
                queryClient.invalidateQueries({ queryKey: ['chats'] });
                toast(`${data.username} is now offline`, {
                    position: 'bottom-right',
                    duration: 3000,
                });
            });

            // Initial online users
            socket.on('onlineUsers', (users) => {
                setOnlineUsers(new Set(users.map((u: { userId: string; }) => u.userId)));
            });


            // Call notifications
            // TODO : Here add notifcation litner
        }

        return () => {
            socket.off('connect');
            socket.off('connect_error');
            socket.off('userConnected');
            socket.off('userDisconnected');
            socket.off('onlineUsers');
            // socket.off('notification'); // call it here
            socket.disconnect();
        };
    }, [token, user, queryClient]);

    return (
        <SocketContext.Provider value={{ socket, onlineUsers, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};