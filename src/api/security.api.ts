import { axiosInstance } from "./axios";

export interface SessionItem {
    id: string;
    userId: string;
    role: string;
    device: string;
    browser?: string;
    os?: string;
    ip: string;
    lastActive: string;
    isRevoked: boolean;
    isCurrent?: boolean;
    createdAt: string;
}

export const securityApi = {
    getActiveSessions: async () => {
        const response = await axiosInstance.get('/api/security/active-sessions');
        return response.data;
    },
    revokeSession: async (sessionId: string) => {
        const response = await axiosInstance.delete(`/api/security/session/${sessionId}`);
        return response.data;
    }
};
