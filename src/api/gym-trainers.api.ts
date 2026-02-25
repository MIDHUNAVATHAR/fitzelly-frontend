import { axiosInstance } from "./axios";
import { GYM } from "../constants/routes";


export const getTrainers = async (page: number, search: string) => {
    const res = await axiosInstance.get(GYM.GET_TRAINERS, {
        params: { page, search }
    });

    return res.data.data;
};

export const softDeleteTrainer = async (id: string) => {
    const res = await axiosInstance.delete(GYM.TRAINER_BY_ID(id));
    return res.data;
};

/**
 * method to send welcome mail to trainer
 * @param id 
 * @returns 
 */
export const sendWelcomeEmail = async (id: string) => {
    const res = await axiosInstance.post(GYM.TRAINER_WELCOME(id));
    return res.data;
};

export const getTrainerById = async (trainerId: string) => {
    const res = await axiosInstance.get(GYM.TRAINER_BY_ID(trainerId));
    return res.data.data;
}

export const updateTrainer = async (trainerId: string, data: Partial<Trainer>) => {
    const res = await axiosInstance.put(GYM.TRAINER_BY_ID(trainerId), data);
    return res.data.data;
}

export const addTrainer = async (trainerData: Partial<Trainer>) => {
    const result = await axiosInstance.post(GYM.ADD_TRAINER, trainerData);
    return result.data.data;
}



export interface Trainer {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    specialization?: string;
    salary?: number;
    dateOfBirth: string;
    joinedDate: string;
    profileUrl: string;
    isEmailVerified: boolean
}
