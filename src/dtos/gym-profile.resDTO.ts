export interface IGymCertificate {
    url: string;
    type: 'IMAGE' | 'PDF';
    name: string;
    key: string;
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
    startDate?: string;
    expiryDate?: string;
    paymentMethod?: string;
    planName?: string;
    amount?: number;
    certificates?: IGymCertificate[];
    rejectionReason?: string;
}
