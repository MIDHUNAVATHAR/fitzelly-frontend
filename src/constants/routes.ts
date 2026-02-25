

export const GYM = {
    GET_GYM_PROFILE: "/api/gym/profile",
    UPDATE_GYM_PROFILE: "/api/gym/profile",
    UPLOAD_GYM_LOGO: "/api/gym/profile/logo",
    INITIATE_GYM_SIGNUP: "/api/gym/auth/signup/initiate",
    COMPLETE_GYM_SIGNUP: "/api/gym/auth/signup/complete",

    ADD_CLIENT: "/api/gym/client",
    GET_CLIENTS: "/api/gym/clients",
    CLIENT_BY_ID: (clientId: string) => `/api/gym/client/${clientId}`,
    CLIENT_WELCOME: (clientId: string) => `/api/gym/clients/${clientId}/send-welcome`,


    ADD_TRAINER: "/api/gym/trainer",
    GET_TRAINERS: "/api/gym/trainers",
    TRAINER_BY_ID: (trainerId: string) => `/api/gym/trainers/${trainerId}`,
    TRAINER_WELCOME: (clientId: string) => `/api/gym/trainers/${clientId}/send-welcome`,


}


export const SUPER_ADMIN = {
    SUPER_ADMIN_PROFILE: "/api/super-admin/profile",
    UPLOAD_SUPER_ADMIN_LOGO: "/api/super-admin/profile/logo",
    SUPER_ADMIN_GYMS: "/api/super-admin/gyms",
    GYM_BY_ID: (gymId: string) => `/api/super-admin/gyms/${gymId}`
}