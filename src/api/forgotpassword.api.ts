import { axiosInstance } from "./axios";
import { AUTH } from "../constants/routes";
import type { InitiateForgotPasswordPayload } from "../dtos/authDTO";
import type { VerifyForgotPasswordPayload } from "../dtos/authDTO";
import type { ResetPasswordPayload } from "../dtos/authDTO";



export const initiateForgotPassword = async (
    payload: InitiateForgotPasswordPayload
) => {
    const { data } = await axiosInstance.post(
        AUTH.FORGOT_PASSWORD_INITIATE(payload.role),
        { email: payload.email }
    );

    return data;
};

export const verifyForgotPassword = async (
    payload: VerifyForgotPasswordPayload
) => {
    const { data } = await axiosInstance.post(
        AUTH.FORGOT_PASSWORD_VERIFY(payload.role),
        {
            email: payload.email,
            otp: payload.otp,
        }
    );

    return data;
};

export const resetPassword = async (
    payload: ResetPasswordPayload
) => {
    const { data } = await axiosInstance.post(
        AUTH.RESET_PASSWORD(payload.role),
        {
            email: payload.email,
            otp: payload.otp,
            password: payload.password,
        }
    );

    return data;
};