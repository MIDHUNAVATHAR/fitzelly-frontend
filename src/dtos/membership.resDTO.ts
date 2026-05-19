export interface Payment {
    id: string;
    membershipId: string;
    amount: number;
    paymentDate: string;
    note: string | null;
    isDeleted: boolean;
}

export interface Membership {
    id: string;
    clientId: string;
    clientName: string;
    planId: string;
    planName: string;
    planType: 'DAY_BASED' | 'CATEGORY_BASED';
    startDate: string;
    expiryDate: string | null;
    status: 'ACTIVE' | 'EXPIRED';
    daysLeft: number | null;
    assignedTrainerId: string | null;
    assignedTrainerName: string | null;
    planAmount: number;
    paymentStatus?: 'PAID' | 'PARTIAL' | 'UNPAID';
    totalPaid?: number;
    isDeleted: boolean;
}
