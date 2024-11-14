import { useState } from "react";
import useCurrentChat from "../../../hooks/useCurrentChat";
import { useQuery } from "@tanstack/react-query";
import { Chat, ChatResponse } from "../../../types/chat";
import axiosInstance from "../../../utils/axiosInstance";

const fetchChats = async (): Promise<Chat[]> => {
    const response = await axiosInstance.get<ChatResponse>('/chats');
    return response.data;
};






const useChatList = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data: chats, isLoading, error } = useQuery<Chat[], Error>({
        queryKey: ['chats'],
        queryFn: fetchChats,
        staleTime: 1000 * 60 * 5,
    });
    const { chatId, isOpen } = useCurrentChat();

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    return {
        chats,
        isLoading,
        error,
        chatId,
        isOpen,
        isModalOpen,
        openModal,
        closeModal,

    };
};

export default useChatList;
