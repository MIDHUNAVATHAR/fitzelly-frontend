import { axiosInstance } from "./axios";

export interface SubscriptionPlan {
    id: string;
    name: string;
    price: number;
    durationMonths: number;
    description: string;
}

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
