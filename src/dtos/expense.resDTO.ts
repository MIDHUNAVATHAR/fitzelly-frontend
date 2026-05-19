export interface Expense {
    id: string;
    gymId: string;
    category: ExpenseCategory;
    amount: number;
    notes: string | null;
    date: string;
}


export type ExpenseCategory =
    | "RENT"
    | "ELECTRICITY"
    | "WATER"
    | "INSURANCE_TAX"
    | "MARKETING"
    | "MAINTENANCE"
    | "OTHER";
