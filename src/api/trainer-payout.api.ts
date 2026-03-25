import { axiosInstance } from './axios';
import { GYM, TRAINER_ROUTES } from '../constants/routes';

export interface TrainerPayout {
    id: string;
    gymId: string;
    trainerId: string;
    trainerName?: string;
    amount: number;
    notes: string | null;
    date: string;
}

export const getTrainerPayouts = async (
    page: number = 1,
    limit: number = 10,
    trainerId?: string,
    startDate?: string,
    endDate?: string
) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (trainerId && trainerId !== 'ALL') params.append('trainerId', trainerId);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await axiosInstance.get(GYM.GET_TRAINER_PAYOUTS, { params });
    return response.data;
};

export const addTrainerPayout = async (payout: Omit<TrainerPayout, 'id' | 'gymId'>) => {
    const response = await axiosInstance.post(GYM.ADD_TRAINER_PAYOUT, payout);
    return response.data;
};

export const updateTrainerPayout = async (id: string, payout: Partial<TrainerPayout>) => {
    const response = await axiosInstance.put(GYM.TRAINER_PAYOUT_BY_ID(id), payout);
    return response.data;
};

export const deleteTrainerPayout = async (id: string) => {
    const response = await axiosInstance.delete(GYM.TRAINER_PAYOUT_BY_ID(id));
    return response.data;
};

export const getTrainerEarnings = async (page: number = 1, limit: number = 10) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await axiosInstance.get(TRAINER_ROUTES.GET_EARNINGS, { params });
    return response.data;
};
