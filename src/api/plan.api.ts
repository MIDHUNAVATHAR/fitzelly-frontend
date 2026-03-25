import { axiosInstance } from './axios';
import { GYM } from '../constants/routes';

export interface Plan {
    id: string;
    gymId: string;
    planName: string;
    planType: 'DAY_BASED' | 'CATEGORY_BASED';
    validity: number;
    price: number;
    windowPeriod: number;
    description?: string;
    isDeleted: boolean;
}

export interface CreatePlanDTO {
    planName: string;
    planType: 'DAY_BASED' | 'CATEGORY_BASED';
    validity: number;
    price: number;
    windowPeriod: number;
    description?: string;
}

export interface UpdatePlanDTO {
    planName?: string;
    planType?: 'DAY_BASED' | 'CATEGORY_BASED';
    validity?: number;
    price?: number;
    windowPeriod?: number;
    description?: string;
}

export const getPlans = async (
    page: number = 1,
    limit: number = 10,
    search: string = ''
): Promise<{ plans: Plan[], total: number }> => {

    const params = `page=${page}&limit=${limit}&search=${search}`;

    const response = await axiosInstance.get(GYM.GET_PLANS(params));
    return response.data.data;
};

export const createPlan = async (data: CreatePlanDTO): Promise<Plan> => {
    const response = await axiosInstance.post(GYM.ADD_PLAN, data);
    return response.data.data;
};

export const updatePlan = async (id: string, data: UpdatePlanDTO): Promise<Plan> => {
    const response = await axiosInstance.patch(GYM.UPDATE_PLAN(id), data);
    return response.data.data;
};

export const deletePlan = async (id: string): Promise<void> => {
    await axiosInstance.delete(GYM.DELETE_PLAN(id));
};
