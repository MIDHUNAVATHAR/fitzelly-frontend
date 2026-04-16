import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Filter, Edit, Trash2, IndianRupee } from 'lucide-react';
import { getExpenses, addExpense, updateExpense, deleteExpense } from '../../../api/expense.api';
import type {Expense} from "../../../api/expense.api"
import { toast } from 'react-hot-toast';
import ReusableTable from '../../../components/ui/ReusableTable';
import type { Column } from '../../../components/ui/ReusableTable';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import ExpenseModal from './ExpenseModal';
import DateInput from '../../../components/ui/DateInput';
import Pagination from '../../../components/ui/Pagination';



const CATEGORIES: { value: string; label: string }[] = [
    { value: 'ALL', label: 'All Categories' },
    { value: 'RENT', label: 'Rent' },
    { value: 'ELECTRICITY', label: 'Electricity' },
    { value: 'WATER', label: 'Water' },
    { value: 'INSURANCE_TAX', label: 'Insurance/Tax' },
    { value: 'MARKETING', label: 'Marketing' },
    { value: 'MAINTENANCE', label: 'Maintenance' },
    { value: 'OTHER', label: 'Other' },
];

const ExpensesList: React.FC = () => {
    // List state
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    
    // Filter state
    const [category, setCategory] = useState<string>('ALL');
    const [startDate, setStartDate] = useState<string>(() => {
        const d = new Date();
        d.setDate(1); // Start of current month
        return d.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState<string>(() => {
        const d = new Date();
        return d.toISOString().split('T')[0];
    });

    // Modal state
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

    const loadExpenses = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getExpenses(page, limit, category, startDate, endDate);
            setExpenses(response.data.expenses);
            setTotal(response.data.total);
        } catch (error) {
            console.error('Error fetching expenses:', error);
            toast.error('Failed to load expenses');
        } finally {
            setLoading(false);
        }
    }, [page, limit, category, startDate, endDate]);

    useEffect(() => {
        loadExpenses();
    }, [loadExpenses]);

    const handleAdd = async (data: Omit<Expense, 'id' | 'gymId'>) => {
        try {
            await addExpense(data);
            toast.success('Expense added successfully');
            loadExpenses();
        } catch (error) {
            toast.error('Failed to add expense');
            throw error;
        }
    };

    const handleEdit = async (data: Partial<Expense>) => {
        if (!selectedExpense) return;
        try {
            await updateExpense(selectedExpense.id, data);
            toast.success('Expense updated successfully');
            loadExpenses();
        } catch (error) {
            toast.error('Failed to update expense');
            throw error;
        }
    };

    const handleDelete = async () => {
        if (!selectedExpense) return;
        try {
            await deleteExpense(selectedExpense.id);
            toast.success('Expense deleted successfully');
            setIsDeleteModalOpen(false);
            loadExpenses();
        } catch {
            toast.error('Failed to delete expense');
        }
    };

    const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    const columns: Column<Expense>[] = [
        { 
            header: 'Category', 
            accessor: (row) => (
                <span className="font-bold text-white tracking-wide">
                    {CATEGORIES.find(c => c.value === row.category)?.label || row.category}
                </span>
            )
        },
        { 
            header: 'Amount', 
            accessor: (row) => (
                <span className="text-emerald-400 font-bold">
                    ₹{row.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
            )
        },
        { 
            header: 'Date', 
            accessor: (row) => new Date(row.date).toLocaleDateString('en-GB')
        },
        { 
            header: 'Notes', 
            accessor: (row) => (
                <span className="text-zinc-500 text-sm italic truncate max-w-[200px] block">
                    {row.notes || 'No notes'}
                </span>
            )
        },
        {
            header: 'Actions',
            accessor: (row) => (
                <div className="flex gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedExpense(row);
                            setIsEditModalOpen(true);
                        }}
                        className="p-1.5 bg-zinc-800 rounded hover:bg-zinc-700 text-blue-400 transition"
                        title="Edit"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedExpense(row);
                            setIsDeleteModalOpen(true);
                        }}
                        className="p-1.5 bg-zinc-800 rounded hover:bg-zinc-700 text-red-400 transition"
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Expenses Management</h1>
                    <p className="text-zinc-400 text-sm mt-1">Track and manage your gym's operational costs.</p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <div className="flex-1 sm:flex-none flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl">
                        <IndianRupee className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm font-bold text-white">Total: ₹{totalAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-all font-bold shadow-lg shadow-emerald-500/20 active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        Add Expense
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
                <div className="relative group">
                    <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
                    <select
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all shadow-xl appearance-none cursor-pointer"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        {CATEGORIES.map(cat => (
                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                    </select>
                </div>

                <div className="md:col-span-2 xl:col-span-2 flex gap-4">
                    <div className="flex-1">
                        <DateInput 
                            value={startDate} 
                            onChange={(e) => setStartDate(e.target.value)} 
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all shadow-xl"
                        />
                    </div>
                    <div className="flex-1">
                        <DateInput 
                            value={endDate} 
                            onChange={(e) => setEndDate(e.target.value)} 
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all shadow-xl"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
                <ReusableTable
                    columns={columns}
                    data={expenses}
                    isLoading={loading}
                    onRowClick={(row) => {
                        setSelectedExpense(row);
                        setIsEditModalOpen(true);
                    }}
                />
            </div>

            <Pagination
                currentPage={page}
                totalItems={total}
                limit={limit}
                limitOptions={[10, 50, 100]}
                onPageChange={(p) => setPage(p)}
                onLimitChange={(l) => {
                    setLimit(l);
                    setPage(1);
                }}
            />

            <ExpenseModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={handleAdd}
                title="New Expense"
            />

            <ExpenseModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedExpense(null);
                }}
                onSave={handleEdit}
                expense={selectedExpense}
                title="Edit Expense"
            />

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete Expense"
                message="Are you sure you want to delete this expense record? This action cannot be undone."
                isProcessing={loading}
            />
        </div>
    );
};

export default ExpensesList;
