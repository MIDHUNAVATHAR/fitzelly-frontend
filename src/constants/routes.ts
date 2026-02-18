

export const GYM = {
    GET_GYM_PROFILE: "/api/gym/profile",
    UPDATE_GYM_PROFILE: "/api/gym/profile",
    UPLOAD_GYM_LOGO: "/api/gym/profile/logo",
    INITIATE_GYM_SIGNUP: "/api/gym/auth/signup/initiate",
    COMPLETE_GYM_SIGNUP: "/api/gym/auth/signup/complete"
}


export const SUPER_ADMIN = {
    SUPER_ADMIN_PROFILE: "/api/super-admin/profile",
    UPLOAD_SUPER_ADMIN_LOGO: "/api/super-admin/profile/logo",
    SUPER_ADMIN_GYMS: "/api/super-admin/gyms",
    GET_GYM_BY_ID: (gymId: string) => `api/super-admin/gyms/${gymId}`
}