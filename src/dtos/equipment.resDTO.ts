export interface Equipment {
    id: string;
    gymId: string;
    name: string;
    description: string;
    image: string;
    availableDays: string[];
    availableFrom: string;
    availableTo: string;
    allowedPlans: string[];
    capacity: number;
    slotIntervalMinutes: number;
    isActive: boolean;
}
