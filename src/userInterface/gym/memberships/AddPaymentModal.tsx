import React, { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, FileText } from 'lucide-react';
import { addPayment, updatePayment } from '../../../api/membership.api';
import type { Payment } from '../../../api/membership.api';
import { toast } from 'react-hot-toast';
import { isAxiosError } from 'axios';
import DateInput from '../../../components/ui/DateInput';



interface AddPaymentModalProps {
    isOpen: boolean;
    membershipId: string;
    payment?: Payment;
    onClose: () => void;
    onSuccess: () => void;
}

const AddPaymentModal: React.FC<AddPaymentModalProps> = ({ isOpen, membershipId, payment, onClose, onSuccess }) => {
    const [amount, setAmount] = useState<number | ''>('');
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [note, setNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen && payment) {
            setAmount(payment.amount);

            if (payment.paymentDate) {
                const date = new Date(payment.paymentDate);
                setPaymentDate(date.toISOString().split('T')[0]);
            }

            setNote(payment.note || '');
        } else {
            setAmount('');
            setPaymentDate(new Date().toISOString().split('T')[0]);
            setNote('');
        }
    }, [isOpen, payment]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!amount || Number(amount) <= 0) {
            toast.error('Amount must be greater than 0');
            return;
        }

        setIsSubmitting(true);

        try {
            const data = {
                amount: Number(amount),
                paymentDate,
                note
            };

            if (payment) {
                await updatePayment(payment.id, data);
                toast.success('Payment updated successfully');
            } else {
                await addPayment(membershipId, data);
                toast.success('Payment added successfully');
            }

            onSuccess();
        } catch (error) {
            if (isAxiosError(error)) {
                toast.error(
                    error.response?.data?.message ||
                    `Failed to ${payment ? 'update' : 'add'} payment`
                );
            } else {
                toast.error(`Failed to ${payment ? 'update' : 'add'} payment`);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 sm:p-8 m-4 animate-in fade-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute right-6 top-6 text-zinc-400 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                        <DollarSign className="w-6 h-6 text-emerald-400" />
                        {payment ? 'Edit' : 'Add'} Payment
                    </h2>
                    <p className="text-zinc-400 text-sm mt-1">
                        Record a payment for this membership.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Amount */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-emerald-400" />
                            Amount <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="number"
                            required
                            min="1"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                            placeholder="Amount (e.g. 5000)"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
                        />
                    </div>

                    {/* Date */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-emerald-400" />
                            Payment Date <span className="text-red-400">*</span>
                        </label>
                        <DateInput
                            required
                            value={paymentDate}
                            onChange={(e) => setPaymentDate(e.target.value)}
                            max={new Date().toISOString().split('T')[0]} // Cannot be in future usually
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                        />
                    </div>

                    {/* Note */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-emerald-400" />
                            Note <span className="text-zinc-500 font-normal">(Optional)</span>
                        </label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={3}
                            placeholder="Bank transfer, Cash, Transaction ID..."
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-colors resize-none"
                        ></textarea>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                "Save Payment"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddPaymentModal;
