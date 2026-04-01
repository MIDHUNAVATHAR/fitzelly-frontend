import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface RejectGymModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    isProcessing?: boolean;
}

const RejectGymModal: React.FC<RejectGymModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    isProcessing = false
}) => {
    const [reason, setReason] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (reason.trim()) {
            onConfirm(reason);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
            <div className="bg-zinc-900 rounded-3xl w-full max-w-md overflow-hidden border border-zinc-800 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-red-500/10 text-red-500">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-lg">Reject Gym Account?</h3>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors"
                        disabled={isProcessing}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-zinc-400">Rejection Reason</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Please provide a reason for rejection..."
                            className="w-full h-32 bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-white placeholder-zinc-600 focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 outline-none transition-all resize-none"
                            required
                        />
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isProcessing}
                            className="flex-1 px-4 py-3 bg-zinc-800 text-white font-bold rounded-2xl hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isProcessing || !reason.trim()}
                            className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isProcessing ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Rejecting...
                                </>
                            ) : (
                                "Confirm Rejection"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RejectGymModal;
