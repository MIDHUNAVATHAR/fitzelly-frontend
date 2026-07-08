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
