
import { useQuery } from "@tanstack/react-query";
import { Member } from "../../../types/chat";
import axiosInstance from "../../../utils/axiosInstance";


const fetchUsers = async (): Promise<Member[]> => {
    const response = await axiosInstance.get<Member[]>('/user');
    return response.data;
};






const useListUsers = () => {

    const { data: users, isLoading, error } = useQuery<Member[], Error>({
        queryKey: ['users'],
        queryFn: fetchUsers,
        staleTime: 1000 * 60 * 5,
    });




    return {
        users,
        isLoading,
        error,


    };
};

export default useListUsers;
