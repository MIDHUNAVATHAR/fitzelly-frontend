import { type SubscriptionPlan } from "../dtos/gym-subscription.resDTO";

import { axiosInstance } from "./axios";


export const getAvailableFitzellyPlans = async (): Promise<SubscriptionPlan[]> => {
    const response = await axiosInstance.get("/api/gym/subscriptions");
    return response.data.data;
};

export const createStripeCheckoutSession = async (planId: string): Promise<{ sessionId: string, url: string }> => {
    const response = await axiosInstance.post("/api/gym/subscriptions/create-session", { planId });
    return response.data.data;
};

export const confirmFitzellySubscription = async (sessionId: string, planId: string): Promise<{ success: boolean }> => {
    const response = await axiosInstance.post("/api/gym/subscriptions/confirm", { sessionId, planId });
    return response.data;
};
