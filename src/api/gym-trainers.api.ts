import { axiosInstance } from "./axios";

export const fetchTrainers = async (page: number, search: string) => {
    const res = await axiosInstance.get("/api/gym/trainers", {
        params: { page, search }
    });

    return res.data.data;
};

export const softDeleteTrainer = async (id: string) => {
    const res = await axiosInstance.delete(`/api/gym/trainers/${id}`);
    return res.data;
};


export const sendWelcomeEmail = async (id: string) => {
    const res = await axiosInstance.post(`/api/gym/trainers/${id}/send-welcome`);
    return res.data;
};

export const getTrainerById = async ()=>{

}

export const updateTrainer = async () =>{
    
}

export const addTrainer = async () =>{

}



export interface Trainer {
    _id?: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    specialization?: string;
    salary?: number;
}
