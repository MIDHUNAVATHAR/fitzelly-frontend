import React from 'react';
import { Mail, Phone, MapPin, Edit3, Camera, Save, X } from 'lucide-react';
import type { GymProfile } from '../../../../dtos/gym-profile.resDTO';

interface ProfileHeaderProps {
    profile: GymProfile | null;
    formData: GymProfile;
    isEditing: boolean;
    fileInputRef: React.RefObject<HTMLInputElement>;
    onEditToggle: () => void;
    onFormChange: (data: Partial<GymProfile>) => void;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSave: () => void;
    onCancel: () => void;
    isSaving: boolean;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
    profile,
    formData,
    isEditing,
    fileInputRef,
    onEditToggle,
    onFormChange,
    onFileChange,
    onSave,
    onCancel,
    isSaving,
}) => {
    return (
        <div className="bg-zinc-900/50 rounded-xl overflow-hidden mb-3">
            <div className="p-4">
                {/* Header with Edit Button */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Logo */}
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={onFileChange}
                        />
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="w-14 h-14 rounded-xl bg-zinc-800 flex items-center justify-center group cursor-pointer overflow-hidden flex-shrink-0 border-2 border-zinc-700"
                        >
                            {profile?.logoUrl || formData.logoUrl ? (
                                <img
                                    src={profile?.logoUrl || formData.logoUrl}
                                    alt="Gym Logo"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <Camera className="w-5 h-5 text-zinc-600 group-hover:text-zinc-400" />
                            )}
                        </div>

                        {/* Name and Caption */}
                        <div className="flex-1 min-w-0">
                            {isEditing ? (
                                <div className="space-y-2">
                                    <input
                                        type="text"
                                        value={formData.gymName || ''}
                                        onChange={e => onFormChange({ gymName: e.target.value })}
                                        className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-white text-base font-bold focus:outline-none focus:border-emerald-400"
                                        placeholder="Gym Name"
                                    />
                                    <input
                                        type="text"
                                        value={formData.caption || ''}
                                        onChange={e => onFormChange({ caption: e.target.value })}
                                        className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-zinc-400 text-sm focus:outline-none focus:border-emerald-400"
                                        placeholder="Tagline"
                                    />
                                </div>
                            ) : (
                                <>
                                    <h1 className="text-xl font-bold text-white truncate">
                                        {profile?.gymName || "Gym Name"}
                                    </h1>
                                    <p className="text-sm text-zinc-400 truncate">
                                        {profile?.caption || "Add a tagline"}
                                    </p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Edit/Save Buttons */}
                    {isEditing ? (
                        <div className="flex gap-1 flex-shrink-0 ml-2">
                            <button
                                onClick={onCancel}
                                className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                            <button
                                onClick={onSave}
                                disabled={isSaving}
                                className="p-2 rounded-lg bg-emerald-400 text-black hover:bg-emerald-500 transition-colors disabled:opacity-50"
                            >
                                {isSaving ? (
                                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={onEditToggle}
                            className="p-2 rounded-lg bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors flex-shrink-0"
                        >
                            <Edit3 className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Contact Info - Compact */}
                {!isEditing ? (
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-zinc-400">
                        <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="truncate">{profile?.email || "email@example.com"}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{profile?.phoneNumber || "Not set"}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="truncate">{profile?.address || "Not set"}</span>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2 mt-1">
                        <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                            <input
                                type="text"
                                value={formData.phoneNumber || ''}
                                onChange={e => onFormChange({ phoneNumber: e.target.value })}
                                className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-emerald-400"
                                placeholder="Phone number"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                            <input
                                type="text"
                                value={formData.address || ''}
                                onChange={e => onFormChange({ address: e.target.value })}
                                className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-emerald-400"
                                placeholder="Address"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};