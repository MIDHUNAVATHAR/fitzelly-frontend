import { axiosInstance } from './axios';

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

export const getPlans = async (page: number = 1, limit: number = 10, search: string = ''): Promise<{ plans: Plan[], total: number }> => {
    const response = await axiosInstance.get(`/api/gym/plans?page=${page}&limit=${limit}&search=${search}`);
    return response.data.data;
};


export const createPlan = async (data: CreatePlanDTO): Promise<Plan> => {
    const response = await axiosInstance.post('/api/gym/plan', data);
    return response.data.data;
};

export const updatePlan = async (id: string, data: UpdatePlanDTO): Promise<Plan> => {
    const response = await axiosInstance.patch(`/api/gym/plan/${id}`, data);
    return response.data.data;
};

export const deletePlan = async (id: string): Promise<void> => {
    await axiosInstance.delete(`/api/gym/plan/${id}`);
};
