import { axiosInstance } from "./axios";
import { GYM } from "../constants/routes";

interface GymSignupInitiatePayload {
    email: string;
}

interface GymSignupVerifyPayload {
    email: string;
    password: string;
    otp: string;
}

export const initiateGymSignup = async (payload: GymSignupInitiatePayload) => {
    const res = await axiosInstance.post(GYM.INITIATE_GYM_SIGNUP, payload);
    return res.data;
}

export const verifyGymSignupOtp = async (payload: GymSignupVerifyPayload) => {
    const res = await axiosInstance.post(GYM.COMPLETE_GYM_SIGNUP, payload);
    return res.data;
}