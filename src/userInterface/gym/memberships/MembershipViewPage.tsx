import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Calendar, CalendarRange, ShieldCheck, Dumbbell,
    CreditCard, Plus, Clock, Edit3, Trash2, Activity, Info
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getMembershipById, deletePayment } from '../../../api/membership.api';
import type { Membership, Payment } from '../../../api/membership.api';
import AddPaymentModal from './AddPaymentModal';
import { isAxiosError } from 'axios';


type PaymentSummary = {
    totalPaid: number;
    planAmount: number;
    paymentStatus: string;
    payments: Payment[];
};

const MembershipViewPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [membership, setMembership] = useState<Membership | null>(null);
    const [paymentSummary, setPaymentSummary] = useState<PaymentSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Payment Modals
    const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

    const fetchMembershipData = useCallback(async () => {
        if (!id) return;
        setIsLoading(true);
        try {
            const data = await getMembershipById(id);
            setMembership(data.membership);
            setPaymentSummary(data.paymentSummary);
        } catch (error) {
            if (isAxiosError(error)) {
                toast.error(error.response?.data?.message || 'Failed to load membership details');
            } else {
                toast.error('Failed to load membership details');
            }
            navigate('/gym/memberships');
        } finally {
            setIsLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        fetchMembershipData();
    }, [fetchMembershipData]);

    const handleEditPayment = (payment: Payment) => {
        setSelectedPayment(payment);
        setIsAddPaymentModalOpen(true);
    };

    const handleDeletePayment = async (paymentId: string) => {
        if (!confirm('Are you sure you want to delete this payment record? This will recalculate the payment status.')) return;

        try {
            await deletePayment(paymentId);
            toast.success('Payment deleted successfully');
            fetchMembershipData();
        } catch (error) {
            if (isAxiosError(error)) {
                toast.error(error.response?.data?.message || 'Failed to delete payment');
            } else {
                toast.error('Failed to delete payment');
            }
        }
    };

    // Formatter helpers
    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    const StatusBadge = ({ status }: { status?: string }) => {
        if (!status) return null;
        if (status === 'ACTIVE') {
            return (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">
                    <Activity className="w-3.5 h-3.5" /> ACTIVE
                </div>
            );
        }
        return (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-400/10 text-red-400 border border-red-400/20">
                <div className="w-2 h-2 rounded-full bg-red-400" /> EXPIRED
            </div>
        );
    };

    const PaymentStatusBadge = ({ status }: { status: string }) => {
        if (status === 'PAID') {
            return (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">
                    <ShieldCheck className="w-4 h-4" /> FULLY PAID
                </div>
            );
        }
        if (status === 'PARTIAL') {
            return (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-400/10 text-amber-400 border border-amber-400/20">
                    <Clock className="w-4 h-4" /> PARTIALLY PAID
                </div>
            );
        }
        return (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-red-400/10 text-red-400 border border-red-400/20">
                <Info className="w-4 h-4" /> UNPAID
            </div>
        );
    };

    if (isLoading || !membership || !paymentSummary) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const { totalPaid, planAmount, paymentStatus, payments } = paymentSummary;

    return (
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate('/gym/memberships')}
                    className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
                        Membership Details
                        <StatusBadge status={membership.status} />
                    </h1>
                    <p className="text-zinc-400 mt-1 text-sm sm:text-base">Comprehensive view of membership and payments.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ---------- MEMBERSHIP INFO SECTION ---------- */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                        {/* Decorative gradient */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                        <div className="flex items-start justify-between relative z-10 mb-8 pb-8 border-b border-zinc-800/50">
                            <div className="flex items-center gap-5">
                                {/* Client Photo Placeholder */}
                                <div className="w-20 h-20 rounded-2xl bg-zinc-800 border-2 border-emerald-500/30 flex items-center justify-center shadow-inner overflow-hidden">
                                    <div className="w-full h-full bg-emerald-400/10 text-emerald-400 flex items-center justify-center font-bold text-3xl uppercase">
                                        {membership.clientName.charAt(0)}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-emerald-400 uppercase tracking-wider h-[20px]">
                                        {membership.planType === 'DAY_BASED' ? 'Day Plan' : 'Category Plan'}
                                    </p>
                                    <h2 className="text-2xl font-bold text-white tracking-tight">{membership.clientName}</h2>
                                    <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-400 font-medium">
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-950 rounded-lg border border-zinc-800">
                                            <Dumbbell className="w-4 h-4 text-emerald-400/70" />
                                            Trainer: <span className="text-white">{membership.assignedTrainerName || 'None'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                                    <CalendarRange className="w-4 h-4 text-emerald-400/50" />
                                    Plan Name
                                </label>
                                <div className="text-lg font-semibold text-white bg-zinc-950/50 px-4 py-2.5 rounded-xl border border-zinc-800/50 shadow-inner">
                                    {membership.planName}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-emerald-400/50" />
                                    Start Date
                                </label>
                                <div className="text-lg font-semibold text-white bg-zinc-950/50 px-4 py-2.5 rounded-xl border border-zinc-800/50 shadow-inner">
                                    {formatDate(membership.startDate)}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                                    <CreditCard className="w-4 h-4 text-emerald-400/50" />
                                    Plan Price
                                </label>
                                <div className="text-lg font-semibold text-white bg-zinc-950/50 px-4 py-2.5 rounded-xl border border-zinc-800/50 shadow-inner">
                                    ₹{planAmount}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-emerald-400/50" />
                                    Expiry Date
                                </label>
                                <div className={`text-lg font-semibold px-4 py-2.5 rounded-xl border shadow-inner ${membership.status === 'EXPIRED'
                                    ? 'bg-red-400/5 border-red-400/20 text-red-400'
                                    : 'bg-zinc-950/50 border-zinc-800/50 text-white'
                                    } `}>
                                    {formatDate(membership.expiryDate)}
                                </div>
                            </div>

                            {membership.planType === 'DAY_BASED' && (
                                <div className="space-y-1.5 sm:col-span-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-emerald-400/50" />
                                        Number of Days Left
                                    </label>
                                    <div className="text-lg font-semibold text-white bg-emerald-400/10 px-4 py-2.5 rounded-xl border border-emerald-400/20 shadow-inner inline-flex">
                                        {membership.daysLeft !== null ? membership.daysLeft : 'N/A'} Days
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ---------- PAYMENT SECTION SUMMARY CARD ---------- */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl sticky top-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-emerald-400" />
                                Payment Status
                            </h3>
                            <PaymentStatusBadge status={paymentStatus} />
                        </div>

                        <div className="space-y-5">
                            <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 divide-y divide-zinc-800">
                                <div className="flex justify-between items-center pb-3">
                                    <span className="text-zinc-400 text-sm font-medium">Plan Amount</span>
                                    <span className="text-white font-bold">₹{planAmount}</span>
                                </div>
                                <div className="flex justify-between items-center py-3">
                                    <span className="text-zinc-400 text-sm font-medium">Total Paid</span>
                                    <span className="text-emerald-400 font-bold">₹{totalPaid}</span>
                                </div>
                                <div className="flex justify-between items-center pt-3">
                                    <span className="text-zinc-400 text-sm font-medium">Balance Due</span>
                                    <span className="text-amber-400 font-bold text-lg">
                                        ₹{Math.max(0, planAmount - totalPaid)}
                                    </span>
                                </div>
                            </div>

                            {(paymentStatus === 'PARTIAL' || paymentStatus === 'UNPAID') && (
                                <button
                                    onClick={() => {
                                        setSelectedPayment(null);
                                        setIsAddPaymentModalOpen(true);
                                    }}
                                    className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-3.5 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(52,211,153,0.3)] hover:shadow-[0_0_20px_rgba(52,211,153,0.5)]"
                                >
                                    <Plus className="w-5 h-5" />
                                    Add Payment
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* ---------- PAYMENT HISTORY LIST ---------- */}
                <div className="lg:col-span-3">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden mt-2">
                        <div className="p-6 border-b border-zinc-800 bg-zinc-900/80 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Clock className="w-5 h-5 text-emerald-400" />
                                Payment History
                            </h3>
                            <div className="text-sm font-medium text-zinc-400 bg-zinc-800 px-3 py-1 rounded-full">
                                {payments.length} Records
                            </div>
                        </div>

                        {payments.length === 0 ? (
                            <div className="p-12 text-center flex flex-col items-center">
                                <CreditCard className="w-12 h-12 text-zinc-700 mb-4" />
                                <p className="text-zinc-400 font-medium">No payments recorded yet.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-zinc-800 bg-zinc-950/50">
                                            <th className="p-5 text-sm font-semibold text-zinc-400 uppercase tracking-wider">Payment Date</th>
                                            <th className="p-5 text-sm font-semibold text-zinc-400 uppercase tracking-wider">Amount</th>
                                            <th className="p-5 text-sm font-semibold text-zinc-400 uppercase tracking-wider">Note</th>
                                            <th className="p-5 text-sm font-semibold text-zinc-400 uppercase tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-800/50">
                                        {payments.map((p: Payment) => (
                                            <tr key={p.id} className="hover:bg-zinc-800/30 transition-colors">
                                                <td className="p-5">
                                                    <div className="text-zinc-300 font-medium">{formatDate(p.paymentDate)}</div>
                                                </td>
                                                <td className="p-5">
                                                    <div className="font-bold text-emerald-400">₹{p.amount}</div>
                                                </td>
                                                <td className="p-5 max-w-[300px]">
                                                    <div className="text-zinc-400 text-sm truncate" title={p.note || ''}>
                                                        {p.note || <span className="italic opacity-50">No note</span>}
                                                    </div>
                                                </td>
                                                <td className="p-5 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => handleEditPayment(p)}
                                                            className="p-2 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors"
                                                            title="Edit Payment"
                                                        >
                                                            <Edit3 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeletePayment(p.id)}
                                                            className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                                            title="Delete Payment"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            {isAddPaymentModalOpen && (
                <AddPaymentModal
                    isOpen={isAddPaymentModalOpen}
                    membershipId={membership.id}
                    payment={selectedPayment || undefined}
                    onClose={() => setIsAddPaymentModalOpen(false)}
                    onSuccess={() => {
                        setIsAddPaymentModalOpen(false);
                        fetchMembershipData();
                    }}
                />
            )}
        </div>
    );
};

export default MembershipViewPage;
