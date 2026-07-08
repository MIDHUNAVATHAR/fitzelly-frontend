import { type ClientProfile, type ClientMembership, type GymProfile } from '../dtos/client-profile.resDTO';
import { CLIENT, } from '../constants/routes';
import { axiosInstance } from './axios';



export const getClientProfile = async (): Promise<{ profile: ClientProfile; membership: ClientMembership | null }> => {
    const response = await axiosInstance.get(CLIENT.GET_PROFILE);
    return response.data.data;
};

export const updateClientProfile = async (profileData: Partial<ClientProfile>): Promise<ClientProfile> => {
    const response = await axiosInstance.patch(CLIENT.UPDATE_PROFILE, profileData);
    return response.data.data;
};

export const uploadClientProfileImage = async (file: File): Promise<{ profileImage: string }> => {
    const formData = new FormData();
    formData.append('profileImage', file);

    const response = await axiosInstance.post(CLIENT.UPDATE_PROFILE_PIC, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data.data;
};


export const getClientGymDetails = async (): Promise<GymProfile> => {
    const response = await axiosInstance.get(CLIENT.GET_GYM);
    return response.data.data;
};

export const getClientAssignedTrainer = async (trainerId: string) => {
    const response = await axiosInstance.get(CLIENT.GET_ASSIGNED_TRAINER(trainerId));
    return response.data.data;
}
