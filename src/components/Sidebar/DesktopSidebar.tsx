import DesktopItem from "./DesktopItem";
import { useMemo, useState } from "react";
import Avatar from "../Avatar";
import useRoutes from "../../hooks/useRoutes";
import SettingsModal from "./SettingsModal";
import { useAuth } from "../../providers/AuthProvider";

interface DesktopSidebarProps { }

const DesktopSidebar: React.FC<DesktopSidebarProps> = () => {
    const routes = useRoutes();
    const [isOpen, setIsOpen] = useState(false);
    const { user } = useAuth();

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

    return (
        <>
<SettingsModal 
    isOpen={isOpen} 
    onClose={() => setIsOpen(false)} 
    user={currentUser} 
/>
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
