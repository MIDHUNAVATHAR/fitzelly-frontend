import { type WeightLog } from "../dtos/health-tracking.resDTO";
import { CLIENT } from "../constants/routes";
import { axiosInstance } from "./axios";



export const healthTrackingApi = {
    addWeightLog: async (log: WeightLog) => {
        const { data } = await axiosInstance.post(   CLIENT.WEIGHT_LOG,log);
        return data;
    },

    getWeightHistory: async () => {
        const { data } = await axiosInstance.get( CLIENT.WEIGHT_HISTORY);
        return data.data;
    },
};

