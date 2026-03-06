import React from 'react';
import { X, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    isProcessing?: boolean;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'success' | 'primary';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    isProcessing = false,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger'
}) => {
    if (!isOpen) return null;

    const getVariantStyles = () => {
        switch (variant) {
            case 'success':
                return {
                    icon: <CheckCircle2 className="w-6 h-6" />,
                    iconBg: 'bg-emerald-500/10 text-emerald-500',
                    confirmBg: 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20'
                };
            case 'primary':
                return {
                    icon: <CheckCircle2 className="w-6 h-6" />,
                    iconBg: 'bg-blue-500/10 text-blue-500',
                    confirmBg: 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/20'
                };
            default: // danger
                return {
                    icon: <AlertTriangle className="w-6 h-6" />,
                    iconBg: 'bg-red-500/10 text-red-500',
                    confirmBg: 'bg-red-500 hover:bg-red-600 shadow-red-500/20'
                };
        }
    };

    const styles = getVariantStyles();

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
            <div className="bg-zinc-900 rounded-3xl w-full max-w-md overflow-hidden border border-zinc-800 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${styles.iconBg}`}>
                            {styles.icon}
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-lg">{title}</h3>
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
                <div className="p-8 space-y-6 text-zinc-300">
                    <p className="whitespace-pre-line">{message}</p>
                    <div className="flex gap-4 pt-4">
                        <button
                            onClick={onClose}
                            disabled={isProcessing}
                            className="flex-1 px-4 py-3 bg-zinc-800 text-white font-bold rounded-2xl hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isProcessing}
                            className={`flex-1 px-4 py-3 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${styles.confirmBg}`}
                        >
                            {isProcessing ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                confirmText
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;

