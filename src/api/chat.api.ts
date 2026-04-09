import { axiosInstance } from "./axios";
import { CHAT } from "../constants/routes";

export const getConversations = async () => {
    const response = await axiosInstance.get(CHAT.CONVERSATIONS);
    return response.data.data;
};

export const getConversationWithUser = async (otherId: string) => {
    const response = await axiosInstance.get(CHAT.CONVERSATION_WITH_USER(otherId));
    return response.data.data;
};

export const getMessages = async (conversationId: string) => {
    const response = await axiosInstance.get(CHAT.MESSAGES_BY_CONV(conversationId));
    return response.data.data;
};

export const sendMessage = async (data: any) => {
    const response = await axiosInstance.post(CHAT.SEND_MESSAGE, data);
    return response.data.data;
};

export const markAsRead = async (conversationId: string) => {
    const response = await axiosInstance.patch(CHAT.MARK_AS_READ(conversationId));
    return response.data;
};
