import { axiosInstance } from "./axios";
import { SUPER_ADMIN } from "../constants/routes";

export interface Gym {
    _id: string;
    gymName: string;
    logoUrl: string;
    email: string;
    phone: string;
    address: string;
    approvalStatus: 'Approved' | 'Pending' | 'Rejected';
    subscriptionStatus: 'Active' | 'Trial' | 'Expired' | 'Pending';
    createdAt: string;
    expiryDate?: string;
}

export interface GymsResponse {
    gyms: Gym[];
    totalPages: number;
    currentPage: number;
    totalGyms: number;
}

export const fetchGyms = async (
    page: number = 1,
    search: string = '',
    limit: number = 10
): Promise<GymsResponse> => {

    const response = await axiosInstance.get(SUPER_ADMIN.SUPER_ADMIN_GYMS, {
        params: {
            page,
            limit,
            search: search || undefined
        }
    });

    return response.data.data;
};


export const getGymById = async (gymId: string): Promise<Gym> => {
    const response = await axiosInstance.get(SUPER_ADMIN.GET_GYM_BY_ID(gymId));
    return response.data.data;

};


export const updateGymStatus = async (gymId: string, gymData: Partial<Gym>): Promise<Gym> => {
    const response = await axiosInstance.patch(`/api/super-admin/gyms/${gymId}`, gymData);
    return response.data.data;
};