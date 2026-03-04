import { axiosInstance } from './axios';

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
export const getMemberships = async (): Promise<Membership[]> => {
    const response = await axiosInstance.get('/api/gym/memberships');
    return response.data.data;
};

export const getMembershipById = async (id: string): Promise<{ membership: Membership, paymentSummary: { totalPaid: number, planAmount: number, paymentStatus: string, payments: Payment[] } }> => {
    const response = await axiosInstance.get(`/api/gym/membership/${id}`);
    return response.data.data;
};

export const addMembership = async (data: AddMembershipDTO): Promise<Membership> => {
    const response = await axiosInstance.post('/api/gym/membership', data);
    return response.data.data;
};

export const updateMembership = async (id: string, data: UpdateMembershipDTO): Promise<Membership> => {
    const response = await axiosInstance.patch(`/api/gym/membership/${id}`, data);
    return response.data.data;
};

export const deleteMembership = async (id: string): Promise<void> => {
    await axiosInstance.delete(`/api/gym/membership/${id}`);
};

// PAYMENT APIS
export const addPayment = async (membershipId: string, data: AddPaymentDTO): Promise<Payment> => {
    const response = await axiosInstance.post(`/api/gym/membership/${membershipId}/payment`, data);
    return response.data.data;
};

export const updatePayment = async (paymentId: string, data: UpdatePaymentDTO): Promise<Payment> => {
    const response = await axiosInstance.patch(`/api/gym/payment/${paymentId}`, data);
    return response.data.data;
};

export const deletePayment = async (paymentId: string): Promise<void> => {
    await axiosInstance.delete(`/api/gym/payment/${paymentId}`);
};
