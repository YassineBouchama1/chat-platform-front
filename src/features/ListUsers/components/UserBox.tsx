import { useCallback, useState } from "react";
import { Member } from "../../../types/chat";
import { useNavigate } from "react-router-dom";
import Avatar from "../../../components/Avatar";


interface UserBoxProps {
    user: Member
}

const UserBox: React.FC<UserBoxProps> = ({
    user
}) => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);


    
    const handleClick = useCallback(() => {
        setIsLoading(true);


        // create conversation between them
    }, [user, navigate]);

    return (
        <>
            {isLoading && (
                <div>loading users</div>
            )}
            <div
                onClick={handleClick}
                className="
          w-full 
          relative 
          flex 
          items-center 
          space-x-3 
          bg-white 
          p-3 
          hover:bg-neutral-100
          rounded-lg
          transition
          cursor-pointer
        "
            >
                <Avatar user={user} />
                <div className="min-w-0 flex-1">
                    <div className="focus:outline-none">
                        <span className="absolute inset-0" aria-hidden="true" />
                        <div className="flex justify-between items-center mb-1">
                            <p className="text-sm font-medium text-gray-900">
                                {user.username}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default UserBox;