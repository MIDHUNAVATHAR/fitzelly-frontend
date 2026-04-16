import { axiosInstance } from "./axios";
import { GYM } from "../constants/routes";

export interface Equipment {
    id: string;
    gymId: string;
    name: string;
    description: string;
    image: string;
    availableDays: string[];
    availableFrom: string;
    availableTo: string;
    allowedPlans: string[];
    capacity: number;
    slotIntervalMinutes: number;
    isActive: boolean;
}

// export const getEquipments = async (page: number, limit: number, search: string = '') => {
//     const response = await axiosInstance.get(`/api/gym/equipments?page=${page}&limit=${limit}&search=${search}`);
//     return response.data.data;
// };
export const getEquipments = async (
    page: number,
    limit: number,
    search: string = '',
    gymId?: string
) => {
    const response = await axiosInstance.get(GYM.GET_EQUIPMENTS, {
        params: { page, limit, search, gymId }
    });
    return response.data.data;
};


export const addEquipment = async (data: FormData) => {
    const response = await axiosInstance.post(GYM.ADD_EQUIPMENT, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data;
};

export const updateEquipment = async (id: string, data: FormData) => {
    const response = await axiosInstance.put(GYM.EQUIPMENT_BY_ID(id), data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data;
};

export const deleteEquipment = async (id: string) => {
    const response = await axiosInstance.delete(GYM.EQUIPMENT_BY_ID(id));
    return response.data.data;
};
