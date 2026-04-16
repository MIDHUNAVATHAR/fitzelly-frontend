
import { axiosInstance } from "./axios";
import { GYM } from "../constants/routes";


export interface IGymCertificate {
    url: string;
    type: 'IMAGE' | 'PDF';
    name: string;
    key: string;
}

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
    startDate?: string;
    expiryDate?: string;
    paymentMethod?: string;
    planName?: string;
    amount?: number;
    certificates?: IGymCertificate[];
    rejectionReason?: string;
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

export const uploadGymCertificate = async (file: File, name: string) => {
    const formData = new FormData();
    formData.append('certificate', file);
    formData.append('name', name);
    const response = await axiosInstance.post(GYM.UPLOAD_GYM_CERTIFICATE, formData);
    return response.data.data;
}

export const deleteGymCertificate = async (key: string) => {
    const response = await axiosInstance.delete(GYM.DELETE_GYM_CERTIFICATE, { data: { key } });
    return response.data.data;
}

export const reApplyGym = async () => {
    const response = await axiosInstance.post(GYM.RE_APPLY);
    return response.data;
}

