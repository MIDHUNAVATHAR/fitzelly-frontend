import React, { useState, useEffect, useCallback } from 'react';
import { isAxiosError } from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import RejectGymModal from '../../../components/super-admin/RejectGymModal';
import EditSubscriptionModal from '../../../components/super-admin/EditSubscriptionModal';
import { getGymById, approveGym, rejectGym, updateGymSubscription } from "../../../api/superAdmin-gyms.api";
import type { Gym } from "../../../api/superAdmin-gyms.api";
import { Loader2, ArrowLeft, Mail, Phone, MapPin, Building2, Calendar, ShieldCheck, CheckCircle2, FileText, Eye, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ConfirmModal from '../../../components/ui/ConfirmModal';

const ViewGym: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [gym, setGym] = useState<Gym | null>(null);
    const [loading, setLoading] = useState(true);
    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [isEditSubscriptionModalOpen, setIsEditSubscriptionModalOpen] = useState(false);
    const [isApproving, setIsApproving] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    const [isEditingSubscription, setIsEditingSubscription] = useState(false);

    const fetchDetails = useCallback(async () => {
        if (!id) return;
        try {
            setLoading(true);
            const data = await getGymById(id);
            setGym(data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load gym details");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchDetails();
    }, [id, fetchDetails]);

    const handleApprove = async () => {
        if (!id) return;
        try {
            setIsApproving(true);
            await approveGym(id);
            toast.success("Gym approved and trial subscription started");
            setIsApproveModalOpen(false);
            await fetchDetails(); // Refresh data
        } catch (error: unknown) {
            console.error(error);
            let errorMessage = "Failed to approve gym";
            if (isAxiosError(error)) {
                errorMessage = error.response?.data?.message || errorMessage;
            }
            toast.error(errorMessage);
        } finally {
            setIsApproving(false);
        }
    };

    const handleReject = async (reason: string) => {
        if (!id) return;
        try {
            setIsRejecting(true);
            await rejectGym(id, reason);
            toast.success("Gym rejected successfully");
            setIsRejectModalOpen(false);
            await fetchDetails(); // Refresh data
        } catch (error: unknown) {
            console.error(error);
            let errorMessage = "Failed to reject gym";
            if (isAxiosError(error)) {
                errorMessage = error.response?.data?.message || errorMessage;
            }
            toast.error(errorMessage);
        } finally {
            setIsRejecting(false);
        }
    };

    const handleEditSubscription = async (status: string, expiryDate: string) => {
        if (!id) return;
        try {
            setIsEditingSubscription(true);
            await updateGymSubscription(id, status, expiryDate);
            toast.success("Subscription updated successfully");
            setIsEditSubscriptionModalOpen(false);
            await fetchDetails();
        } catch (error: unknown) {
            console.error(error);
            let errorMessage = "Failed to update subscription";
            if (isAxiosError(error)) {
                errorMessage = error.response?.data?.message || errorMessage;
            }
            toast.error(errorMessage);
        } finally {
            setIsEditingSubscription(false);
        }
    };

    const formatDate = (dateString?: string): string => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-IN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch {
            return 'Invalid Date';
        }
    };


    const getStatusColor = (status: string | undefined) => {
        switch (status) {
            case 'Active':
            case 'Approved': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
            case 'Trial':
            case 'Pending': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
            case 'Reapplied': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
            case 'Rejected':
            case 'Expired': return 'text-red-400 bg-red-400/10 border-red-400/20';
            default: return 'text-zinc-400 bg-zinc-800 border-zinc-700';
        }
    };

    if (loading) return (
        <div className="flex flex-col justify-center items-center h-[60vh] gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
            <p className="text-zinc-500 animate-pulse">Loading gym details...</p>
        </div>
    );

    if (!gym) return (
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
            <Building2 className="w-16 h-16 text-zinc-800" />
            <p className="text-zinc-400">Gym not found</p>
            <button onClick={() => navigate('/super-admin/gyms')} className="text-emerald-500 hover:text-emerald-400 transition-colors flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Go back to list
            </button>
        </div>
    );



    return (
        <div className="w-full mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
            {/* Header / Navigation */}
            <div className="flex justify-between items-center sm:hidden px-1">
                <button
                    onClick={() => navigate('/super-admin/gyms')}
                    className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-lg font-bold text-white">Gym Profile</h1>
                <div className="w-9" />
            </div>

            <div className="hidden sm:flex justify-between items-center">
                <button
                    onClick={() => navigate('/super-admin/gyms')}
                    className="group flex items-center gap-2 text-zinc-500 hover:text-white transition-colors"
                >
                    <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 group-hover:border-emerald-500/50 group-hover:bg-emerald-500/5 transition-all">
                        <ArrowLeft className="w-5 h-5" />
                    </div>
                    <span className="font-medium">Back to Gyms</span>
                </button>
                <div className="flex gap-3">
                    {(gym.approvalStatus === 'Pending' || gym.approvalStatus === 'Reapplied') && (
                        <>
                            <button
                                onClick={() => setIsRejectModalOpen(true)}
                                className="flex items-center gap-2 px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-red-500 font-bold rounded-xl border border-red-500/20 transition-all shadow-lg"
                            >
                                <X className="w-5 h-5" />
                                Reject Gym
                            </button>
                            <button
                                onClick={() => setIsApproveModalOpen(true)}
                                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl border border-emerald-400/20 transition-all shadow-lg shadow-emerald-500/20"
                            >
                                <CheckCircle2 className="w-5 h-5" />
                                Approve Gym
                            </button>
                        </>
                    )}
                    {gym.approvalStatus === 'Rejected' && (
                        <button
                            onClick={() => setIsApproveModalOpen(true)}
                            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl border border-emerald-400/20 transition-all shadow-lg shadow-emerald-500/20"
                        >
                            <CheckCircle2 className="w-5 h-5" />
                            Approve Gym
                        </button>
                    )}
                </div>
            </div>



            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-3 space-y-6">
                    {/* Main Identity Card */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
                        <div className="h-32 sm:h-48 bg-gradient-to-br from-emerald-900/40 via-zinc-900 to-zinc-900 relative">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,_rgba(16,185,129,0.1),transparent)]"></div>
                        </div>

                        <div className="px-6 sm:px-10 pb-10 relative">
                            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-zinc-800 border-4 border-zinc-950 absolute -top-12 sm:-top-16 flex items-center justify-center overflow-hidden shadow-2xl ring-1 ring-white/10">
                                {gym.logoUrl ? (
                                    <img src={gym.logoUrl} alt={gym.gymName} className="w-full h-full object-cover" />
                                ) : (
                                    <Building2 className="w-12 h-12 text-zinc-600" />
                                )}
                            </div>

                            <div className="ml-28 sm:ml-40 pt-4 sm:pt-6">
                                <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">{gym.gymName}</h2>
                                <p className="text-emerald-400 font-medium text-sm sm:text-base mt-1">{gym.caption || "Elite Fitness Partner"}</p>
                            </div>

                            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Primary Email</label>
                                    <div className="flex items-center gap-3 p-4 bg-zinc-950/80 rounded-2xl border border-zinc-800/50 group hover:border-emerald-500/30 transition-all duration-300">
                                        <Mail className="w-5 h-5 text-emerald-500/70" />
                                        <span className="text-zinc-200 font-medium truncate">{gym.email}</span>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Contact Line</label>
                                    <div className="flex items-center gap-3 p-4 bg-zinc-950/80 rounded-2xl border border-zinc-800/50 group hover:border-emerald-500/30 transition-all duration-300">
                                        <Phone className="w-5 h-5 text-emerald-500/70" />
                                        <span className="text-zinc-200 font-medium">{gym.phone || "Not provided"}</span>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Joined Date</label>
                                    <div className="flex items-center gap-3 p-4 bg-zinc-950/80 rounded-2xl border border-zinc-800/50 group hover:border-emerald-500/30 transition-all duration-300">
                                        <Calendar className="w-5 h-5 text-emerald-500/70" />
                                        <span className="text-zinc-200 font-medium">{formatDate(gym.createdAt)}</span>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Approval Status</label>
                                    <div className={`flex items-center gap-3 p-4 bg-zinc-950/80 rounded-2xl border border-zinc-800/50 group hover:border-emerald-500/30 transition-all duration-300 ${getStatusColor(gym.approvalStatus).split(' ')[0]}`}>
                                        <ShieldCheck className="w-5 h-5 opacity-70" />
                                        <span className="font-bold">{gym.approvalStatus}</span>
                                    </div>
                                </div>

                                <div className="space-y-1 md:col-span-2">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Business Address</label>
                                    <div className="flex items-center gap-3 p-4 bg-zinc-950/80 rounded-2xl border border-zinc-800/50 group hover:border-emerald-500/30 transition-all duration-300">
                                        <MapPin className="w-5 h-5 text-emerald-500/70 flex-shrink-0" />
                                        <span className="text-zinc-200 font-medium leading-relaxed">{gym.address || "No address on file"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* About Section */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                            <h3 className="text-xl font-bold text-white">Description</h3>
                        </div>
                        <p className="text-zinc-400 text-base leading-relaxed whitespace-pre-line bg-zinc-950/30 rounded-2xl p-6 border border-zinc-800/30">
                            {gym.description || "The gym has not provided a platform description yet."}
                        </p>
                    </div>

                    {/* Rejection Reason (Conditional) */}
                    {gym.approvalStatus === 'Rejected' && gym.rejectionReason && (
                        <div className="bg-red-500/5 border border-red-500/10 rounded-3xl p-8 shadow-xl">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-1.5 h-6 bg-red-500 rounded-full"></div>
                                <h3 className="text-xl font-bold text-red-500">Rejection Reason</h3>
                            </div>
                            <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-2xl">
                                <p className="text-zinc-400 text-base leading-relaxed">
                                    {gym.rejectionReason}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Verification Documents Section */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-xl">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-1.5 h-6 bg-emerald-400 rounded-full"></div>
                            <h3 className="text-xl font-bold text-white">Verification Certificates</h3>
                        </div>

                        {gym.certificates && gym.certificates.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                                {gym.certificates.map((cert) => (
                                    <div key={cert.key} className="group bg-zinc-950/50 border border-zinc-800/30 rounded-xl overflow-hidden hover:border-emerald-500/30 transition-all duration-300">
                                        <div className="aspect-[3/4] bg-zinc-900 flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-zinc-900 to-black">
                                            {cert.type === 'PDF' ? (
                                                <div className="flex flex-col items-center gap-1">
                                                    <FileText className="w-8 h-8 text-zinc-700" />
                                                    <span className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest">PDF</span>
                                                </div>
                                            ) : (
                                                <img src={cert.url} alt={cert.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                                            )}

                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                                                <a
                                                    href={cert.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 bg-white text-black rounded-full hover:scale-110 transition-transform"
                                                    title="View Document"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </a>
                                            </div>
                                        </div>
                                        <div className="p-2 bg-zinc-900/50">
                                            <h4 className="text-[10px] font-bold text-zinc-300 truncate text-center">{cert.name}</h4>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-10 rounded-2xl bg-zinc-950/20 border border-dashed border-zinc-800/50 flex flex-col items-center justify-center text-center">
                                <ShieldCheck className="w-12 h-12 text-zinc-800 mb-4" />
                                <p className="text-zinc-500 font-medium">No verification documents uploaded yet.</p>
                                <p className="text-zinc-600 text-xs mt-1">Gyms can upload their licenses or certificates for verification.</p>
                            </div>
                        )}
                    </div>

                    {/* Subscription Details Section */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-xl">
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                                <h3 className="text-xl font-bold text-white">Current Subscription</h3>
                            </div>
                            {gym.approvalStatus === 'Approved' && (
                                <button
                                    onClick={() => setIsEditSubscriptionModalOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 font-bold rounded-xl border border-emerald-500/20 transition-all text-sm"
                                >
                                    <FileText className="w-4 h-4" />
                                    Edit Subscription
                                </button>
                            )}
                        </div>

                        {gym.latestSubscription ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="p-5 rounded-2xl bg-zinc-950/50 border border-zinc-800/50">
                                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Current Plan</p>
                                    <p className="text-lg font-bold text-white">{gym.latestSubscription.planName}</p>
                                </div>
                                <div className="p-5 rounded-2xl bg-zinc-950/50 border border-zinc-800/50">
                                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Amount Paid</p>
                                    <p className="text-lg font-bold text-emerald-400">₹{gym.latestSubscription.amount}</p>
                                </div>
                                <div className="p-5 rounded-2xl bg-zinc-950/50 border border-zinc-800/50">
                                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Start Date</p>
                                    <p className="text-sm font-bold text-zinc-300">{formatDate(gym.latestSubscription.startDate)}</p>
                                </div>
                                <div className="p-5 rounded-2xl bg-zinc-950/50 border border-zinc-800/50">
                                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">End Date</p>
                                    <p className="text-sm font-bold text-zinc-300">{formatDate(gym.latestSubscription.endDate)}</p>
                                </div>
                                <div className="p-5 rounded-2xl bg-zinc-950/50 border border-zinc-800/50">
                                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Payment Method</p>
                                    <p className="text-sm font-bold text-zinc-300 capitalize">{gym.latestSubscription.paymentGateway || 'nill'}</p>
                                </div>
                                <div className="p-5 rounded-2xl bg-zinc-950/50 border border-zinc-800/50">
                                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Status</p>
                                    <div className={`text-sm font-bold capitalize ${getStatusColor(gym.subscriptionStatus).split(' ')[0]}`}>
                                        {gym.subscriptionStatus}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-10 rounded-2xl bg-zinc-950/30 border border-dashed border-zinc-800 flex flex-col items-center justify-center text-center">
                                <ShieldCheck className="w-12 h-12 text-zinc-700 mb-4" />
                                <p className="text-zinc-500 font-medium">No subscription records found for this gym.</p>
                                <p className="text-zinc-600 text-xs mt-1">Subscriptions will appear here once the gym starts a trial or makes a payment.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* Approval Confirmation Modal */}
            <ConfirmModal
                isOpen={isApproveModalOpen}
                onClose={() => setIsApproveModalOpen(false)}
                onConfirm={handleApprove}
                title="Approve Gym Account?"
                message={`If approved, a trial subscription period will be started for this gym automatically.\n\nThis will allow the gym to access all management features until the trial expires.`}
                confirmText="Confirm Approval"
                variant="success"
                isProcessing={isApproving}
            />

            {/* Rejection Modal */}
            <RejectGymModal
                isOpen={isRejectModalOpen}
                onClose={() => setIsRejectModalOpen(false)}
                onConfirm={handleReject}
                isProcessing={isRejecting}
            />

            {/* Edit Subscription Modal */}
            <EditSubscriptionModal
                isOpen={isEditSubscriptionModalOpen}
                onClose={() => setIsEditSubscriptionModalOpen(false)}
                onConfirm={handleEditSubscription}
                currentStatus={gym.subscriptionStatus}
                currentExpiryDate={gym.expiryDate || ""}
                isProcessing={isEditingSubscription}
            />
        </div>
    );
};

export default ViewGym;
