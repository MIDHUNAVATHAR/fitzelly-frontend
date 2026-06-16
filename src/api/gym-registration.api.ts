import { axiosInstance } from "./axios";
import { GYM } from "../constants/routes";
import type {GymSignupInitiatePayload, GymSignupVerifyPayload} from "../dtos/authDTO"

export const initiateGymSignup = async (payload: GymSignupInitiatePayload) => {
    const res = await axiosInstance.post(GYM.INITIATE_GYM_SIGNUP, payload);
    return res.data;
}

export const verifyGymSignupOtp = async (payload: GymSignupVerifyPayload) => {
    const res = await axiosInstance.post(GYM.COMPLETE_GYM_SIGNUP, payload);
    return res.data;
}