

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


    GET_ENQUIRIES: (params: string) => `/api/gym/enquiries?${params}`,
    ADD_ENQUIRY: "/api/gym/enquiry",
    ENQUIRY_BY_ID: (id: string) => `/api/gym/enquiry/${id}`,

    GET_EQUIPMENTS: "/api/gym/equipments",
    ADD_EQUIPMENT: "/api/gym/equipment",
    EQUIPMENT_BY_ID: (id: string) => `/api/gym/equipment/${id}`,

    GET_EXPENSES: "/api/gym/expenses",
    ADD_EXPENSE: "/api/gym/expense",
    EXPENSE_BY_ID: (id: string) => `/api/gym/expense/${id}`,

}


export const SUPER_ADMIN = {
    SUPER_ADMIN_PROFILE: "/api/super-admin/profile",
    UPLOAD_SUPER_ADMIN_LOGO: "/api/super-admin/profile/logo",
    SUPER_ADMIN_GYMS: "/api/super-admin/gyms",
    GYM_BY_ID: (gymId: string) => `/api/super-admin/gyms/${gymId}`,
    APPROVE_GYM: (gymId: string) => `/api/super-admin/gyms/${gymId}/approve`
}


export const TRAINER_ROUTES = {
    TRAINER_CLIENTS: "/api/trainer/clients",
}



export const CLIENT = {
    GET_PROFILE: '/api/client/profile',
    UPDATE_PROFILE: '/api/client/profile',
    UPDATE_PROFILE_PIC: '/api/client/profile/image',
    GET_GYM: `/api/client/gym-details`,
    GET_ASSIGNED_TRAINER: (trainerId: string) => `api/client/trainer/${trainerId}`
}

export const COMMON = {
    MARK_ATTENDANCE: "/api/attendance/mark",
    GET_TODAY_ATTENDANCE: "/api/attendance/today",
    GET_DAILY_ATTENDANCE_REPORT: (date: string, userType: 'CLIENT' | 'TRAINER') =>
        `/api/attendance/report?date=${date}&userType=${userType}`,
    MARK_ATTENDANCE_MANUAL: "/api/attendance/mark-manual"
}
