import { axiosInstance } from "./axios";
import { TRAINER_ROUTES, CLIENT } from "../constants/routes";

export interface IExercise {
    id: string;
    idInLibrary?: string;
    name: string;
    instructions?: string;
    videoUrl?: string;
    reps: string;
    sets: string;
}

export interface IDayPlan {
    day: string;
    exercises: IExercise[];
}

export interface IWorkoutPlan {
    id?: string;
    clientId: string;
    trainerId: string;
    gymId: string;
    weekStartDate: string;
    weeklyPlan: IDayPlan[];
    notes?: string;
}

export interface IWorkoutProgress {
    date: string;
    completedExercises: string[];
}

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