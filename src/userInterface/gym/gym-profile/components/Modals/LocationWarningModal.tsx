import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const LocationWarningModal: React.FC<{ onCancel: () => void; onConfirm: () => void; }> = ({ onCancel, onConfirm }) => (
    <div className="fixed inset-0 z-[110] flex items-end bg-black/80 p-0 sm:items-center sm:justify-center sm:p-4">
        <div className="w-full rounded-t-[28px] border border-red-500/30 bg-zinc-900 p-5 sm:max-w-md sm:rounded-3xl">
            <AlertTriangle className="mx-auto mb-3 w-12 h-12 text-red-400" />
            <h3 className="text-center text-lg font-bold text-white">Are you at the gym?</h3>
            <p className="mt-2 text-center text-sm text-zinc-400">Please confirm you are physically at the location before updating.</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
                <button onClick={onCancel} className="rounded-2xl border border-zinc-700 px-4 py-3 text-sm font-semibold text-white">Cancel</button>
                <button onClick={onConfirm} className="rounded-2xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-black">Confirm</button>
            </div>
        </div>
    </div>
);
