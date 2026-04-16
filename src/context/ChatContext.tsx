import { createContext, useContext } from 'react';

export interface Message {
    id?: string;
    _id?: string;
    conversationId: string;
    senderId: string;
    receiverId: string;
    content: string;
    type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'call';
    createdAt: string;
}

export interface Conversation {
    id: string;
    participants: string[];
    lastMessage: string;
    updatedAt: string;
    otherUser: {
        id: string;
        name: string;
        avatar: string;
    };
}

export interface CallData {
    from: string;
    to: string;
    callerName?: string;
    name?: string;
    callType: 'video' | 'audio';
    offer?: RTCSessionDescriptionInit;
    answer?: RTCSessionDescriptionInit;
}

export interface ChatContextType {
    messages: Message[];
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
    conversations: Conversation[];
    setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
    sendMessage: (data: Partial<Message>) => void;
    
    // Typing indicators
    typingStatus: Record<string, boolean>;
    sendTypingStatus: (conversationId: string, receiverId: string, isTyping: boolean) => void;
    
    // Call states
    isCalling: boolean;
    isIncomingCall: boolean;
    isCallAccepted: boolean;
    remoteStream: MediaStream | null;
    localStream: MediaStream | null;
    callData: CallData | null;
    initiateCall: (toPlayerId: string, name: string, type: 'video' | 'audio') => void;
    answerCall: () => void;
    endCall: () => void;
    toggleAudio: () => void;
    toggleVideo: () => void;
    isAudioMuted: boolean;
    isVideoOff: boolean;
    deleteMessage: (messageId: string) => Promise<void>;
}

export const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) throw new Error('useChat must be used within ChatProvider');
    return context;
};
