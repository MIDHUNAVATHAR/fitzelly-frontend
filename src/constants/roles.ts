
export const ROLES = {
    SUPER_ADMIN: "super-admin",
    GYM: "gym",
    CLIENT: "client",
    TRAINER: "trainer"
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];