

export const GYM = {
    GET_GYM_PROFILE: "/api/gym/profile",
    UPDATE_GYM_PROFILE: "/api/gym/profile",
    UPLOAD_GYM_LOGO: "/api/gym/profile/logo",
    UPLOAD_GYM_CERTIFICATE: "/api/gym/profile/certificate",
    DELETE_GYM_CERTIFICATE: "/api/gym/profile/certificate/delete",
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

    GET_TRAINER_PAYOUTS: "/api/gym/trainer-payouts",
    ADD_TRAINER_PAYOUT: "/api/gym/trainer-payout",
    TRAINER_PAYOUT_BY_ID: (id: string) => `/api/gym/trainer-payout/${id}`,

    NOTIFICATIONS_UNREAD: "/api/gym/notifications/unread",
    NOTIFICATIONS_READ: "/api/gym/notifications/read",
    MARK_ALL_NOTIFICATIONS_READ: "/api/gym/notifications/read-all",
    MARK_NOTIFICATION_READ: (id: string) => `/api/gym/notifications/${id}/read`,

    GET_ANALYTICS: "/api/gym/analytics",
    GET_DASHBOARD: "/api/gym/dashboard",

    GET_MEMBERSHIPS: (params: string) => `/api/gym/memberships?${params}`,
    MEMBERSHIP_BY_ID: (id: string) => `/api/gym/membership/${id}`,
    ADD_MEMBERSHIP: "/api/gym/membership",
    UPDATE_MEMBERSHIP: (id: string) => `/api/gym/membership/${id}`,
    DELETE_MEMBERSHIP: (id: string) => `/api/gym/membership/${id}`,

    GET_PAYMENTS: (params: string) => `/api/gym/payments?${params}`,
    ADD_PAYMENT: (membershipId: string) => `/api/gym/membership/${membershipId}/payment`,
    UPDATE_PAYMENT: (paymentId: string) => `/api/gym/payment/${paymentId}`,
    DELETE_PAYMENT: (paymentId: string) => `/api/gym/payment/${paymentId}`,

    GET_PLANS: (params: string) => `/api/gym/plans?${params}`,
    ADD_PLAN: "/api/gym/plan",
    UPDATE_PLAN: (id: string) => `/api/gym/plan/${id}`,
    DELETE_PLAN: (id: string) => `/api/gym/plan/${id}`,
}


export const SUPER_ADMIN = {
    SUPER_ADMIN_PROFILE: "/api/super-admin/profile",
    UPLOAD_SUPER_ADMIN_LOGO: "/api/super-admin/profile/logo",
    SUPER_ADMIN_GYMS: "/api/super-admin/gyms",
    GYM_BY_ID: (gymId: string) => `/api/super-admin/gyms/${gymId}`,
    APPROVE_GYM: (gymId: string) => `/api/super-admin/gyms/${gymId}/approve`,
    GET_EXERCISES: "/api/super-admin/workout-library",
    ADD_EXERCISE: "/api/super-admin/workout-library",
    UPDATE_EXERCISE: (id: string) => `/api/super-admin/workout-library/${id}`,
    DELETE_EXERCISE: (id: string) => `/api/super-admin/workout-library/${id}`,
}



export const TRAINER_ROUTES = {

    TRAINER_PROFILE: "/api/trainer/profile",
    UPDATE_TRAINER_PROFILE: "/api/trainer/profile",
    UPLOAD_TRAINER_PROFILE_IMAGE: "/api/trainer/profile/image",
    GET_TRAINER_GYM_DETAILS: "/api/trainer/gym-details",

    WORKOUT_PLAN_BY_CLIENT: (clientId: string) => `/api/trainer/workout-plan/${clientId}`,


    TRAINER_CLIENTS: "/api/trainer/clients",
    GET_EXERCISES: "/api/trainer/workout-library",
    ADD_EXERCISE: "/api/trainer/workout-library",
    UPDATE_EXERCISE: (id: string) => `/api/trainer/workout-library/${id}`,
    DELETE_EXERCISE: (id: string) => `/api/trainer/workout-library/${id}`,
    GET_TEMPLATES: "/api/trainer/workout-template",
    ADD_TEMPLATE: "/api/trainer/workout-template",
    DELETE_TEMPLATE: (id: string) => `/api/trainer/workout-template/${id}`,
    ASSIGN_TEMPLATE: "/api/trainer/workout-template/assign",
    GET_EARNINGS: "/api/trainer/earnings",
}



export const CLIENT = {
    GET_PROFILE: '/api/client/profile',
    UPDATE_PROFILE: '/api/client/profile',
    UPDATE_PROFILE_PIC: '/api/client/profile/image',
    GET_GYM: `/api/client/gym-details`,
    GET_ASSIGNED_TRAINER: (trainerId: string) => `api/client/trainer/${trainerId}`,
    BOOK_EQUIPMENT: "/api/equipment-booking/book",
    GET_EQUIPMENT_SLOTS: (equipmentId: string, date: string) => `/api/equipment-booking/slots?equipmentId=${equipmentId}&date=${date}`,
    GET_MY_EQUIPMENT_BOOKINGS: "/api/equipment-booking/my-bookings",
    CANCEL_BOOKING: (bookingId: string) => `/api/equipment-booking/cancel/${bookingId}`,

    GET_MY_WORKOUT_PLAN: "/api/client/workout-plan",
    TRACK_WORKOUT_PROGRESS: "/api/client/workout-progress",
    GET_WORKOUT_PROGRESS: (date: string) => `/api/client/workout-progress?date=${date}`,
    GET_WORKOUT_STREAK: "/api/client/workout-streak",
}

export const COMMON = {
    MARK_ATTENDANCE: "/api/attendance/mark",
    GET_TODAY_ATTENDANCE: "/api/attendance/today",
    GET_DAILY_ATTENDANCE_REPORT: (date: string, userType: 'CLIENT' | 'TRAINER') =>
        `/api/attendance/report?date=${date}&userType=${userType}`,
    MARK_ATTENDANCE_MANUAL: "/api/attendance/mark-manual",
    GET_YEARLY_ATTENDANCE_COUNT: "/api/attendance/yearly-count"
}
