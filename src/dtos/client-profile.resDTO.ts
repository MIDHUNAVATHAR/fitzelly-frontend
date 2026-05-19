export interface ClientProfile {
    id?: string;
    gymId?: string;
    fullName?: string;
    email?: string;
    phoneNumber?: string;
    emergencyContact?: string;
    contactPerson?: string;
    dateOfBirth?: string;
    profileImage?: string;
    profileUrl?: string;
    joinedDate?: string;
    height?: number;
    weight?: number;
}

export interface ClientMembership {
    currentPlan: string;
    planType: string;
    startDate: string;
    expiryDate: string | null;
    status: 'ACTIVE' | 'EXPIRED';
    daysLeft: number | null;
    assignedTrainer: string | null;
    assignedTrainerId: string | null;
    paymentStatus?: 'PAID' | 'PARTIAL' | 'UNPAID' | null;
    payments?: { date: string, amount: number }[];
}

export interface GymProfile {
    logoUrl?: string;
    gymName?: string;
    caption?: string;
    email?: string;
    phoneNumber?: string;
    address?: string;
    description?: string;
    location?: {
        latitude: number;
        longitude: number;
    };
    approvalStatus?: string;
    subscriptionStatus?: string;
    expiryDate?: string;
}
