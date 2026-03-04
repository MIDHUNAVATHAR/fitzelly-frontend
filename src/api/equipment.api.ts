import { axiosInstance } from "./axios";

export interface Equipment {
    id: string;
    gymId: string;
    name: string;
    description: string;
    image: string;
    startBookingTime: number;
    availableDays: string[];
    availableFrom: string;
    availableTo: string;
    allowedPlans: string[];
    maxUsageMinutes: number;
    capacity: number;
    slotIntervalMinutes: number;
    isActive: boolean;
}

export const getEquipments = async (page: number, search: string = '') => {
    const response = await axiosInstance.get(`/api/gym/equipments?page=${page}&search=${search}`);
    return response.data.data;
};

export const addEquipment = async (data: FormData) => {
    const response = await axiosInstance.post(`/api/gym/equipment`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data;
};

export const updateEquipment = async (id: string, data: FormData) => {
    const response = await axiosInstance.put(`/api/gym/equipment/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data;
};

export const deleteEquipment = async (id: string) => {
    const response = await axiosInstance.delete(`/api/gym/equipment/${id}`);
    return response.data.data;
};
