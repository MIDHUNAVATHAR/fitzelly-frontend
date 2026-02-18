import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getGymById, updateGymStatus } from "../../../api/superAdmin-gyms.api";
import type { Gym } from "../../../api/superAdmin-gyms.api";
import { Loader2, ArrowLeft, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';


const EditGym: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [gym, setGym] = useState<Gym | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form state
    const [approvalStatus, setApprovalStatus] = useState<'Pending' | 'Approved' | 'Rejected'>('Pending');
    const [subscriptionStatus, setSubscriptionStatus] = useState<'Pending' | 'Trial' | 'Active' | 'Expired'>('Pending');
    const [expiryDate, setExpiryDate] = useState<string>('');

    useEffect(() => {
        const fetchDetails = async () => {
            if (!id) return;
            try {
                const data = await getGymById(id);
                setGym(data);
                setApprovalStatus(data.approvalStatus);
                setSubscriptionStatus(data.subscriptionStatus);
                setExpiryDate(data.expiryDate ? data.expiryDate.split('T')[0] : "");
            } catch (err) {
                console.error(err);
                toast.error("Failed to load gym details");
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;

        // Validation
        if (!approvalStatus || !subscriptionStatus || !expiryDate) {
            toast.error("All fields are required");
            return;
        }

        try {
            setSaving(true);
            await updateGymStatus(id, {
                approvalStatus,
                subscriptionStatus,
                expiryDate: new Date(expiryDate).toISOString()
            });
            toast.success("Gym status updated successfully");
            navigate('/super-admin/gyms');
        } catch (error) {
            console.error(error);
            toast.error("Failed to update gym");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
    );

    if (!gym) return <div className="text-white">Gym not found</div>;

    return (
        <div className="w-full mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <style>{`
                input[type="date"]::-webkit-calendar-picker-indicator {
                    filter: invert(1);
                    cursor: pointer;
                }
            `}</style>

            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/super-admin/gyms')}
                    className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-zinc-400" />
                </button>
                <h1 className="text-2xl font-bold text-white">Edit Gym Status</h1>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Read-Only Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-zinc-800">
                        <div>
                            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-1">Gym Name</label>
                            <p className="text-lg text-white font-medium">{gym.gymName}</p>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-1">Email</label>
                            <p className="text-lg text-zinc-300">{gym.email}</p>
                        </div>
                    </div>

                    {/* Editable Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Approval Status */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Approval Status</label>
                            <select
                                value={approvalStatus}
                                onChange={(e) => setApprovalStatus(e.target.value as 'Pending' | 'Approved' | 'Rejected')}
                                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                                <option value="Pending">Pending</option>
                                <option value="Approved">Approved</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                        </div>

                        {/* Subscription Status */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Subscription Status</label>
                            <select
                                value={subscriptionStatus}
                                onChange={(e) => setSubscriptionStatus(e.target.value as 'Pending' | 'Trial' | 'Active' | 'Expired')}
                                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                                <option value="Pending">Pending</option>
                                <option value="Trial">Trial</option>
                                <option value="Active">Active</option>
                                <option value="Expired">Expired</option>
                            </select>
                        </div>

                        {/* Expiry Date */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Expiry Date</label>
                            <input
                                type="date"
                                value={expiryDate}
                                onChange={(e) => setExpiryDate(e.target.value)}
                                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                required
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                        <button
                            type="button"
                            onClick={() => navigate('/super-admin/gyms')}
                            className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default EditGym;