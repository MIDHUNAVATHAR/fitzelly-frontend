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
    joinedDate: string;
    isEmailVerified: boolean;
}



export const getClients = async (page: number, search: string) => {

    const response = await axiosInstance.get(GYM.GET_CLIENTS, {
        params: { page, search }
    });
    return response.data;
}

export const softDeleteClient = async (id: string) => {
    const response = await axiosInstance.delete(GYM.CLIENT_BY_ID(id));
    return response.data;
};


export const sendWelcomeEmail = async (id: string) => {
    const res = await axiosInstance.post(GYM.CLIENT_WELCOME(id));
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


