export interface InitiateForgotPasswordPayload {
    email: string;
    role: string;
}

export interface VerifyForgotPasswordPayload extends InitiateForgotPasswordPayload {
    otp: string;
}

export interface ResetPasswordPayload extends VerifyForgotPasswordPayload {
    password: string;
}

export interface loginPayload {
    email: string,
    password: string,
    role: string,
    device?: string,
    browser?: string,
    os?: string,
    ip?: string
}


export interface GymSignupInitiatePayload {
    email: string;
}

export interface GymSignupVerifyPayload {
    email: string;
    password: string;
    otp: string;
}