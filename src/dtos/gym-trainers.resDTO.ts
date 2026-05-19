export interface Trainer {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    specialization?: string;
    salary?: number;
    dateOfBirth: string;
    joinedDate: string;
    profileUrl: string;
    qualification?: string;
    address?: string;
    certificates?: string[];
    isEmailVerified: boolean
}
