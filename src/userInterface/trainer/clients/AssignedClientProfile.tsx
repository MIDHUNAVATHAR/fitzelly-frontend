import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Mail, Phone, Calendar, Tag, Award, ArrowLeft, Loader2, Activity } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { ClientDTO } from '../../../api/gym-clients.api';
import { getAssignedClientById } from "../../../api/trainer-clients.api";


const AssignedClientProfile: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [client, setClient] = useState<null | ClientDTO>(null);

    useEffect(() => {
        loadClient();
    }, [id]);

    const loadClient = async () => {
        if (!id) return;
        try {
            setLoading(true);
            const data = await getAssignedClientById(id);
            setClient(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load client details");
            navigate('/trainer/clients');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate('/trainer/clients');
    };

    const handleWorkoutPlan = () => {
        toast.success(`Workout plan feature coming soon! (Client ID: ${id})`);
    }

    const getStatusColor = (status: string | undefined) => {
        if (!status) return 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20';
        switch (status.toUpperCase()) {
            case 'ACTIVE': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
            case 'PENDING': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
            case 'EXPIRED': return 'text-red-400 bg-red-400/10 border-red-400/20';
            default: return 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20';
        }
    };

    // Format date for display
    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    if (!client) return null;

    return (
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header with back button */}
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleBack}
                        className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Client Profile</h1>
                        <p className="text-zinc-400 mt-1 text-sm sm:text-base">
                            View client information
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleWorkoutPlan}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white font-semibold rounded-lg text-sm hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
                >
                    <Activity className="w-4 h-4" />
                    <span className="hidden sm:inline">Workout Plan</span>
                </button>
            </div>

            {/* Main Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                {/* Header Gradient */}
                <div className="h-20 sm:h-32 bg-gradient-to-r from-blue-900/20 to-zinc-900 relative">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-400/10 via-transparent to-transparent"></div>
                </div>

                <div className="px-4 sm:px-6 pb-6 sm:pb-8 relative">
                    {/* Profile Avatar */}
                    <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 to-emerald-500 border-4 border-zinc-900 absolute -top-10 sm:-top-14 flex items-center justify-center overflow-hidden shadow-xl">
                        {client.profileUrl ? (
                            <img
                                src={client.profileUrl}
                                alt={client.fullName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23222'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='40' fill='%23333'%3E${client.fullName?.charAt(0).toUpperCase() || 'C'}%3C/text%3E%3C/svg%3E`;
                                }}
                            />
                        ) : (
                            <span className="text-3xl sm:text-4xl font-bold text-white/80">
                                {client.fullName?.charAt(0).toUpperCase() || 'C'}
                            </span>
                        )}
                    </div>

                    <div className="ml-24 sm:ml-32 pt-0 sm:pt-2">
                        <div className="pt-2 sm:pt-4">
                            <h2 className="text-xl sm:text-2xl font-bold text-white">{client.fullName}</h2>
                            <p className="text-zinc-400 text-sm sm:text-base mt-1">
                                Member since {formatDate(client.joinedDate)}
                            </p>
                        </div>
                    </div>

                    {/* Client Details Grid */}
                    <div className="mt-8 sm:mt-10 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
                        {/* Email */}
                        <div className="group">
                            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">Email Address</label>
                            <div className="flex items-center gap-3 text-zinc-300 p-3 bg-zinc-950/50 rounded-lg border border-zinc-800/50 text-sm sm:text-base">
                                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 flex-shrink-0" />
                                <span className="truncate">{client.email}</span>
                            </div>
                        </div>

                        {/* Phone Number */}
                        <div className="group">
                            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">Phone Number</label>
                            <div className="flex items-center gap-3 text-zinc-300 p-3 bg-zinc-950/50 rounded-lg border border-zinc-800/50 text-sm sm:text-base">
                                <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 flex-shrink-0" />
                                <span className="truncate">{client.phoneNumber || 'Not set'}</span>
                            </div>
                        </div>

                        {/* Date of Birth */}
                        <div className="group">
                            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">Date of Birth</label>
                            <div className="flex items-center gap-3 text-zinc-300 p-3 bg-zinc-950/50 rounded-lg border border-zinc-800/50 text-sm sm:text-base">
                                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 flex-shrink-0" />
                                <span className="truncate">{formatDate(client.dateOfBirth)}</span>
                            </div>
                        </div>

                        {/* Current Plan */}
                        <div className="group">
                            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">Current Plan</label>
                            <div className="flex items-center gap-3 text-zinc-300 p-3 bg-zinc-950/50 rounded-lg border border-zinc-800/50 text-sm sm:text-base">
                                <Tag className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 flex-shrink-0" />
                                <span className="truncate">{client.currentPlan || 'No active plan'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Membership Status Card */}
            <div className="mt-6 bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-6 mb-6">
                <h3 className="text-lg font-bold text-white mb-4">Membership Details</h3>

                {!client.currentPlan || client.membershipStatus === 'None' ? (
                    <div className="flex flex-col items-center justify-center py-12 bg-zinc-950/50 border border-zinc-800/50 rounded-xl text-center px-4">
                        <Award className="w-12 h-12 text-zinc-600 mb-3" />
                        <h4 className="text-base font-medium text-white mb-1">No Active Membership</h4>
                        <p className="text-sm text-zinc-500 max-w-sm">This client hasn't been assigned a membership plan yet.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                            {/* Plan Name & Status */}
                            <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-zinc-500">Plan & Status</span>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border uppercase tracking-wider ${getStatusColor(client.membershipStatus)}`}>
                                        {client.membershipStatus}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-zinc-300">
                                    <Award className="w-4 h-4 text-emerald-400" />
                                    <span className="text-sm font-medium truncate">{client.currentPlan}</span>
                                </div>
                                {client.planType && (
                                    <div className="mt-1 pl-6 text-xs text-zinc-500">
                                        Type: {client.planType.replace('_', ' ')}
                                    </div>
                                )}
                            </div>

                            {/* Dates */}
                            <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-zinc-500">Duration</span>
                                    {client.planType === 'DAY_BASED' && client.daysLeft !== undefined && client.daysLeft !== null && (
                                        <span className="text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">{client.daysLeft} days left</span>
                                    )}
                                </div>
                                <div className="flex flex-col gap-1 text-zinc-300 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                        <span className="truncate">Start: {formatDate(client.startDate)}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-zinc-400 pl-6">
                                        <span className="truncate">End: {formatDate(client.expiryDate)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AssignedClientProfile;
