import { Member } from "../types/chat";

interface AvatarGroupProps {
    users?: Member[];
};

const AvatarGroup: React.FC<AvatarGroupProps> = ({
    users = []
}) => {
    const slicedUsers = users.slice(0, 3);

    const positionMap = {
        0: 'top-0 left-[12px]',
        1: 'bottom-0',
        2: 'bottom-0 right-0'
    }

    return (
        <div className="relative h-11 w-11">
            {slicedUsers.map((user, index) => (
                <div
                    key={user._id}
                    className={`
            absolute
            inline-block 
            rounded-full 
            overflow-hidden
            h-[21px]
            w-[21px]
            ${positionMap[index as keyof typeof positionMap]}
          `}>
                    <img
                        className="w-full h-full"
                        src={user?.avatar || '/images/placeholder.jpg'}
                        alt="Avatar"
                    />
                </div>
            ))}
        </div>
    );
}

export default AvatarGroup;