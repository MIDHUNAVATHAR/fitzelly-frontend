import React from 'react';
import type{ GymProfile } from '../../../../dtos/gym-profile.resDTO';

interface AboutSectionProps {
    profile: GymProfile | null;
    formData: GymProfile;
    isEditing: boolean;
    onFormChange: (data: Partial<GymProfile>) => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({
    profile,
    formData,
    isEditing,
    onFormChange,
}) => {
    if (!profile?.description && !isEditing) return null;

    return (
        <div className="border-t border-zinc-800 py-3">
            <div className="px-1">
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">About</h3>
                {isEditing ? (
                    <textarea
                        value={formData.description || ''}
                        onChange={e => onFormChange({ description: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-400 min-h-[80px]"
                        placeholder="Describe your gym..."
                    />
                ) : (
                    <p className="text-sm text-zinc-300 leading-relaxed">
                        {profile?.description || "No description yet."}
                    </p>
                )}
            </div>
        </div>
    );
};