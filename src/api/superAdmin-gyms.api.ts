import {  type GymsResponse, type Gym } from "../dtos/superAdmin-gyms.resDTO";


import { axiosInstance } from "./axios";
import { SUPER_ADMIN } from "../constants/routes";


export const fetchGyms = async (
    page: number = 1,
    search: string = '',
    limit: number = 10,
    status: string = 'all'
): Promise<GymsResponse> => {

    const response = await axiosInstance.get(SUPER_ADMIN.SUPER_ADMIN_GYMS, {
        params: { page,limit, search: search || undefined, status: status !== 'all' ? status : undefined }
    });

    return response.data.data;
};


export const getGymById = async (gymId: string): Promise<Gym> => {
    const response = await axiosInstance.get(SUPER_ADMIN.GYM_BY_ID(gymId));
    return response.data.data;

};


export const updateGymStatus = async (gymId: string, gymData: Partial<Gym>): Promise<Gym> => {

    const response = await axiosInstance.patch(SUPER_ADMIN.GYM_BY_ID(gymId), gymData);
    return response.data.data;
};

export const approveGym = async (gymId: string): Promise<Gym> => {
    const response = await axiosInstance.post(SUPER_ADMIN.APPROVE_GYM(gymId));
    return response.data.data;
};

export const rejectGym = async (gymId: string, rejectionReason: string): Promise<Gym> => {
    const response = await axiosInstance.post(SUPER_ADMIN.REJECT_GYM(gymId), { rejectionReason });
    return response.data.data;
};

export const updateGymSubscription = async (gymId: string,subscriptionStatus: string,expiryDate: string): Promise<Gym> => {
    const response = await axiosInstance.patch(SUPER_ADMIN.UPDATE_GYM_SUBSCRIPTION(gymId), {
        subscriptionStatus,
        expiryDate
    });
    return response.data.data;
};
