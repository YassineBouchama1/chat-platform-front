
import { HiChevronLeft } from 'react-icons/hi'
import { HiEllipsisHorizontal } from 'react-icons/hi2';
import { useMemo, useState } from "react";

import useOtherUser from '../../../hooks/useOtherUser';
import ProfileDrawer from '../../../components/ProfileDrawer';
import { Link } from 'react-router-dom';
import AvatarGroup from '../../../components/AvatarGroup';
import Avatar from '../../../components/Avatar';
import { Chat } from '../../../types/chat';
import { FaPhone, FaSearch, FaVideo } from 'react-icons/fa';

import toast from 'react-hot-toast';
import { useCall } from '../../../providers/CallProvider';
import useCurrentChat from '../../../hooks/useCurrentChat';




interface HeaderProps {
    chat: Chat
}

const Header: React.FC<HeaderProps> = ({ chat }) => {
    const { initiateCall } = useCall();
    const otherUser = useOtherUser(chat.members);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const { chatId } = useCurrentChat()

    if (!chat._id) return toast.error('chat id required')




    const statusText = useMemo(() => {
        if (chat.isGroup) {
            return `${chat.members.length} members`;
        }

        return 'Active'
    }, [chat]);

    return (
        <>
            <ProfileDrawer
                chat={chat}
                isOpen={drawerOpen}
                onClose={() => setDrawerOpen(false)}
            />


            <div
                className="
        bg-white 
        w-full 
   
        flex 
        border-b-[1px] 
        z-30
        sm:px-4 
        py-3 
        px-4 
        lg:px-6 
        static
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
                        <AvatarGroup users={chat.members} />
                    ) : (
                        <Avatar user={otherUser} />
                    )}
                    <div className="flex flex-col">
                        <div>{chat.name || otherUser?.username}</div>
                        <div className="text-sm text-gray-500">{statusText}</div>
                    </div>
                </div>
                <div className="flex items-center gap-4">


                    <button
                        onClick={() => initiateCall(chatId, 'audio')}

                    >
                        <FaPhone />
                    </button>


                    <button
                        onClick={() => initiateCall(chatId, 'video')}

                    >
                        <FaVideo />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                        <FaSearch className="w-5 h-5 text-gray-600" />
                    </button>

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

            </div >

        </>
    );
}

export default Header;