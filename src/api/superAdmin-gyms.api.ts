import { axiosInstance } from "./axios";
import { SUPER_ADMIN } from "../constants/routes";

export interface IGymCertificate {
    url: string;
    type: 'IMAGE' | 'PDF';
    name: string;
    key: string;
}

export interface Gym {
    _id: string;
    gymName: string;
    logoUrl: string;
    caption: string;
    description: string;
    email: string;
    phone: string;
    address: string;
    approvalStatus: 'Approved' | 'Pending' | 'Rejected' | 'Reapplied';
    subscriptionStatus: 'Active' | 'Trial' | 'Expired' | 'Pending';
    location: { latitude: number; longitude: number };
    createdAt: string;
    expiryDate?: string;
    certificates?: IGymCertificate[];
    rejectionReason?: string;
    latestSubscription?: {
        planName: string;
        amount: number;
        startDate: string;
        endDate: string;
        status: string;
        paymentGateway: string | null;
        gatewayPaymentId: string | null;
    }
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
    limit: number = 10,
    status: string = 'all'
): Promise<GymsResponse> => {

    const response = await axiosInstance.get(SUPER_ADMIN.SUPER_ADMIN_GYMS, {
        params: {
            page,
            limit,
            search: search || undefined,
            status: status !== 'all' ? status : undefined
        }
    });

    return response.data.data;
};


export const getGymById = async (gymId: string): Promise<Gym> => {
    const response = await axiosInstance.get(SUPER_ADMIN.GYM_BY_ID(gymId));
    return response.data.data;

};


export const updateGymStatus = async (gymId: string, gymData: Partial<Gym>): Promise<Gym> => {
    console.log("updaing aprrove steart");
    console.log(gymId);
    console.log(gymData);

    const response = await axiosInstance.patch(SUPER_ADMIN.GYM_BY_ID(gymId), gymData);
    console.log("update gym res : ", response)
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

export const updateGymSubscription = async (
    gymId: string,
    subscriptionStatus: string,
    expiryDate: string
): Promise<Gym> => {
    const response = await axiosInstance.patch(SUPER_ADMIN.UPDATE_GYM_SUBSCRIPTION(gymId), {
        subscriptionStatus,
        expiryDate
    });
    return response.data.data;
};
