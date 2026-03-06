import { axiosInstance } from "./axios";
import { TRAINER_ROUTES } from "../constants/routes";
import type { ClientDTO } from "./gym-clients.api";

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

export const getAssignedClients = async (page: number = 1, limit: number = 10, search: string = ''): Promise<{ data: { clients: ClientDTO[] }, totalItems: number, status: string }> => {
    try {
        const response = await axiosInstance.get<ClientsResponse>(TRAINER_ROUTES.TRAINER_CLIENTS, {
            params: { page, limit, search }
        });

        return {
            status: response.data.status,
            data: {
                clients: response.data.data.clients
            },
            totalItems: response.data.data.pagination.total
        };
    } catch (error) {
        console.error("Error fetching assigned clients:", error);
        throw error;
    }
};

export const getAssignedClientById = async (id: string): Promise<ClientDTO> => {
    const response = await axiosInstance.get(TRAINER_ROUTES.TRAINER_CLIENTS + `/${id}`);
    return response.data.data;
};
