import { axiosInstance } from "./axios";

interface initiateForgotpasswordPayload {
    email: string;
    role: string;
}

interface verifyForgotPasswordPaylaod extends initiateForgotpasswordPayload {
    otp: string;
}

interface resetPasswordPayload extends verifyForgotPasswordPaylaod {
    password: string;
}



export const initiateForgotpassword = async (payload: initiateForgotpasswordPayload) => {
    const res = await axiosInstance.post(`/api/${payload.role}/auth/forgot-password/initiate`, { email: payload.email });
    return res.data;
}


export const verifyForgotPassword = async (payload: verifyForgotPasswordPaylaod) => {
    const res = await axiosInstance.post(`/api/${payload.role}/auth/forgot-password/verify`, { email: payload.email, otp: payload.otp });
    return res.data;
}


export const resetPassword = async (payload: resetPasswordPayload) => {
    const res = await axiosInstance.post(`/api/${payload.role}/auth/resetPassword`, { email: payload.email, password: payload.password, otp: payload.otp });
    return res.data;
}
