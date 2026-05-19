import { type IWorkoutPlan, type IWorkoutProgress } from "../dtos/workout-plan.resDTO";

import { axiosInstance } from "./axios";
import { TRAINER_ROUTES, CLIENT } from "../constants/routes";


// Trainer APIs
export const createOrUpdateWorkoutPlan = async (data: Partial<IWorkoutPlan>) => {
    const response = await axiosInstance.post<{ status: string; data: IWorkoutPlan }>(
        TRAINER_ROUTES.WORKOUT_PLAN_BY_CLIENT(data.clientId as string),
        data
    );
    return response.data;
};

export const getClientWorkoutPlan = async (clientId: string) => {
    const response = await axiosInstance.get<{ status: string; data: IWorkoutPlan }>(
        TRAINER_ROUTES.WORKOUT_PLAN_BY_CLIENT(clientId)
    );
    return response.data;
};

// Client APIs
export const getMyWorkoutPlan = async () => {
    const response = await axiosInstance.get<{ status: string; data: IWorkoutPlan }>(
        CLIENT.GET_MY_WORKOUT_PLAN
    );
    return response.data;
};

export const trackWorkoutProgress = async (data: IWorkoutProgress) => {
    const response = await axiosInstance.post<{ status: string; data: IWorkoutProgress }>(
        CLIENT.TRACK_WORKOUT_PROGRESS,
        data
    );
    return response.data;
};

export const getWorkoutProgress = async (date: string) => {
    const response = await axiosInstance.get<{ status: string; data: IWorkoutProgress }>(
        CLIENT.GET_WORKOUT_PROGRESS(date)
    );
    return response.data;
};

export const getWorkoutStreak = async () => {
    const response = await axiosInstance.get<{ status: string; data: number }>(
        CLIENT.GET_WORKOUT_STREAK
    );
    return response.data;
};