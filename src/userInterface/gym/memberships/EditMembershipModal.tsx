import React, { useState, useEffect } from 'react';
import { X, Calendar, User, CalendarRange, Clock, AlertCircle } from 'lucide-react';
import { updateMembership } from '../../../api/membership.api';
import type { Membership } from '../../../api/membership.api';
import type { Trainer } from '../../../api/gym-trainers.api';
import { toast } from 'react-hot-toast';
import DateInput from '../../../components/ui/DateInput';
import { isAxiosError } from 'axios';

interface EditMembershipModalProps {
    isOpen: boolean;
    membership: Membership;
    trainers: Trainer[];
    onClose: () => void;
    onSuccess: () => void;
}

type UpdateMembershipPayload = {
    startDate: string;
    assignedTrainerId: string | undefined;
    daysLeft?: number;
};

const EditMembershipModal: React.FC<EditMembershipModalProps> = ({ isOpen, membership, trainers, onClose, onSuccess }) => {
    // Only editable fields according to prompt: Assigned Trainer, Start Date, Number of Days Left (only Day Plans)
    const [assignedTrainerId, setAssignedTrainerId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [daysLeft, setDaysLeft] = useState<number | ''>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen && membership) {
            setAssignedTrainerId(membership.assignedTrainerId || '');

            // Format start date for input type="date"
            if (membership.startDate) {
                const date = new Date(membership.startDate);
                setStartDate(date.toISOString().split('T')[0]);
            }

            if (membership.planType === 'DAY_BASED') {
                setDaysLeft(membership.daysLeft ?? '');
            } else {
                setDaysLeft('');
            }
        }
    }, [isOpen, membership]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const data: UpdateMembershipPayload = {
                startDate,
                assignedTrainerId: assignedTrainerId === '' ? undefined : assignedTrainerId
            };

            // Include assignedTrainerId (empty string means remove)
            data.assignedTrainerId = assignedTrainerId === '' ? undefined : assignedTrainerId;

            if (membership.planType === 'DAY_BASED' && daysLeft !== '') {
                data.daysLeft = Number(daysLeft);
            }

            await updateMembership(membership.id, data);
            toast.success('Membership updated successfully');
            onSuccess();
        } catch (error) {
            if (isAxiosError(error)) {
                toast.error(error.response?.data?.message || 'Failed to update membership');
            } else {
                toast.error('Failed to update membership');
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
                        <CalendarRange className="w-6 h-6 text-emerald-400" />
                        Edit Membership
                    </h2>
                    <p className="text-zinc-400 text-sm mt-1">
                        Editing {membership.planName} for {membership.clientName}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Read-only Plan Info */}
                    <div className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
                        <AlertCircle className="w-5 h-5 text-zinc-400 shrink-0" />
                        <span className="text-sm text-zinc-300">
                            Plan Name and Type cannot be modified after creation. Expiry dates will auto-calculate based on Start Date.
                        </span>
                    </div>

                    {/* Start Date */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-emerald-400" />
                            Start Date <span className="text-red-400">*</span>
                        </label>
                        <DateInput
                            required
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            max={new Date().toISOString().split('T')[0]} // Max date could be today or future. Up to gym. Let's not restrict.
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                        />
                    </div>

                    {/* Days Left (Only for Day Plans) */}
                    {membership.planType === 'DAY_BASED' && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-emerald-400" />
                                Number of Days Left
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={daysLeft}
                                onChange={(e) => setDaysLeft(e.target.value === '' ? '' : Number(e.target.value))}
                                placeholder="Enter remaining days"
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
                            />
                        </div>
                    )}

                    {/* Assigned Trainer */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                            <User className="w-4 h-4 text-emerald-400" />
                            Assigned Trainer
                        </label>
                        <select
                            value={assignedTrainerId}
                            onChange={(e) => setAssignedTrainerId(e.target.value)}
                            className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors w-full appearance-none"
                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center' }}
                        >
                            <option value="">No personal trainer</option>
                            {trainers.map(trainer => (
                                <option key={trainer.id} value={trainer.id}>
                                    {trainer.fullName}
                                </option>
                            ))}
                        </select>
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
                                "Save Changes"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditMembershipModal;
