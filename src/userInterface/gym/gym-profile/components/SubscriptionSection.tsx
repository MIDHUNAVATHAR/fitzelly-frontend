import React from 'react';
import {  Wallet } from 'lucide-react';
import type { GymProfile } from '../../../../dtos/gym-profile.resDTO';

interface SubscriptionSectionProps {
    profile: GymProfile | null;
    statusColor: string;
}

export const SubscriptionSection: React.FC<SubscriptionSectionProps> = ({
    profile,
    statusColor,
}) => {
    if (!profile) return null;

    const formatDate = (date: string | undefined) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const getDaysRemaining = () => {
        if (!profile?.expiryDate) return 0;
        const diff = new Date(profile.expiryDate).getTime() - new Date().getTime();
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    };

    const daysRemaining = getDaysRemaining();

    return (
        <div className="border-t border-zinc-800 py-3">
            <div className="px-1">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                        Subscription
                    </h3>
                    <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                        {profile?.subscriptionStatus}
                    </div>
                </div>

                <div className="bg-zinc-900/30 rounded-xl p-3 space-y-2">
                    {/* Plan & Amount */}
                    <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">
                            {profile?.planName || 'N/A'}
                        </span>
                        <span className="text-emerald-400 font-bold">
                            ₹{profile?.amount?.toLocaleString() || '0'}
                        </span>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-zinc-800/50" />

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                            <p className="text-xs text-zinc-500">Start</p>
                            <p className="text-zinc-300">{formatDate(profile?.startDate)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-zinc-500">Expires</p>
                            <p className="text-zinc-300">{formatDate(profile?.expiryDate)}</p>
                        </div>
                    </div>

                    {/* Days Remaining */}
                    {daysRemaining > 0 && (
                        <div className="flex items-center justify-between pt-1">
                            <span className="text-xs text-zinc-500">Days Remaining</span>
                            <span className="text-blue-400 font-bold">{daysRemaining} Days</span>
                        </div>
                    )}

                    {/* Payment Method */}
                    {profile?.paymentMethod && (
                        <div className="flex items-center gap-1.5 text-xs text-zinc-400 pt-1 border-t border-zinc-800/50">
                            <Wallet className="w-3 h-3" />
                            <span>Paid via {profile.paymentMethod}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};