import React from 'react';
import { FileText } from 'lucide-react';

interface CertNameModalProps {
    certName: string;
    onCertNameChange: (name: string) => void;
    onCancel: () => void;
    onConfirm: () => void;
}

export const CertNameModal: React.FC<CertNameModalProps> = ({
    certName,
    onCertNameChange,
    onCancel,
    onConfirm,
}) => {
    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-zinc-900 rounded-2xl w-full max-w-sm overflow-hidden border border-zinc-800 p-6">
                <div className="flex flex-col items-center text-center">
                    <div className="w-14 h-14 bg-emerald-400/10 rounded-full flex items-center justify-center mb-4">
                        <FileText className="w-7 h-7 text-emerald-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">Certificate Name</h3>
                    <p className="text-zinc-500 text-sm mb-5">Enter a descriptive name for this document.</p>
                    <input
                        type="text"
                        value={certName}
                        onChange={(e) => onCertNameChange(e.target.value)}
                        placeholder="e.g. Health License 2024"
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-400 mb-5"
                        autoFocus
                    />
                    <div className="flex gap-3 w-full">
                        <button
                            onClick={onCancel}
                            className="flex-1 px-4 py-2.5 bg-zinc-800 text-white font-medium rounded-xl hover:bg-zinc-700 transition-colors text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={!certName.trim()}
                            className="flex-1 px-4 py-2.5 bg-emerald-400 text-black font-medium rounded-xl hover:bg-emerald-500 transition-colors disabled:opacity-50 text-sm"
                        >
                            Continue
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};