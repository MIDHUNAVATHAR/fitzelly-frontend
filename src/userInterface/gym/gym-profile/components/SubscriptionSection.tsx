import React from 'react';
import { Wallet } from 'lucide-react';
import type { GymProfile } from '../../../../dtos/gym-profile.resDTO';

interface Props { profile: GymProfile | null; statusColor: string; }

const Item = ({ label, value, accent = '' }: { label: string; value: string; accent?: string }) => (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-3">
        <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">{label}</p>
        <p className={`mt-2 text-sm font-semibold ${accent || 'text-zinc-100'}`}>{value}</p>
    </div>
);

export const SubscriptionSection: React.FC<Props> = ({ profile, statusColor }) => {
    if (!profile || profile.subscriptionStatus === 'Pending') return null;
    const expiry = profile.expiryDate ? new Date(profile.expiryDate).getTime() : 0;
    const daysRemaining = expiry ? Math.max(0, Math.ceil((expiry - Date.now()) / 86400000)) : 0;
    const format = (value?: string) => value ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';
    return (
        <section className="rounded-[28px] border border-zinc-800 bg-zinc-900 p-4 sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
                <div><h3 className="text-lg font-semibold text-white">Subscription</h3><p className="text-sm text-zinc-400">Two-up cards stay readable on phones.</p></div>
                <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusColor}`}>{profile.subscriptionStatus}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <Item label="Plan" value={profile.planName || 'N/A'} />
                <Item label="Amount" value={`₹${profile.amount?.toLocaleString() || '0'}`} accent="text-emerald-400" />
                <Item label="Start" value={format(profile.startDate)} />
                <Item label="Expiry" value={format(profile.expiryDate)} accent="text-red-300" />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
                <Item label="Days Left" value={daysRemaining ? `${daysRemaining} days` : 'Expired'} accent="text-blue-300" />
                <Item label="Method" value={profile.paymentMethod || 'N/A'} />
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-950/60 px-3 py-3 text-sm text-zinc-300">
                <Wallet className="w-4 h-4 text-emerald-400" />
                <span>{profile.planName || 'Plan'} active on {profile.paymentMethod || 'payment method unavailable'}</span>
            </div>
        </section>
    );
};
