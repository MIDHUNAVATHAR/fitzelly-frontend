import React from 'react';
import { Camera, Edit3, Mail, MapPin, Phone } from 'lucide-react';
import type { GymProfile } from '../../../../dtos/gym-profile.resDTO';

interface Props {
    profile: GymProfile | null;
    formData?: GymProfile;
    isEditing?: boolean;
    fileInputRef?: React.RefObject<HTMLInputElement>;
    onFileChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onEditToggle: () => void;
    onFormChange?: (data: Partial<GymProfile>) => void;
    onSave?: () => void;
    onCancel?: () => void;
    isSaving?: boolean;
}

const Info = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) => (
    <div className="group">
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500">{label}</label>
        <div className="flex items-center gap-3 rounded-lg border border-zinc-800/50 bg-zinc-950/40 p-3 text-zinc-300">
            <Icon className="h-5 w-5 flex-shrink-0 text-emerald-400" />
            <span className="truncate">{value}</span>
        </div>
    </div>
);

const Logo = ({ profile, desktop = false }: Pick<Props, 'profile'> & { desktop?: boolean }) => (
    <div className={`${desktop ? 'absolute -top-16 left-8 h-32 w-32 rounded-full border-4' : 'h-20 w-20 rounded-3xl border'} flex items-center justify-center overflow-hidden border-zinc-900 bg-zinc-800 shadow-xl`}>
        {profile?.logoUrl ? (
            <img src={profile.logoUrl} alt="Gym Logo" className="h-full w-full object-cover" />
        ) : (
            <Camera className="m-auto h-7 w-7 text-zinc-600" />
        )}
    </div>
);

export const ProfileHeader: React.FC<Props> = (props) => {
    const { profile, onEditToggle } = props;
    return (
        <>
            <section className="relative overflow-hidden rounded-[28px] border border-zinc-800 bg-zinc-900 p-4 sm:hidden">
                <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top,rgba(52,211,153,0.18),transparent_65%)]" />
                <div className="relative flex flex-col gap-5">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-4">
                            <Logo profile={profile} />
                            <div className="min-w-0">
                                <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">Gym Profile</p>
                                <h1 className="truncate text-2xl font-bold text-white">{profile?.gymName || 'Gym Name'}</h1>
                                <p className="mt-1 text-sm text-zinc-400">{profile?.caption || 'Add a short tagline'}</p>
                            </div>
                        </div>
                        <button onClick={onEditToggle} className="rounded-2xl bg-emerald-400 px-3 py-2 text-sm font-semibold text-black">
                            Edit
                        </button>
                    </div>
                    <div className="grid gap-3">
                        <Info icon={Mail} label="Email" value={profile?.email || 'email@example.com'} />
                        <Info icon={Phone} label="Phone" value={profile?.phoneNumber || 'Not set'} />
                        <Info icon={MapPin} label="Address" value={profile?.address || 'Not set'} />
                    </div>
                </div>
            </section>

            <section className="hidden overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 sm:block">
                <div className="relative h-32 bg-gradient-to-r from-emerald-900/30 to-zinc-900">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-400/10 via-transparent to-transparent" />
                </div>
                <div className="relative px-8 pb-8">
                    <Logo profile={profile} desktop />
                    <div className="ml-40 pt-4">
                        <div className="mb-4 flex justify-end">
                            <button onClick={onEditToggle} className="flex items-center gap-2 rounded-lg bg-emerald-400 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-500">
                                <Edit3 className="h-4 w-4" />
                                Edit Profile
                            </button>
                        </div>
                        <h2 className="text-2xl font-bold text-white">{profile?.gymName || 'Gym Name'}</h2>
                        <p className="mt-1 text-zinc-400">{profile?.caption || 'Add a caption'}</p>
                    </div>
                    <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
                        <Info icon={Mail} label="Email Address" value={profile?.email || 'email@example.com'} />
                        <Info icon={Phone} label="Phone Number" value={profile?.phoneNumber || 'Not set'} />
                        <div className="md:col-span-2">
                            <Info icon={MapPin} label="Address" value={profile?.address || 'Not set'} />
                        </div>
                    </div>
                    <div className="mt-6">
                        <h3 className="mb-3 text-lg font-semibold text-white">About the Gym</h3>
                        <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-400">{profile?.description || 'No description provided yet.'}</p>
                    </div>
                </div>
            </section>
        </>
    );
};
