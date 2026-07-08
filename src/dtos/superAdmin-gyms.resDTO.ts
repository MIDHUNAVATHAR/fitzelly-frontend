export interface IGymCertificate {
    url: string;
    type: 'IMAGE' | 'PDF';
    name: string;
    key: string;
}

export interface Gym {
    _id: string;
    gymName: string;
    logoUrl: string;
    caption: string;
    description: string;
    email: string;
    phone: string;
    address: string;
    approvalStatus: 'Approved' | 'Pending' | 'Rejected' | 'Reapplied';
    subscriptionStatus: 'Active' | 'Trial' | 'Expired' | 'Pending';
    location: { latitude: number; longitude: number };
    createdAt: string;
    expiryDate?: string;
    certificates?: IGymCertificate[];
    rejectionReason?: string;
    latestSubscription?: {
        planName: string;
        amount: number;
        startDate: string;
        endDate: string;
        status: string;
        paymentGateway: string | null;
        gatewayPaymentId: string | null;
    }
}

export interface GymsResponse {
    gyms: Gym[];
    totalPages: number;
    currentPage: number;
    totalGyms: number;
}
