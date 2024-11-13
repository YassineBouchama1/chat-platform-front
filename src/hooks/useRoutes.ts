import { useMemo } from "react";
import { HiChat, HiUsers } from 'react-icons/hi';
import { IconType } from "react-icons";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import { FiLogOut } from "react-icons/fi";

// Define the Route interface
interface Route {
    label: string;
    href: string;
    icon: IconType;
    active?: boolean;
    onClick?: () => void;
}

// Custom hook for routes
const useRoutes = (): Route[] => {


    const { logout } = useAuth()
    const navigate = useNavigate();
    const location = useLocation();
    const pathname = location.pathname;

    // function onLogout() {
    //     logout()
    //     navigate('/auth')
    // }

    const routes: Route[] = useMemo(
        () => [
            {
                label: 'Chat',
                href: '/chat',
                icon: HiChat,
                active: pathname === '/chat',
            },
            {
                label: 'Users',
                href: '/Users',
                icon: HiUsers,
                active: pathname === '/Users',
            },
            {
                label: 'Logout',
                href: '#',
                icon: FiLogOut,
                onClick: logout,
            },
        ],
        [pathname]
    );

    return routes;
};

export default useRoutes;
