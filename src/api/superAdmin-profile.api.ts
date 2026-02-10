import { axiosInstance } from "./axios"


export const getSuperAdminProfile = async () => {
    const response = await axiosInstance.get("/api/super-admin/profile");
    const data = response.data.data;
    return data;
}

export const updateSuperAdminProfile = async (data: Partial<SuperAdminProfile>) => {
    const response = await axiosInstance.patch("/api/super-admin/profile", data);
    return response.data;
}

export const uploadSuperAdminLogo = async (file: File) => {
    const formData = new FormData();
    formData.append('logo', file);
    const response = await axiosInstance.post("/api/super-admin/profile/logo", formData);
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