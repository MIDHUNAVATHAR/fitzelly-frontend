import { axiosInstance } from './axios';
import { GYM } from '../constants/routes';

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

export const getGymAnalytics = async (): Promise<GymAnalyticsData> => {
    const response = await axiosInstance.get(GYM.GET_ANALYTICS);
    return response.data.data;
};

export const getGymDashboard = async (): Promise<DashboardData> => {
    const response = await axiosInstance.get(GYM.GET_DASHBOARD);
    return response.data.data;
};
