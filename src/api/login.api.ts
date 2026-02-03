import { axiosInstance } from "./axios";

interface loginPayload {
    email: string,
    password: string,
    role: string
}

export const login = async (payload: loginPayload) => {
    const res = await axiosInstance.post(`/api/${payload.role}/auth/login`, payload);
    return res.data;
}