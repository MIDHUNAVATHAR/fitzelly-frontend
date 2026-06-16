import { axiosInstance } from "./axios";
import type { loginPayload } from "../dtos/authDTO";



export const login = async (payload: loginPayload) => {
    const res = await axiosInstance.post(`/api/${payload.role}/auth/login`, payload);
    return res.data;
}

