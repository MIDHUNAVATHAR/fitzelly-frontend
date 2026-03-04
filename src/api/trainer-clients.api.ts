import { axiosInstance } from "./axios";
import { TRAINER_ROUTES } from "../constants/routes";

export interface ClientDTO {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    profileUrl?: string | null;
    membershipStatus?: string;
    currentPlan?: string;
    isEmailVerified: boolean;
}

interface ClientsResponse {
    status: string;
    message: string;
    data: {
        clients: ClientDTO[];
        pagination: {
            total: number;
            page: number;
            limit: number;
        }
    }
}

export const getAssignedClients = async (page: number = 1, search: string = ''): Promise<{ data: { clients: ClientDTO[] }, totalPages: number, status: string }> => {
    try {
        const response = await axiosInstance.get<ClientsResponse>(TRAINER_ROUTES.TRAINER_CLIENTS, {
            params: { page, search }
        });

        const totalPages = Math.ceil(response.data.data.pagination.total / response.data.data.pagination.limit);

        return {
            status: response.data.status,
            data: {
                clients: response.data.data.clients
            },
            totalPages
        };
    } catch (error) {
        console.error("Error fetching assigned clients:", error);
        throw error;
    }
};

export const getAssignedClientById = async (id: string): Promise<any> => {
    try {
        const response = await axiosInstance.get(TRAINER_ROUTES.TRAINER_CLIENTS + `/${id}`);
        return response.data.data;
    } catch (error) {
        throw error;
    }
};
