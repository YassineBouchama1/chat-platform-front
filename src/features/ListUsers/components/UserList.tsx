import { useGetUsersQuery } from "../../../services/apis/usersApiSlice";
import UserBox from "./UserBox";




const UserList: React.FC = () => {


    const {
        data: users,
        isLoading,
        error,
        refetch
    } = useGetUsersQuery();

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.toString()}</div>;


    return (
        <aside
            className='
        fixed 
        inset-y-0 
        pb-20
        lg:pb-0
        lg:left-20 
        lg:w-80 
        lg:block
        overflow-y-auto 
        border-r 
        border-gray-200
        block w-full left-0
      '
        >
            <div className='px-5'>
                <div className='flex-col'>
                    <div
                        className='
              text-2xl 
              font-bold 
              text-neutral-800 
              py-4
            '
                    >
                        People
                    </div>
                </div>
                {users && users.map((item) => (
                    <UserBox key={item._id} user={item} />
                ))}
            </div>
        </aside>
    );
};

export default UserList;