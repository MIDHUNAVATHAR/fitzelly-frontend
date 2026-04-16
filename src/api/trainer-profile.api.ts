import { axiosInstance } from './axios';
import { TRAINER_ROUTES } from '../constants/routes';

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
    qualification?: string;
    address?: string;
    certificates?: string[];
}

export const getTrainerProfile = async (): Promise<TrainerProfile> => {
    const response = await axiosInstance.get(TRAINER_ROUTES.TRAINER_PROFILE);
    return response.data.data;
};

export const updateTrainerProfile = async (
    profileData: Partial<TrainerProfile>
): Promise<TrainerProfile> => {
    const response = await axiosInstance.patch(
        TRAINER_ROUTES.UPDATE_TRAINER_PROFILE,
        profileData
    );
    return response.data.data;
};

export const uploadTrainerProfileImage = async (
    file: File
): Promise<{ profileUrl: string }> => {
    const formData = new FormData();
    formData.append('profilePhoto', file);

    const response = await axiosInstance.post(
        TRAINER_ROUTES.UPLOAD_TRAINER_PROFILE_IMAGE,
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }
    );

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
    const response = await axiosInstance.get(TRAINER_ROUTES.GET_TRAINER_GYM_DETAILS);
    return response.data.data;
};