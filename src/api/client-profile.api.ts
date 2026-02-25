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
    id?: string;
    planName: string;
    planType: 'category-based' | 'day-based';
    startDate: string;
    expiryDate?: string;
    daysLeft?: number;
}

export const getClientProfile = async (): Promise<ClientProfile> => {
    const response = await axiosInstance.get('/api/client/profile');
    return response.data.data;
};

export const updateClientProfile = async (profileData: Partial<ClientProfile>): Promise<ClientProfile> => {
    const response = await axiosInstance.patch('/api/client/profile', profileData);
    return response.data.data;
};

export const uploadClientProfileImage = async (file: File): Promise<{ profileImage: string }> => {
    const formData = new FormData();
    formData.append('profileImage', file);

    const response = await axiosInstance.post('/api/client/profile/image', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data.data;
};

export const getClientMembership = async (): Promise<ClientMembership | null> => {
    try {
        const response = await axiosInstance.get('/api/client/membership/latest');
        return response.data.data;
    } catch (error: any) {
        if (error.response?.status === 404) {
            return null; // Return null if no membership found
        }
        throw error;
    }
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

export const getGymProfileById = async (gymId: string): Promise<GymProfile> => {
    const response = await axiosInstance.get(`/api/gym/view/${gymId}`);
    return response.data.data;
};
