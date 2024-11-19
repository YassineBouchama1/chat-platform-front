import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../../utils/axiosInstance";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Chat } from "../../../types/chat";

const createChat = async ({ memberId }: { memberId: string }): Promise<Chat> => {


    const response = await axiosInstance.post<Chat>(`/chats`, { members: [memberId], startConversation: true });
    return response.data;
};

const useCreateChat = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();




    const createChatMutation = useMutation({
        mutationFn: (memberId: string) => createChat({ memberId }),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['chats'] });
            navigate(`/chat/${data._id}`)
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });


    return { isLoading: createChatMutation.isPending, error: createChatMutation.error, createChat: createChatMutation.mutate };
};

export default useCreateChat;