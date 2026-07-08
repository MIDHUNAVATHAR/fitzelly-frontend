export interface Enquiry {
    id: string;
    gymId: string;
    fullName: string;
    phoneNumber: string;
    email: string | null;
    status: "PENDING" | "CONTACTED" | "CONVERTED";
    date: string;
}

export interface GetEnquiriesResponse {
    status: string;
    message: string;
    data: {
        enquiries: Enquiry[];
        total: number;
    };
}
