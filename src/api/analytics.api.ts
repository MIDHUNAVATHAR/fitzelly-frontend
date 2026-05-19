import { type GymAnalyticsData, type DashboardData , type SuperAdminDashboardMetrics } from '../dtos/analytics.resDTO';

import { axiosInstance } from './axios';
import { GYM, SUPER_ADMIN } from '../constants/routes';



export const getGymAnalytics = async (): Promise<GymAnalyticsData> => {
    const response = await axiosInstance.get(GYM.GET_ANALYTICS);
    return response.data.data;
};

export const getGymDashboard = async (): Promise<DashboardData> => {
    const response = await axiosInstance.get(GYM.GET_DASHBOARD);
    return response.data.data;
};

export const getSuperAdminDashboard = async (): Promise<SuperAdminDashboardMetrics> => {
    const response = await axiosInstance.get(SUPER_ADMIN.GET_DASHBOARD);
    return response.data.data;
};
