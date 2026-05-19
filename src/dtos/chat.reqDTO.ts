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
