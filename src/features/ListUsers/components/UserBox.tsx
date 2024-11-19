import { useCallback } from "react";
import { Member } from "../../../types/chat";
import Avatar from "../../../components/Avatar";
import useCreateChat from "../hooks/useCreateChat";
import { IoIosSend } from "react-icons/io";
import { LoaderIcon } from "react-hot-toast";

interface UserBoxProps {
    user: Member;
}

const UserBox: React.FC<UserBoxProps> = ({ user }) => {
    const { isLoading, error, createChat } = useCreateChat();

    const handleClick = useCallback(() => {
        createChat(user._id);
    }, [user, createChat]);

    return (
        <div className="w-full relative flex items-center space-x-3 bg-white p-3">
            <Avatar user={user} />
            <div className="min-w-0 flex-1">
                <div className="focus:outline-none">
                    <span className="absolute inset-0" aria-hidden="true" />
                    <div className="flex justify-between items-center mb-1">
                        <p className="text-sm font-medium text-gray-900">{user.username}</p>
                    </div>
                </div>
            </div>
            <div>
                {isLoading ? (
                    <LoaderIcon className="animate-spin" />
                ) : (
                    <IoIosSend onClick={handleClick} className="w-full relative hover:scale-150 duration-200 text-black rounded-lg cursor-pointer" />
                )}
            </div>
        </div>
    );
};

export default UserBox;