
import { HiChevronLeft } from 'react-icons/hi'
import { HiEllipsisHorizontal } from 'react-icons/hi2';
import { useMemo, useState } from "react";
import { Chat } from '../../../dummyData/chats';
import { User } from '../../../dummyData/users';
import useOtherUser from '../../../hooks/useOtherUser';
import ProfileDrawer from '../../../components/ProfileDrawer';
import { Link } from 'react-router-dom';
import AvatarGroup from '../../../components/AvatarGroup';
import Avatar from '../../../components/Avatar';



interface HeaderProps {
    chat: Chat & {
        users: User[]
    }
}

const Header: React.FC<HeaderProps> = ({ chat }) => {
    const otherUser = useOtherUser(chat);
    const [drawerOpen, setDrawerOpen] = useState(false);


    const statusText = useMemo(() => {
        if (chat.isGroup) {
            return `${chat.users.length} members`;
        }

        return 'Active'
    }, [chat]);

    return (
        <>
            <ProfileDrawer
                data={chat}
                isOpen={drawerOpen}
                onClose={() => setDrawerOpen(false)}
            />
            <div
                className="
        bg-white 
        w-full 
        flex 
        border-b-[1px] 
        sm:px-4 
        py-3 
        px-4 
        lg:px-6 
        justify-between 
        items-center 
        shadow-sm
      "
            >
                <div className="flex gap-3 items-center">
                    <Link
                        to="/chat"
                        className="
            lg:hidden 
            block 
            text-sky-500 
            hover:text-sky-600 
            transition 
            cursor-pointer
          "
                    >
                        <HiChevronLeft size={32} />
                    </Link>
                    {chat.isGroup ? (
                        <AvatarGroup users={chat.users} />
                    ) : (
                        <Avatar user={otherUser} />
                    )}
                    <div className="flex flex-col">
                        <div>{chat.name || otherUser?.name}</div>
                        <div className="text-sm text-gray-500">{statusText}</div>
                    </div>
                </div>
                <HiEllipsisHorizontal
                    size={32}
                    onClick={() => setDrawerOpen(true)}
                    className="
          text-sky-500
          cursor-pointer
          hover:text-sky-600
          transition
        "
                />
            </div>
        </>
    );
}

export default Header;