import { axiosInstance } from './axios';

export interface TrainerProfile {
    id?: string;
    gymId?: string;
    fullName?: string;
    email?: string;
    phoneNumber?: string;
    specialization?: string;
    salary?: string;
    dateOfBirth?: string;
    profileUrl?: string;
    joinedDate?: string;
}

export const getTrainerProfile = async (): Promise<TrainerProfile> => {
    const response = await axiosInstance.get('/api/trainer/profile');
    return response.data.data;
};

export const updateTrainerProfile = async (profileData: Partial<TrainerProfile>): Promise<TrainerProfile> => {
    const response = await axiosInstance.patch('/api/trainer/profile', profileData);
    return response.data.data;
};

export const uploadTrainerProfileImage = async (file: File): Promise<{ profileUrl: string }> => {
    const formData = new FormData();
    formData.append('profilePhoto', file);

    const response = await axiosInstance.post('/api/trainer/profile/image', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data.data;
};

export interface GymProfile {
    id?: string;
    gymName?: string;
    email?: string;
    phoneNumber?: string;
    address?: string;
    description?: string;
    caption?: string;
    logoUrl?: string;
}

export const getTrainerGymDetails = async (): Promise<GymProfile> => {
    const response = await axiosInstance.get('/api/trainer/gym-details');
    return response.data.data;
};
