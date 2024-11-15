import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useCurrentChat from "../../../hooks/useCurrentChat";
import axiosInstance from "../../../utils/axiosInstance";
import { MessageResponse } from "../../../types/message";
import toast from "react-hot-toast";


// Send a message to a specific chat
const sendMessage = async ({ chatId, content }: { chatId: string; content: string }): Promise<MessageResponse> => {
    const response = await axiosInstance.post<MessageResponse>(`/messages/${chatId}`, { content });
    return response.data;
};

// ustom hook to manage messages and sending functionality
const useMessageActions = () => {
    const { isOpen, chatId } = useCurrentChat();
    const queryClient = useQueryClient();

    // Send message mutation
    const sendMsgMutation = useMutation({
        mutationFn: (content: string) => sendMessage({ chatId, content }),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['chat-messages', chatId] });
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    return { isOpen, chatId, loadingSending: sendMsgMutation.isPending, errorSending: sendMsgMutation.error, sendMsgMutation: sendMsgMutation.mutate };
};

export default useMessageActions;
