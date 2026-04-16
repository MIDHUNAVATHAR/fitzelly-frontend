import { axiosInstance } from "./axios";
import { CHAT } from "../constants/routes";

export interface MessageUpdate {
    conversationId: string;
    receiverId: string;
    content: string;
    type: string;
}

export interface CallHistorySave {
    callerId: string;
    receiverId: string;
    conversationId: string;
    type: 'video' | 'audio';
    status: string;
    duration: number;
    startTime: Date;
    endTime: Date;
}

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

export const sendMessage = async (data: MessageUpdate) => {
    const response = await axiosInstance.post(CHAT.SEND_MESSAGE, data);
    return response.data.data;
};

export const markAsRead = async (conversationId: string) => {
    const response = await axiosInstance.patch(CHAT.MARK_AS_READ(conversationId));
    return response.data;
};

export const getCallHistory = async () => {
    const response = await axiosInstance.get(CHAT.CALL_HISTORY);
    return response.data.data;
};

export const saveCallHistory = async (data: CallHistorySave) => {
    const response = await axiosInstance.post(CHAT.SAVE_CALL_HISTORY, data);
    return response.data.data;
};

export const uploadAttachment = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosInstance.post(CHAT.UPLOAD_ATTACHMENT, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data; // { url: '...' }
};

export const deleteChatMessage = async (messageId: string) => {
    const response = await axiosInstance.delete(`/api/chat/messages/${messageId}`);
    return response.data;
};



