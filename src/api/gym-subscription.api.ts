
import { type SubscriptionPlan } from "../dtos/gym-subscription.resDTO";
import { GYM } from "../constants/routes";
import { axiosInstance } from "./axios";

export const getAvailableFitzellyPlans = async (): Promise<SubscriptionPlan[]> => {
    const { data } = await axiosInstance.get(GYM.GET_SUBSCRIPTION_PLANS);
    return data.data;
};

export const createStripeCheckoutSession = async ( planId: string ): Promise<{ sessionId: string; url: string }> => {
    const { data } = await axiosInstance.post(  GYM.CREATE_SUBSCRIPTION_SESSION,  { planId } );

    return data.data;
};

export const confirmFitzellySubscription = async (sessionId: string, planId: string ): Promise<{ success: boolean }> => {
    const { data } = await axiosInstance.post(  GYM.CONFIRM_SUBSCRIPTION,   { sessionId, planId });
    return data;
};