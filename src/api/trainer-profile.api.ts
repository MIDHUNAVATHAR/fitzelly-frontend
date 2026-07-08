import { type TrainerProfile, type GymProfile } from '../dtos/trainer-profile.resDTO';
import { axiosInstance } from './axios';
import { TRAINER_ROUTES } from '../constants/routes';


export const getTrainerProfile = async (): Promise<TrainerProfile> => {
    const response = await axiosInstance.get(TRAINER_ROUTES.TRAINER_PROFILE);
    return response.data.data;
};

export const updateTrainerProfile = async (  profileData: Partial<TrainerProfile>): Promise<TrainerProfile> => {
    const response = await axiosInstance.patch( TRAINER_ROUTES.UPDATE_TRAINER_PROFILE, profileData);
    return response.data.data;
};

export const uploadTrainerProfileImage = async (file: File): Promise<{ profileUrl: string }> => {
    const formData = new FormData();
    formData.append('profilePhoto', file);

    const response = await axiosInstance.post(TRAINER_ROUTES.UPLOAD_TRAINER_PROFILE_IMAGE,
        formData,
        {
            headers: {  'Content-Type': 'multipart/form-data',},
        }
    );
    return response.data.data;
};



export const getTrainerGymDetails = async (): Promise<GymProfile> => {
    const response = await axiosInstance.get(TRAINER_ROUTES.GET_TRAINER_GYM_DETAILS);
    return response.data.data;
};