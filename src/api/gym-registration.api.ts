import { axiosInstance } from "./axios";

interface GymSignupInitiatePayload {
    email: string;
}

interface GymSignupVerifyPayload {
    email: string;
    password: string;
    otp: string;
}

export const initiateGymSignup = async (payload: GymSignupInitiatePayload) => {
    const res = await axiosInstance.post("/api/gym/auth/signup/initiate", payload);
    return res.data;
}

export const verifyGymSignupOtp = async (payload: GymSignupVerifyPayload) => {
    const res = await axiosInstance.post("/api/gym/auth/signup/complete", payload);
    return res.data;
}