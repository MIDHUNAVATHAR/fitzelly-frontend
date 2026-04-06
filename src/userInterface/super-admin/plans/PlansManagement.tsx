import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Loader2 } from 'lucide-react';
import ReusableTable from '../../../components/ui/ReusableTable';
import type { Column } from '../../../components/ui/ReusableTable';
import { fetchSubscriptionPlans, createSubscriptionPlan, updateSubscriptionPlan, deleteSubscriptionPlan } from '../../../api/subscription-plans.api';
import type { SubscriptionPlan } from '../../../api/subscription-plans.api';
import { toast } from 'react-hot-toast';
import ConfirmModal from '../../../components/ui/ConfirmModal';

const PlansManagement: React.FC = () => {
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [planToDelete, setPlanToDelete] = useState<string | null>(null);
    const [isActionLoading, setIsActionLoading] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        price: 0,
        durationMonths: 1,
        description: ''
    });

    useEffect(() => {
        loadPlans();
    }, []);

    const loadPlans = async () => {
        try {
            setLoading(true);
            const data = await fetchSubscriptionPlans();
            setPlans(data);
        } catch (error) {
            toast.error("Failed to fetch plans");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (plan?: SubscriptionPlan) => {
        if (plan) {
            setEditingPlan(plan);
            setFormData({
                name: plan.name,
                price: plan.price,
                durationMonths: plan.durationMonths,
                description: plan.description
            });
        } else {
            setEditingPlan(null);
            setFormData({ name: '', price: 0, durationMonths: 1, description: '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsActionLoading(true);
            if (editingPlan) {
                await updateSubscriptionPlan(editingPlan.id, formData);
                toast.success("Plan updated successfully");
            } else {
                await createSubscriptionPlan(formData);
                toast.success("Plan created successfully");
            }
            setIsModalOpen(false);
            loadPlans();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Something went wrong");
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!planToDelete) return;
        try {
            setIsActionLoading(true);
            await deleteSubscriptionPlan(planToDelete);
            toast.success("Plan deleted successfully");
            setIsDeleteModalOpen(false);
            loadPlans();
        } catch (error) {
            toast.error("Failed to delete plan");
        } finally {
            setIsActionLoading(false);
        }
    };

    const columns: Column<SubscriptionPlan>[] = [
        { header: 'Plan Name', accessor: 'name' },
        { header: 'Price (₹)', accessor: (plan) => `₹${plan.price}` },
        { header: 'Duration', accessor: (plan) => `${plan.durationMonths} ${plan.durationMonths === 1 ? 'Month' : 'Months'}` },
        {
            header: 'Actions',
            accessor: (plan) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleOpenModal(plan)}
                        className="p-2 bg-zinc-800 text-blue-400 hover:bg-zinc-700 rounded-lg transition-colors"
                        title="Edit Plan"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => { setPlanToDelete(plan.id); setIsDeleteModalOpen(true); }}
                        className="p-2 bg-zinc-800 text-red-500 hover:bg-zinc-700 rounded-lg transition-colors"
                        title="Delete Plan"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Subscription Plans</h1>
                    <p className="text-zinc-500 font-medium">Manage gym subscription packages</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    Add Plan
                </button>
            </div>

            <ReusableTable
                data={plans.map(p => ({ ...p, id: p.id }))}
                columns={columns}
                isLoading={loading}
                emptyMessage="No subscription plans found."
            />

            {/* Plan Modal (Add/Edit) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl">
                        <div className="p-8">
                            <h2 className="text-2xl font-black text-white mb-6">
                                {editingPlan ? 'Edit Plan' : 'Add New Plan'}
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Plan Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                                        placeholder="Enter plan name"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Price (₹)</label>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Duration (Months)</label>
                                        <input
                                            type="number"
                                            required
                                            min="1"
                                            value={formData.durationMonths}
                                            onChange={(e) => setFormData({ ...formData, durationMonths: Number(e.target.value) })}
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                                            placeholder="1"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all h-24 resize-none"
                                        placeholder="Describe what's included..."
                                    />
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 px-6 py-3 bg-zinc-800 text-zinc-300 font-bold rounded-xl hover:bg-zinc-700 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isActionLoading}
                                        className="flex-1 px-6 py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 disabled:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isActionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                        {editingPlan ? 'Update Plan' : 'Create Plan'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete Subscription Plan?"
                message="Are you sure you want to delete this plan? Gyms will no longer be able to subscribe to it. This action cannot be undone."
                confirmText="Yes, Delete"
                variant="danger"
                isProcessing={isActionLoading}
            />
        </div>
    );
};

export default PlansManagement;
