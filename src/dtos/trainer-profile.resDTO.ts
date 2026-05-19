export interface TrainerProfile {
    id?: string;
    gymId?: string;
    fullName?: string;
    email?: string;
    phoneNumber?: string;
    specialization?: string;
    salary?: string;
    dateOfBirth?: string;
    profileUrl?: string;
    joinedDate?: string;
    qualification?: string;
    address?: string;
    certificates?: string[];
}

export interface GymProfile {
    id?: string;
    gymName?: string;
    email?: string;
    phoneNumber?: string;
    address?: string;
    description?: string;
    caption?: string;
    logoUrl?: string;
}
