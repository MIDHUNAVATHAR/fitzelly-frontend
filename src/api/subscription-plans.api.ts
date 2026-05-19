import { type SubscriptionPlan } from "../dtos/subscription-plans.resDTO";

import { axiosInstance } from "./axios";


export const fetchSubscriptionPlans = async (): Promise<SubscriptionPlan[]> => {
    const response = await axiosInstance.get("/api/super-admin/subscription-plans");
    return response.data.data;
};

export const createSubscriptionPlan = async (plan: Omit<SubscriptionPlan, "id">): Promise<SubscriptionPlan> => {
    const response = await axiosInstance.post("/api/super-admin/subscription-plans", plan);
    return response.data.data;
};

export const updateSubscriptionPlan = async (id: string, plan: Partial<Omit<SubscriptionPlan, "id">>): Promise<SubscriptionPlan> => {
    const response = await axiosInstance.patch(`/api/super-admin/subscription-plans/${id}`, plan);
    return response.data.data;
};

export const deleteSubscriptionPlan = async (id: string): Promise<void> => {
    await axiosInstance.delete(`/api/super-admin/subscription-plans/${id}`);
};
