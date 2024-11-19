/* eslint-disable @typescript-eslint/no-empty-object-type */
import DesktopItem from "./DesktopItem";
import { useEffect, useMemo, useState } from "react";
import Avatar from "../Avatar";
import useRoutes from "../../hooks/useRoutes";
import SettingsModal from "./SettingsModal";
import { useAuth } from "../../providers/AuthProvider";
import { useSocket } from "../../providers/SocketProvider";
import NotificationModal from "./NotificationModal";
import { IoIosNotifications } from "react-icons/io";

interface DesktopSidebarProps { }

interface Notification {
    _id: string;
    message: string;
    recipientId: string;
    createdAt: string;
}

const DesktopSidebar: React.FC<DesktopSidebarProps> = () => {
    const routes = useRoutes();
    const [isOpen, setIsOpen] = useState(false);
    const [isOpenNotifecation, setIsOpenNotifecation] = useState(false);
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);


    // Memoize the currentUser data if user exists
    const currentUser = useMemo(() => {
        if (!user) return null;
        return {
            username: user.username,
            avatar: user.avatar,
            email: user.email,
            status: user.status,
            _id: user._id,
        };
    }, [user]);






    // add connection with socktion 
    // const { socket } = useSocket(); use this pre conf of sockt io


    // eslint-disable-next-line react-hooks/exhaustive-deps
    const fetchNotifications = async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/notifications?userId=${user?._id}`
            );
            const data = await response.json();
            setNotifications(data.notifications);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        }
    };

    const { socket } = useSocket();
    useEffect(() => {
        if (!socket || !user) return;

        socket.auth = { userId: user._id };
        socket.connect();

        socket.on("notification", (notification: Notification) => {
            setNotifications((prev) => [notification, ...prev]);
        });
        fetchNotifications();
        return () => {
            socket.off("notification");
            socket.disconnect();
        };
    }, [socket, user]);





    return (
        <>
            <SettingsModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
            <NotificationModal isOpen={isOpenNotifecation} onClose={() => setIsOpenNotifecation(false)} />
            <div className="
                hidden 
                lg:fixed 
                lg:inset-y-0 
                lg:left-0 
                lg:z-40 
                lg:w-20 
                xl:px-6
                lg:overflow-y-auto 
                lg:bg-white 
                lg:border-r-[1px]
                lg:pb-4
                lg:flex
                lg:flex-col
                justify-between
            ">
                <nav className="mt-4 flex flex-col justify-between">
                    <ul role="list" className="flex flex-col items-center space-y-1">
                        {routes.map((item) => (
                            <DesktopItem
                                key={item.label}
                                href={item.href}
                                label={item.label}
                                icon={item.icon}
                                active={item.active}
                                onClick={item.onClick}
                            />
                        ))}
                    </ul>
                </nav>
                <nav className="mt-4 flex flex-col justify-between items-center">
                    <div
                        onClick={() => setIsOpenNotifecation(true)}
                        className="cursor-pointer hover:opacity-75 transition"
                    >
                        <div className="relative inline-flex w-fit">
                            <div
                                className="absolute bottom-auto left-auto right-0 top-0 z-10 inline-block -translate-y-1/2 translate-x-2/4 rotate-0 skew-x-0 skew-y-0 scale-x-100 scale-y-100 whitespace-nowrap rounded-full bg-indigo-700 px-2.5 py-1 text-center align-baseline text-xs font-bold leading-none text-white">
                                {notifications && notifications?.length || 99}
                            </div>

                            <IoIosNotifications className=" text-gray-500 
            hover:text-black 
            hover:bg-gray-100" size={40} />

                        </div>

                    </div>

                    {/* // here add notifection  */}
                    <div
                        onClick={() => setIsOpen(true)}
                        className="cursor-pointer hover:opacity-75 transition"
                    >
                        {currentUser && <Avatar user={currentUser} />}

                    </div>
                </nav>
            </div>
        </>
    );
}

export default DesktopSidebar;
