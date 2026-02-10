
import { axiosInstance } from "./axios";

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
}


export const getGymProfile = async () => {  
    const response = await axiosInstance.get('/api/gym/profile');
    return response.data.data;
}

export const updateGymProfile = async (data: Partial<GymProfile>) => {
    const response = await axiosInstance.patch('/api/gym/profile', data);
    return response.data.data;
}

export const uploadGymLogo = async (file: File) => {
    const formData = new FormData();
    formData.append('logo', file);
    const response = await axiosInstance.post('/api/gym/profile/logo', formData);
    return response.data.data;
}

