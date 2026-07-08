export interface CreatePlanDTO {
    planName: string;
    planType: 'DAY_BASED' | 'CATEGORY_BASED';
    validity: number;
    price: number;
    windowPeriod: number;
    description?: string;
}

export interface UpdatePlanDTO {
    planName?: string;
    planType?: 'DAY_BASED' | 'CATEGORY_BASED';
    validity?: number;
    price?: number;
    windowPeriod?: number;
    description?: string;
}
