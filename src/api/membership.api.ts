import { type AddMembershipDTO, type UpdateMembershipDTO, type AddPaymentDTO, type UpdatePaymentDTO } from '../dtos/membership.reqDTO';
import { type Payment, type Membership } from '../dtos/membership.resDTO';

import { axiosInstance } from './axios';
import { GYM } from '../constants/routes';



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