export interface AddMembershipDTO {
    clientId: string;
    planId: string;
    startDate: string;
    assignedTrainerId?: string;
    daysLeft?: number;
}

export interface UpdateMembershipDTO {
    startDate?: string;
    assignedTrainerId?: string;
    daysLeft?: number;
}

export interface AddPaymentDTO {
    amount: number;
    paymentDate: string;
    note?: string;
}

export interface UpdatePaymentDTO {
    amount?: number;
    paymentDate?: string;
    note?: string;
}
