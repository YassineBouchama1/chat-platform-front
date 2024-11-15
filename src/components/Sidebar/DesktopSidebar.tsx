import DesktopItem from "./DesktopItem";
import { useEffect, useMemo, useState } from "react";
import Avatar from "../Avatar";
import useRoutes from "../../hooks/useRoutes";
import SettingsModal from "./SettingsModal";
import { useAuth } from "../../providers/AuthProvider";
import { useSocket } from "../../providers/SocketProvider";

interface Notification {
  _id: string;
  message: string;
  recipientId: string;
  createdAt: string;
}
interface DesktopSidebarProps {}
const DesktopSidebar: React.FC<DesktopSidebarProps> = () => {
  const routes = useRoutes();
  const [isOpen, setIsOpen] = useState(false);
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
  return (
    <>
      <SettingsModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
      <div
        className="
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
            "
      >
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
          {/* // here add notifection  */}
          <div className="relative">
            {notifications.length > 0 && (
              <div
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 
                            text-xs flex items-center justify-center"
              >
                {notifications.length}
              </div>
            )}
            <div
              onClick={() => setIsOpen(true)}
              className="cursor-pointer hover:opacity-75 transition"
            >
              {currentUser && <Avatar user={currentUser} />}
            </div>
          </div>
        </nav>
      </div>
    </>
  );
};

export default DesktopSidebar;
