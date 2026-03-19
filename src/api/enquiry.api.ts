import { GYM } from "../constants/routes";
import { axiosInstance } from "./axios";

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

export const getEnquiries = async (
    page: number = 1,
    limit: number = 10,
    search?: string,
    startDate?: string,
    endDate?: string
): Promise<GetEnquiriesResponse> => {
    const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
    });

    if (search) params.append("search", search);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const response = await axiosInstance.get(GYM.GET_ENQUIRIES(params.toString()));
    return response.data;
};

export const addEnquiry = async (data: {
    fullName: string;
    phoneNumber: string;
    email?: string;
}) => {
    const response = await axiosInstance.post(GYM.ADD_ENQUIRY, data);
    return response.data;
};

export const updateEnquiry = async (id: string, data: {
    fullName?: string;
    phoneNumber?: string;
    email?: string;
    status?: "PENDING" | "CONTACTED" | "CONVERTED";
}) => {
    const response = await axiosInstance.put(GYM.ENQUIRY_BY_ID(id), data);
    return response.data;
};

export const deleteEnquiry = async (id: string) => {
    const response = await axiosInstance.delete(GYM.ENQUIRY_BY_ID(id));
    return response.data;
};
