import { axiosInstance } from './axios';
import { GYM } from '../constants/routes';

export interface NotificationItem {
    id: string;
    gymId: string;
    message: string;
    isRead: boolean;
    type: string;
    createdAt: string;
}

export const getUnreadNotifications = async (): Promise<NotificationItem[]> => {
    const response = await axiosInstance.get(GYM.NOTIFICATIONS_UNREAD);
    return response.data.data;
};

export const getReadNotifications = async (page: number = 1): Promise<NotificationItem[]> => {
    const response = await axiosInstance.get(`${GYM.NOTIFICATIONS_READ}?page=${page}`);
    return response.data.data;
};

export const markNotificationAsRead = async (id: string): Promise<void> => {
    await axiosInstance.patch(GYM.MARK_NOTIFICATION_READ(id));
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
    await axiosInstance.patch(GYM.MARK_ALL_NOTIFICATIONS_READ);
};
