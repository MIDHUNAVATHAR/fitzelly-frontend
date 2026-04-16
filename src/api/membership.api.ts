import { axiosInstance } from './axios';
import { GYM } from '../constants/routes';


export interface Payment {
    id: string;
    membershipId: string;
    amount: number;
    paymentDate: string;
    note: string | null;
    isDeleted: boolean;
}

export interface Membership {
    id: string;
    clientId: string;
    clientName: string;
    planId: string;
    planName: string;
    planType: 'DAY_BASED' | 'CATEGORY_BASED';
    startDate: string;
    expiryDate: string | null;
    status: 'ACTIVE' | 'EXPIRED';
    daysLeft: number | null;
    assignedTrainerId: string | null;
    assignedTrainerName: string | null;
    planAmount: number;
    paymentStatus?: 'PAID' | 'PARTIAL' | 'UNPAID';
    totalPaid?: number;
    isDeleted: boolean;
}

export interface AddMembershipDTO {
    clientId: string;
    planId: string;
    startDate: string;
    assignedTrainerId?: string;
    daysLeft?: number;
}

export interface UpdateMembershipDTO {
    startDate?: string;
    assignedTrainerId?: string;
    daysLeft?: number;
}

export interface AddPaymentDTO {
    amount: number;
    paymentDate: string;
    note?: string;
}

export interface UpdatePaymentDTO {
    amount?: number;
    paymentDate?: string;
    note?: string;
}

// MEMBERSHIP APIS
export const getMemberships = async (
    page: number = 1,
    limit: number = 10,
    search: string = '',
    status: string = ''
): Promise<{ memberships: Membership[], total: number }> => {

    const params = `page=${page}&limit=${limit}&search=${search}&status=${status}`;

    const response = await axiosInstance.get(GYM.GET_MEMBERSHIPS(params));
    return response.data.data;
};

export const getMembershipById = async (id: string) => {
    const response = await axiosInstance.get(GYM.MEMBERSHIP_BY_ID(id));
    return response.data.data;
};

export const addMembership = async (data: AddMembershipDTO): Promise<Membership> => {
    const response = await axiosInstance.post(GYM.ADD_MEMBERSHIP, data);
    return response.data.data;
};

export const updateMembership = async (id: string, data: UpdateMembershipDTO): Promise<Membership> => {
    const response = await axiosInstance.patch(GYM.UPDATE_MEMBERSHIP(id), data);
    return response.data.data;
};

export const deleteMembership = async (id: string): Promise<void> => {
    await axiosInstance.delete(GYM.DELETE_MEMBERSHIP(id));
};


// PAYMENT APIS
export const getPayments = async (
    page: number = 1,
    limit: number = 10,
    startDate: string,
    endDate: string
) => {

    const params = `page=${page}&limit=${limit}&startDate=${startDate}&endDate=${endDate}`;

    const response = await axiosInstance.get(GYM.GET_PAYMENTS(params));
    return response.data.data;
};

export const addPayment = async (membershipId: string, data: AddPaymentDTO): Promise<Payment> => {
    const response = await axiosInstance.post(GYM.ADD_PAYMENT(membershipId), data);
    return response.data.data;
};

export const updatePayment = async (paymentId: string, data: UpdatePaymentDTO): Promise<Payment> => {
    const response = await axiosInstance.patch(GYM.UPDATE_PAYMENT(paymentId), data);
    return response.data.data;
};

export const deletePayment = async (paymentId: string): Promise<void> => {
    await axiosInstance.delete(GYM.DELETE_PAYMENT(paymentId));
};