import { useQuery } from "@tanstack/react-query";
import useCurrentChat from "../../../hooks/useCurrentChat";
import axiosInstance from "../../../utils/axiosInstance";
import { Chat } from "../../../types/chat";


const fetchMessages = async (chatId: string): Promise<Chat> => {
    const response = await axiosInstance.get<Chat>(`/chats/${chatId}`);
    return response.data;
};

const useChatBody = () => {
    const { isOpen, chatId } = useCurrentChat();
    const { data: chatData, isLoading, error } = useQuery<Chat, Error>({
        queryKey: ['chatById', chatId],
        queryFn: () => fetchMessages(chatId),
        staleTime: 1000 * 60 * 5,

    });

    return { isOpen, chatId, chatData, isLoading, error };
};

export default useChatBody;
