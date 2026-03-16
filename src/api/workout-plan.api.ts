import { axiosInstance } from "./axios";

export interface IExercise {
    id: string;
    name: string;
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
    weeklyPlan: IDayPlan[];
    notes?: string;
}

export interface IWorkoutProgress {
    date: string;
    completedExercises: string[];
}

// Trainer APIs
export const createOrUpdateWorkoutPlan = async (data: Partial<IWorkoutPlan>) => {
    const response = await axiosInstance.post<{ status: string; data: IWorkoutPlan }>(`/api/trainer/workout-plan/${data.clientId}`, data);
    return response.data;
};

export const getClientWorkoutPlan = async (clientId: string) => {
    const response = await axiosInstance.get<{ status: string; data: IWorkoutPlan }>(`/api/trainer/workout-plan/${clientId}`);
    return response.data;
};

// Client APIs
export const getMyWorkoutPlan = async () => {
    const response = await axiosInstance.get<{ status: string; data: IWorkoutPlan }>(`/api/client/workout-plan`);
    return response.data;
};

export const trackWorkoutProgress = async (data: IWorkoutProgress) => {
    const response = await axiosInstance.post<{ status: string; data: IWorkoutProgress }>(`/api/client/workout-progress`, data);
    return response.data;
};

export const getWorkoutProgress = async (date: string) => {
    const response = await axiosInstance.get<{ status: string; data: IWorkoutProgress }>(`/api/client/workout-progress?date=${date}`);
    return response.data;
};

export const getWorkoutStreak = async () => {
    const response = await axiosInstance.get<{ status: string; data: number }>(`/api/client/workout-streak`);
    return response.data;
};
