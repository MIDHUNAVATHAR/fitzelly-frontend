import { type WeightLog } from "../dtos/health-tracking.resDTO";

import { axiosInstance } from "./axios";



export const healthTrackingApi = {
    addWeightLog: async (log: WeightLog) => {
        const response = await axiosInstance.post("/api/client/weight-log", log);
        return response.data;
    },
    getWeightHistory: async () => {
        const response = await axiosInstance.get("/api/client/weight-history");

        return response.data; 
    }
};
