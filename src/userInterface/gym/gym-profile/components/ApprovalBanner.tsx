import React from 'react';
import { AlertTriangle, Clock } from 'lucide-react';
import type { GymProfile } from '../../../../dtos/gym-profile.resDTO';

interface ApprovalBannerProps {
    profile: GymProfile | null;
    isReApplying: boolean;
    onReApply: () => void;
}

export const ApprovalBanner: React.FC<ApprovalBannerProps> = ({ profile, isReApplying, onReApply }) => {
    if (profile?.approvalStatus === "Approved" || !profile) return null;

    return (
        <div className={`mb-3 rounded-xl p-3 border ${
            profile?.approvalStatus === 'Rejected' 
                ? 'bg-red-500/10 border-red-500/30' 
                : 'bg-amber-500/10 border-amber-500/30'
        }`}>
            <div className="flex items-start gap-2.5">
                {profile?.approvalStatus === 'Rejected' ? (
                    <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                ) : (
                    <Clock className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${
                        profile?.approvalStatus === 'Rejected' ? 'text-red-500' : 'text-amber-400'
                    }`}>
                        {profile?.approvalStatus === 'Rejected' ? 'Rejected' : 'Pending Review'}
                    </p>
                    {profile?.approvalStatus === 'Rejected' ? (
                        <div className="space-y-2">
                            <p className="text-xs text-red-200/80">
                                {profile.rejectionReason || "No reason provided."}
                            </p>
                            <button
                                onClick={onReApply}
                                disabled={isReApplying}
                                className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                            >
                                {isReApplying ? "Submitting..." : "Re-apply"}
                            </button>
                        </div>
                    ) : (
                        <p className="text-xs text-amber-200/80">
                            Under review. Approval = 30-day free trial!
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};