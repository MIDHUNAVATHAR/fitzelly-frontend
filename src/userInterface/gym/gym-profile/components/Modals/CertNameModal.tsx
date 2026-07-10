import React from 'react';
import { FileText } from 'lucide-react';

export const CertNameModal: React.FC<{ certName: string; onCertNameChange: (name: string) => void; onCancel: () => void; onConfirm: () => void; }> = ({ certName, onCertNameChange, onCancel, onConfirm }) => (
    <div className="fixed inset-0 z-[120] flex items-end bg-black/80 p-0 sm:items-center sm:justify-center sm:p-4">
        <div className="w-full rounded-t-[28px] border border-zinc-800 bg-zinc-900 p-5 sm:max-w-md sm:rounded-3xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-400"><FileText className="w-7 h-7" /></div>
            <h3 className="text-center text-lg font-bold text-white">Certificate Name</h3>
            <p className="mt-1 text-center text-sm text-zinc-500">Enter a descriptive name for the upload.</p>
            <input value={certName} onChange={(e) => onCertNameChange(e.target.value)} placeholder="e.g. Health License 2024" className="mt-5 w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400" autoFocus />
            <div className="mt-5 grid grid-cols-2 gap-3">
                <button onClick={onCancel} className="rounded-2xl border border-zinc-700 px-4 py-3 text-sm font-semibold text-white">Cancel</button>
                <button onClick={onConfirm} disabled={!certName.trim()} className="rounded-2xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-black disabled:opacity-50">Continue</button>
            </div>
        </div>
    </div>
);
