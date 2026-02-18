import { axiosInstance } from "./axios"
import { SUPER_ADMIN } from "../constants/routes";


export const getSuperAdminProfile = async () => {
    const response = await axiosInstance.get(SUPER_ADMIN.SUPER_ADMIN_PROFILE);
    const data = response.data.data;
    return data;
}

export const updateSuperAdminProfile = async (data: Partial<SuperAdminProfile>) => {
    const response = await axiosInstance.patch(SUPER_ADMIN.SUPER_ADMIN_PROFILE, data);
    return response.data;
}

export const uploadSuperAdminLogo = async (file: File) => {
    const formData = new FormData();
    formData.append('logo', file);
    const response = await axiosInstance.post(SUPER_ADMIN.UPLOAD_SUPER_ADMIN_LOGO, formData);
    return response.data.data;
}


export interface SuperAdminProfile {
    appName?: string;
    caption?: string;
    email?: string;
    contactEmail?: string;
    phoneNumber?: string;
    description?: string;
    logoUrl?: string;
}