import React, { useState, useEffect } from 'react';
import { X, Calendar, AlertCircle, Loader2 } from 'lucide-react';

interface EditSubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (status: string, expiryDate: string) => Promise<void>;
    currentStatus: string;
    currentExpiryDate: string;
    isProcessing: boolean;
}

const EditSubscriptionModal: React.FC<EditSubscriptionModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    currentStatus,
    currentExpiryDate,
    isProcessing
}) => {
    const [status, setStatus] = useState(currentStatus);
    const [expiryDate, setExpiryDate] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            // Only allow Active or Expired for manual edits
            if (currentStatus === 'Active' || currentStatus === 'Expired') {
                setStatus(currentStatus);
            } else {
                setStatus('Active'); // Default to Active for Pending/Trial if superadmin is editing manually
            }
            if (currentExpiryDate) {
                const date = new Date(currentExpiryDate);
                setExpiryDate(date.toISOString().split('T')[0]);
            }
        }, 0);
        return () => clearTimeout(timer);
    }, [currentStatus, currentExpiryDate, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm(status, expiryDate);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-zinc-900 w-full max-w-md rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                    <h3 className="text-xl font-bold text-white">Edit Subscription</h3>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-xl transition-colors text-zinc-400">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">Subscription Status</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all appearance-none"
                        >
                            <option value="Active">Active</option>
                            <option value="Expired">Expired</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">Expiry Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500/50" />
                            <input
                                type="date"
                                value={expiryDate}
                                onChange={(e) => setExpiryDate(e.target.value)}
                                required
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 pl-12 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all [color-scheme:dark]"
                            />
                        </div>
                    </div>

                    <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4 flex gap-3">
                        <AlertCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                        <p className="text-[11px] text-emerald-500/80 leading-relaxed font-medium">
                            Warning: Manually changing the subscription status or expiry date will override any automated calculations and the gym's currently active plan.
                        </p>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-2xl transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isProcessing}
                            className="flex-1 px-6 py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                        >
                            {isProcessing ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
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

export default EditSubscriptionModal;
