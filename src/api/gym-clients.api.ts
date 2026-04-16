import { axiosInstance } from "./axios";
import { GYM } from "../constants/routes";


export interface ClientDTO {
    id: string;
    fullName: string;
    profileUrl: string;
    email: string;
    phoneNumber: string;
    dateOfBirth: string;
    emergencyContact: string;
    contactPerson: string;
    currentPlan: string;
    membershipStatus: string;
    planType?: 'DAY_BASED' | 'CATEGORY_BASED';
    daysLeft?: number;
    startDate?: string;
    expiryDate?: string;
    assignedTrainer?: string;
    paymentStatus?: 'PAID' | 'PARTIAL' | 'UNPAID';
    payments?: { date: string, amount: number }[];
    joinedDate: string;
    isEmailVerified: boolean;
    clientId?: string;
    height?: number;
    weight?: number;
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
}



export const getClients = async (page: number, limit: number, search: string) => {

    const response = await axiosInstance.get(GYM.GET_CLIENTS, {
        params: { page, limit, search }
    });
    return response.data;
}


export const softDeleteClient = async (id: string) => {
    const response = await axiosInstance.delete(GYM.CLIENT_BY_ID(id));
    return response.data;
};

export const sendWelcomeEmail = async (id: string) => {
    const res = await axiosInstance.post(GYM.CLIENT_BY_ID(id) + `/send-welcome`);
    return res.data;
};

export const addClient = async (clientData: Partial<ClientDTO>) => {
    const response = await axiosInstance.post(GYM.ADD_CLIENT, clientData);
    return response.data;
}

export const getClientById = async (clientId: string) => {
    const response = await axiosInstance.get(GYM.CLIENT_BY_ID(clientId));
    return response.data.data;
}



export const updateClient = async (clientId: string, data: Partial<ClientDTO>) => {
    const response = await axiosInstance.put(GYM.CLIENT_BY_ID(clientId), data);
    return response.data.data;
};


