import React, { useMemo } from "react";
import EmptyState from "../../../components/EmptyState";
import Header from "./Header";
import MessageForm from "./MessageForm";
import MessageBody from "./MessageBody";
import useChatBody from "../hooks/useChatBody";


// ChatBody.tsx
const ChatBody: React.FC = () => {
    const { chatId, chatData, isLoading, error } = useChatBody();
    const chat = useMemo(() => chatData, [chatData, chatId]);



    if (!chatId) {
        return (
            <div className="lg:pl-80 h-full w-full">
                <div className="flex flex-col h-full">
                    <EmptyState />
                </div>
            </div>
        );
    }

    if (isLoading) return <div className="lg:pl-80 h-full w-full flex items-center justify-center">Loading...</div>;
    if (error) return <div className="lg:pl-80 h-full w-full flex items-center justify-center text-red-500">Error: {error instanceof Error ? error.message : "Unknown error"}</div>;
    if (!chatData) return null;

    return (
        <div className="lg:pl-80 h-full w-full">
            <div className="flex flex-col justify-between flex-1 h-full flex-grow bg-[#DBEAFE] w-full relative">
                {chat && <Header chat={chat} />}
                <MessageBody />
                <MessageForm />
            </div>
        </div>
    );
};

export default ChatBody;