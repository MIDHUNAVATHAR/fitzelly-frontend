import { axiosInstance } from './axios';
import { GYM, SUPER_ADMIN } from '../constants/routes';

export interface GymAnalyticsData {
    monthlyRevenue: { month: string; revenue: number }[];
    planRevenue: { name: string; value: number }[];
    paymentStatus: { status: 'Paid' | 'Pending'; value: number }[];
    retention: {
        totalClients: number;
        activeClients: number;
        inactiveClients: number;
    }
}

export interface DashboardData {
    todayCheckins: { client: number; trainer: number };
    monthRevenue: number;
    monthJoinees: number;
    expiries: { clientId: string; name: string; expiryDate: string; daysRemaining: number }[];
    birthdays: { name: string; role: 'CLIENT' | 'TRAINER'; userId: string }[];
    inactiveClients: { clientId: string; name: string; lastCheckIn: string | null; daysSinceLastSeen: number }[];
}

export interface SuperAdminDashboardMetrics {
    totalGyms: number;
    activeGyms: number;
    pendingGyms: number;
    totalRevenue: number;
    revenueTrend: { month: string; revenue: number }[];
    recentGyms: { id: string; name: string; ownerName: string; registrationDate: string; status: string }[];
}

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
