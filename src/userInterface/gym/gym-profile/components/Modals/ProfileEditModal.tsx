import React from 'react';
import { Camera, MapPin, Phone, X, UserRound, MessageSquareText } from 'lucide-react';
import type { GymProfile } from '../../../../../dtos/gym-profile.resDTO';

interface Props {
    profile: GymProfile | null;
    formData: GymProfile;
    isOpen: boolean;
    isSaving: boolean;
    fileInputRef: React.RefObject<HTMLInputElement>;
    onClose: () => void;
    onChange: (data: GymProfile) => void;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSave: () => void;
}

const Field = ({ icon: Icon, label, value, onChange, placeholder, type = 'text', area }: any) => (
    <label className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">{label}</span>
        {area ? (
            <textarea value={value} onChange={onChange} placeholder={placeholder} className="w-full min-h-28 rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400" />
        ) : (
            <div className="relative">
                <Icon className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-emerald-400" />
                <input value={value} onChange={onChange} type={type} placeholder={placeholder} className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-emerald-400" />
            </div>
        )}
    </label>
);

export const ProfileEditModal: React.FC<Props> = ({ profile, formData, isOpen, isSaving, fileInputRef, onClose, onChange, onFileChange, onSave }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-sm sm:p-4">
            <div className="flex h-full items-end sm:items-center sm:justify-center">
                <div className="w-full h-[92vh] overflow-y-auto rounded-t-[28px] border border-zinc-800 bg-zinc-900 p-5 sm:h-auto sm:max-h-[90vh] sm:max-w-3xl sm:rounded-3xl">
                    <div className="mb-5 flex items-start justify-between gap-4">
                        <div>
                            <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">Edit Profile</p>
                            <h3 className="mt-1 text-xl font-bold text-white">Update gym details</h3>
                        </div>
                        <button onClick={onClose} className="rounded-full border border-zinc-700 p-2 text-zinc-400"><X className="w-4 h-4" /></button>
                    </div>
                    <div className="mb-5 flex items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                        <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={onFileChange} />
                        <button onClick={() => fileInputRef.current?.click()} className="group flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-900">
                            {formData.logoUrl || profile?.logoUrl ? (
                                <img src={formData.logoUrl || profile?.logoUrl} alt="Gym Logo" className="h-full w-full object-cover" />
                            ) : (
                                <Camera className="h-7 w-7 text-zinc-500 group-hover:text-emerald-400" />
                            )}
                        </button>
                        <div>
                            <p className="text-sm font-semibold text-white">Gym Logo</p>
                            <p className="mt-1 text-xs text-zinc-500">Tap the logo to upload and crop a new image.</p>
                        </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <Field icon={UserRound} label="Gym Name" value={formData.gymName || ''} onChange={(e: any) => onChange({ ...formData, gymName: e.target.value })} placeholder="Gym name" />
                        <Field icon={MessageSquareText} label="Caption" value={formData.caption || ''} onChange={(e: any) => onChange({ ...formData, caption: e.target.value })} placeholder="Short tagline" />
                        <Field icon={Phone} label="Phone Number" value={formData.phoneNumber || ''} onChange={(e: any) => onChange({ ...formData, phoneNumber: e.target.value })} placeholder="Phone number" />
                        <Field icon={MapPin} label="Address" value={formData.address || ''} onChange={(e: any) => onChange({ ...formData, address: e.target.value })} placeholder="Gym address" />
                        <label className="space-y-2 md:col-span-2">
                            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">About Gym</span>
                            <textarea value={formData.description || ''} onChange={(e) => onChange({ ...formData, description: e.target.value })} placeholder="Tell members what makes your gym special" className="w-full min-h-32 rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400" />
                        </label>
                    </div>
                    <div className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 text-sm text-zinc-400">
                        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Email</p>
                        <p className="mt-1 break-all text-zinc-200">{profile?.email || 'email@example.com'}</p>
                    </div>
                    <div className="mt-5 flex gap-3">
                        <button onClick={onClose} className="flex-1 rounded-2xl border border-zinc-700 px-4 py-3 text-sm font-semibold text-white">Cancel</button>
                        <button onClick={onSave} disabled={isSaving} className="flex-1 rounded-2xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-black disabled:opacity-50">{isSaving ? 'Saving...' : 'Save Changes'}</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
