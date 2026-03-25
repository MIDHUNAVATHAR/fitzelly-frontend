import { axiosInstance } from "./axios";
import { CLIENT } from "../constants/routes";

export interface EquipmentSlot {
    startTime: string;
    endTime: string;
    capacity: number;
    bookedCount: number;
    isAvailable: boolean;
}

export interface EquipmentBooking {
    id: string;
    clientId: string;
    gymId: string;
    equipmentId: string;
    date: string;
    startTime: string;
    endTime: string;
    status: 'BOOKED' | 'CANCELLED';
    createdAt: string;
}

export const getEquipmentSlots = async (equipmentId: string, date: string): Promise<EquipmentSlot[]> => {
    const response = await axiosInstance.get(CLIENT.GET_EQUIPMENT_SLOTS(equipmentId, date));
    return response.data.data;
};

export const bookEquipment = async (data: {
    gymId: string;
    equipmentId: string;
    date: string;
    startTime: string;
}): Promise<EquipmentBooking> => {
    const response = await axiosInstance.post(CLIENT.BOOK_EQUIPMENT, data);
    return response.data;
};

export const getMyBookings = async (): Promise<EquipmentBooking[]> => {
    const response = await axiosInstance.get(CLIENT.GET_MY_EQUIPMENT_BOOKINGS);
    return response.data.data;
};

export const cancelBooking = async (bookingId: string): Promise<void> => {
    await axiosInstance.patch(CLIENT.CANCEL_BOOKING(bookingId));
};
