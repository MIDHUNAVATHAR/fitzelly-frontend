import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface LocationWarningModalProps {
    onCancel: () => void;
    onConfirm: () => void;
}

export const LocationWarningModal: React.FC<LocationWarningModalProps> = ({
    onCancel,
    onConfirm,
}) => {
    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-zinc-900 rounded-2xl w-full max-w-sm overflow-hidden border border-red-500/30 p-6 text-center">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white mb-2">Are you at the gym?</h3>
                <p className="text-zinc-400 text-sm mb-6">
                    Please ensure you are physically standing at your gym's location for accuracy.
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-2.5 bg-zinc-800 text-white font-semibold rounded-xl text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 px-4 py-2.5 bg-emerald-400 text-black font-semibold rounded-xl text-sm"
                    >
                        Yes, I'm here
                    </button>
                </div>
            </div>
        </div>
    );
};