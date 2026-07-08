import { type SubscriptionPlan } from "../dtos/subscription-plans.resDTO";
import { SUPER_ADMIN } from "../constants/routes";
import { axiosInstance } from "./axios";

export const fetchSubscriptionPlans = async (): Promise<SubscriptionPlan[]> => {
    const response = await axiosInstance.get( SUPER_ADMIN.GET_SUBSCRIPTION_PLANS);
    return response.data.data;
};

export const createSubscriptionPlan = async ( plan: Omit<SubscriptionPlan, "id"> ): Promise<SubscriptionPlan> => {
    const response = await axiosInstance.post( SUPER_ADMIN.CREATE_SUBSCRIPTION_PLAN,plan);
    return response.data.data;
};

export const updateSubscriptionPlan = async ( id: string, plan: Partial<Omit<SubscriptionPlan, "id">>): Promise<SubscriptionPlan> => {
    const response = await axiosInstance.patch( SUPER_ADMIN.UPDATE_SUBSCRIPTION_PLAN(id),plan);
    return response.data.data;
};

export const deleteSubscriptionPlan = async (id: string): Promise<void> => {
    await axiosInstance.delete(SUPER_ADMIN.DELETE_SUBSCRIPTION_PLAN(id));
};