

import { axiosInstance } from "./axios";



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
