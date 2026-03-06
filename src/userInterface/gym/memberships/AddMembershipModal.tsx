import React, { useState, useEffect, useCallback } from 'react';
import { X, Calendar, User, CalendarRange, CreditCard } from 'lucide-react';
import { addMembership } from '../../../api/membership.api';
import { getClients } from '../../../api/gym-clients.api';
import { getPlans } from '../../../api/plan.api';
import { getTrainers } from '../../../api/gym-trainers.api';
import type { ClientDTO } from '../../../api/gym-clients.api';
import type { Plan } from '../../../api/plan.api';
import type { Trainer } from '../../../api/gym-trainers.api';
import { toast } from 'react-hot-toast';
import { isAxiosError } from 'axios';
import DateInput from '../../../components/ui/DateInput';


type AddMembershipPayload = {
    clientId: string;
    planId: string;
    startDate: string;
    assignedTrainerId?: string;
};

interface AddMembershipModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialClientId?: string;
}

const AddMembershipModal: React.FC<AddMembershipModalProps> = ({ isOpen, onClose, onSuccess, initialClientId }) => {
    const [clients, setClients] = useState<ClientDTO[]>([]);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [trainers, setTrainers] = useState<Trainer[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const [clientId, setClientId] = useState('');
    const [planId, setPlanId] = useState('');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [assignedTrainerId, setAssignedTrainerId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [clientsRes, plansData, trainersRes] = await Promise.all([
                getClients(1, 100, ''),
                getPlans(1, 100, ''),
                getTrainers(1, 100, '')
            ]);

            // Depending on how getClients/getTrainers returns data, need to extract arrays
            setClients(clientsRes.data?.clients || clientsRes.data || clientsRes || []);
            setPlans(plansData.plans || plansData || []);
            setTrainers(trainersRes.trainers || trainersRes.data?.trainers || trainersRes || []);
        } catch {
            toast.error('Failed to load form data');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            fetchData();
            // Reset form
            setClientId(initialClientId || '');
            setPlanId('');
            setStartDate(new Date().toISOString().split('T')[0]);
            setAssignedTrainerId('');
        }
    }, [isOpen, initialClientId, fetchData]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const data: AddMembershipPayload = {
                clientId,
                planId,
                startDate,
            };

            if (assignedTrainerId) {
                data.assignedTrainerId = assignedTrainerId;
            }

            await addMembership(data);
            toast.success('Membership created successfully');
            onSuccess();
        } catch (error) {
            if (isAxiosError(error)) {
                toast.error(error.response?.data?.message || 'Failed to create membership');
            } else {
                toast.error('Failed to create membership');
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
                        Add New Membership
                    </h2>
                    <p className="text-zinc-400 text-sm mt-1">
                        Assign a new membership plan to a client.
                    </p>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-10">
                        <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                        {/* Client */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                                <User className="w-4 h-4 text-emerald-400" />
                                Client <span className="text-red-400">*</span>
                            </label>
                            <select
                                required
                                value={clientId}
                                onChange={(e) => setClientId(e.target.value)}
                                className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors w-full appearance-none"
                                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center' }}
                            >
                                <option value="" disabled>Select a client</option>
                                {clients.map(client => (
                                    <option key={client.id} value={client.id}>
                                        {client.fullName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Plan */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-emerald-400" />
                                Plan <span className="text-red-400">*</span>
                            </label>
                            <select
                                required
                                value={planId}
                                onChange={(e) => setPlanId(e.target.value)}
                                className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors w-full appearance-none"
                                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center' }}
                            >
                                <option value="" disabled>Select a plan</option>
                                {plans.map(plan => (
                                    <option key={plan.id} value={plan.id}>
                                        {plan.planName} ({plan.planType === 'DAY_BASED' ? 'Day' : 'Category'}) - ₹{plan.price}
                                    </option>
                                ))}
                            </select>
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
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                            />
                        </div>

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
                                        {trainer.fullName} - {trainer.specialization}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="pt-4 flex gap-3 pb-2">
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
                                    "Add Membership"
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default AddMembershipModal;
