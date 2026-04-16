import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Expense, ExpenseCategory } from '../../../api/expense.api';

interface ExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Omit<Expense, 'id' | 'gymId'>) => Promise<void>;
    expense?: Expense | null;
    title: string;
}

const CATEGORIES: { value: ExpenseCategory; label: string }[] = [
    { value: 'RENT', label: 'Rent' },
    { value: 'ELECTRICITY', label: 'Electricity' },
    { value: 'WATER', label: 'Water' },
    { value: 'INSURANCE_TAX', label: 'Insurance/Tax' },
    { value: 'MARKETING', label: 'Marketing' },
    { value: 'MAINTENANCE', label: 'Maintenance' },
    { value: 'OTHER', label: 'Other' },
];

const ExpenseModal: React.FC<ExpenseModalProps> = ({ isOpen, onClose, onSave, expense, title }) => {
    const [formData, setFormData] = useState({
        category: 'OTHER' as ExpenseCategory,
        amount: '',
        notes: '',
        date: new Date().toISOString().split('T')[0]
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (expense) {
            setFormData({
                category: expense.category,
                amount: expense.amount.toString(),
                notes: expense.notes || '',
                date: new Date(expense.date).toISOString().split('T')[0]
            });
        } else {
            setFormData({
                category: 'OTHER',
                amount: '',
                notes: '',
                date: new Date().toISOString().split('T')[0]
            });
        }
    }, [expense, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave({
                ...formData,
                amount: Number(formData.amount)
            });
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-6 border-b border-zinc-800">
                    <h2 className="text-xl font-bold text-white">{title}</h2>
                    <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400 ml-1">Category</label>
                        <select
                            required
                            className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value as ExpenseCategory })}
                        >
                            {CATEGORIES.map(cat => (
                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400 ml-1">Amount</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">₹</span>
                            <input
                                type="number"
                                required
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl pl-8 pr-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400 ml-1">Date</label>
                        <input
                            type="date"
                            required
                            className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400 ml-1">Notes (Optional)</label>
                        <textarea
                            placeholder="Add any extra details here..."
                            rows={3}
                            className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium resize-none"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-all font-bold"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl transition-all font-bold shadow-lg shadow-emerald-500/20"
                        >
                            {loading ? 'Saving...' : 'Save Expense'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ExpenseModal;
