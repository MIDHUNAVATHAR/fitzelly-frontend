export interface Plan {
    id: string;
    gymId: string;
    planName: string;
    planType: 'DAY_BASED' | 'CATEGORY_BASED';
    validity: number;
    price: number;
    windowPeriod: number;
    description?: string;
    isDeleted: boolean;
}
