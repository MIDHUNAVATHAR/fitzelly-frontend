import { axiosInstance } from "./axios";
import { SECURITY } from "../constants/routes";


export const securityApi = {
    getActiveSessions: async () => {
        const response = await axiosInstance.get( SECURITY.GET_ACTIVE_SESSIONS );
        return response.data;
    },

    revokeSession: async (sessionId: string) => {
        const response = await axiosInstance.delete( SECURITY.REVOKE_SESSION(sessionId));
        return response.data;
    },
};