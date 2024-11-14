
import { useGetUsersQuery } from '../../../services/apis/usersApiSlice';

const useListUsers = () => {
    const {
        data: users,
        isLoading,
        error,
        refetch
    } = useGetUsersQuery();



    return {
        users,
        isLoading,
        error,
        refetch
    };
};

export default useListUsers;