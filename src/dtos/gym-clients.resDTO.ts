export interface ClientDTO {
    id: string;
    fullName: string;
    profileUrl: string;
    email: string;
    phoneNumber: string;
    dateOfBirth: string;
    emergencyContact: string;
    contactPerson: string;
    currentPlan: string;
    membershipStatus: string;
    planType?: 'DAY_BASED' | 'CATEGORY_BASED';
    daysLeft?: number;
    startDate?: string;
    expiryDate?: string;
    assignedTrainer?: string;
    paymentStatus?: 'PAID' | 'PARTIAL' | 'UNPAID';
    payments?: { date: string, amount: number }[];
    joinedDate: string;
    isEmailVerified: boolean;
    clientId?: string;
    height?: number;
    weight?: number;
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
}
