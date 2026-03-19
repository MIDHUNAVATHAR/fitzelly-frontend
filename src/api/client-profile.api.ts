import { CLIENT, } from '../constants/routes';
import { axiosInstance } from './axios';

export interface ClientProfile {
    id?: string;
    gymId?: string;
    fullName?: string;
    email?: string;
    phoneNumber?: string;
    emergencyContact?: string;
    contactPerson?: string;
    dateOfBirth?: string;
    profileImage?: string;
    joinedDate?: string;
}

export interface ClientMembership {
    currentPlan: string;
    planType: string;
    startDate: string;
    expiryDate: string | null;
    status: 'ACTIVE' | 'EXPIRED';
    daysLeft: number | null;
    assignedTrainer: string | null;
    assignedTrainerId: string | null;
    paymentStatus?: 'PAID' | 'PARTIAL' | 'UNPAID' | null;
    payments?: { date: string, amount: number }[];
}

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
    expiryDate?: string;
}

export const getClientGymDetails = async (): Promise<GymProfile> => {
    const response = await axiosInstance.get(CLIENT.GET_GYM);
    return response.data.data;
};

export const getClientAssignedTrainer = async (trainerId: string) => {
    const response = await axiosInstance.get(CLIENT.GET_ASSIGNED_TRAINER(trainerId));
    return response.data.data;
}
