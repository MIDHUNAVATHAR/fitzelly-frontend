
import { axiosInstance } from "./axios";
import { GYM } from "../constants/routes";


export interface GymProfile {
    logoUrl?: string;
    gymName?: string;
    caption?: string;
    email?: string;
    phoneNumber?: string;
    address?: string;
    description?: string;
    location?: {
        latitude: number;
        longitude: number;
    };
    approvalStatus?: string;
    subscriptionStatus?: string;
    expiryDate?: string
}


export const getGymProfile = async () => {
    const response = await axiosInstance.get(GYM.GET_GYM_PROFILE);
    return response.data.data;
}

export const updateGymProfile = async (data: Partial<GymProfile>) => {
    const response = await axiosInstance.patch(GYM.UPDATE_GYM_PROFILE, data);
    return response.data.data;
}

export const uploadGymLogo = async (file: File) => {
    const formData = new FormData();
    formData.append('logo', file);
    const response = await axiosInstance.post(GYM.UPLOAD_GYM_LOGO, formData);
    return response.data.data;
}

