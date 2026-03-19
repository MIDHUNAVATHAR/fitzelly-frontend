import React, { useState, useEffect } from 'react';
import { X, Loader } from 'lucide-react';
import type { Enquiry } from '../../../api/enquiry.api';

interface EnquiryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
    enquiry?: Enquiry | null;
    title: string;
}

const EnquiryModal: React.FC<EnquiryModalProps> = ({ isOpen, onClose, onSave, enquiry, title }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        phoneNumber: '',
        email: '',
        status: 'PENDING' as any
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (enquiry) {
            setFormData({
                fullName: enquiry.fullName,
                phoneNumber: enquiry.phoneNumber,
                email: enquiry.email || '',
                status: enquiry.status
            });
        } else {
            setFormData({
                fullName: '',
                phoneNumber: '',
                email: '',
                status: 'PENDING'
            });
        }
    }, [enquiry, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await onSave(formData);
            onClose();
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-6 border-b border-zinc-800">
                    <h2 className="text-xl font-bold text-white">{title}</h2>
                    <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Full Name *</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                            value={formData.fullName}
                            onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                            placeholder="John Doe"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Phone Number *</label>
                        <input
                            type="tel"
                            required
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                            value={formData.phoneNumber}
                            onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                            placeholder="+1 234 567 890"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Email Address</label>
                        <input
                            type="email"
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            placeholder="john@example.com"
                        />
                    </div>

                    {enquiry && (
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-1">Status</label>
                            <select
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                            >
                                <option value="PENDING">Pending</option>
                                <option value="CONTACTED">Contacted</option>
                                <option value="CONVERTED">Converted</option>
                            </select>
                        </div>
                    )}

                    <div className="pt-2 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors font-medium border border-zinc-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex-1 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors font-bold flex items-center justify-center gap-2"
                        >
                            {isSaving && <Loader className="w-4 h-4 animate-spin" />}
                            {enquiry ? 'Update Enquiry' : 'Add Enquiry'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EnquiryModal;
