import { GYM } from '../constants/routes';
import { axiosInstance } from './axios';

export type ExpenseCategory =
    | "RENT"
    | "ELECTRICITY"
    | "WATER"
    | "INSURANCE_TAX"
    | "MARKETING"
    | "MAINTENANCE"
    | "OTHER";

export interface Expense {
    id: string;
    gymId: string;
    category: ExpenseCategory;
    amount: number;
    notes: string | null;
    date: string;
}

export const getExpenses = async (
    page: number = 1,
    limit: number = 10,
    category?: string,
    startDate?: string,
    endDate?: string
) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (category && category !== 'ALL') params.append('category', category);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await axiosInstance.get(GYM.GET_EXPENSES, { params });
    return response.data;
};

export const addExpense = async (expense: Omit<Expense, 'id' | 'gymId'>) => {
    const response = await axiosInstance.post(GYM.ADD_EXPENSE, expense);
    return response.data;
};

export const updateExpense = async (id: string, expense: Partial<Expense>) => {
    const response = await axiosInstance.put(GYM.EXPENSE_BY_ID(id), expense);
    return response.data;
};

export const deleteExpense = async (id: string) => {
    const response = await axiosInstance.delete(GYM.EXPENSE_BY_ID(id));
    return response.data;
};
