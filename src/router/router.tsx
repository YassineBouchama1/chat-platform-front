import { createBrowserRouter, Navigate } from 'react-router-dom';
import Auth from '../pages/Auth';
import MainLayout from '../layouts/MainLayout';
import ProtectedRoute from '../components/ProtectedRoute';

import ChatList from '../features/chats/components/ChatList';
import UserList from '../features/ListUsers/components/UserList';

export const router = createBrowserRouter([
    {
        path: '/auth',
        element: <Auth />,
    },
    {
        path: '/',
        element: <ProtectedRoute />, // wrapp page with ProtectedRoute if you want user should be authed

        children: [
            {
                element: <MainLayout />,
                children: [
                    {
                        index: true,
                        element: <Navigate to="/chat" />, // automaticly open  chat list
                    },
                    {
                        path: 'chat/:chatId?',
                        element: <ChatList



                        />,
                    },

                    {
                        path: 'Users',
                        element: <UserList />,
                    },
                ],
            },
        ],
    },
]);