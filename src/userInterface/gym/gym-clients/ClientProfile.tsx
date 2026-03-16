import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Mail, Phone, Calendar, User, PhoneCall, Tag, Award, ArrowLeft, Edit3, Save, X, Loader2, IndianRupee, CreditCard, Ruler, Scale, IdCard } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getClientById, updateClient } from "../../../api/gym-clients.api";
import type { ClientDTO } from "../../../api/gym-clients.api";
import { useDateFormat } from "../../../hooks/useDateFormat";
import DateInput from "../../../components/ui/DateInput";

const ClientProfile: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    // Check if we should start in edit mode (from state or URL)
    const shouldStartEditing = location.state?.enableEditing || false;

    const [isEditing, setIsEditing] = useState(shouldStartEditing);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [client, setClient] = useState<ClientDTO | null>(null);
    const [formData, setFormData] = useState<Partial<ClientDTO>>({});
    const { formatToShortMonth: formatDate } = useDateFormat();

    const loadClient = useCallback(async () => {
        if (!id) return;
        try {
            setLoading(true);
            const data = await getClientById(id);
            setClient(data);
            setFormData(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load client details");
            navigate('/gym/clients');
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        loadClient();
    }, [loadClient]);

    const handleSave = async () => {
        const { fullName, email, phoneNumber } = formData;

        if (!fullName?.trim() || !phoneNumber?.trim() || (!client?.isEmailVerified && !email?.trim())) {
            toast.error("Required fields are missing");
            return;
        }

        if (!client?.isEmailVerified && email) {
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                toast.error("Please enter a valid email address");
                return;
            }
        }

        setIsSaving(true);
        try {
            if (!id) return;
            const updatedClient = await updateClient(id, formData);
            setClient({ ...client, ...updatedClient } as ClientDTO);
            setIsEditing(false);
            toast.success("Client profile updated successfully");

            // Clear the edit mode state when navigating back
            navigate(`/gym/clients/${id}`, { replace: true, state: {} });
        } catch (error) {
            console.error(error);
            toast.error("Failed to update client profile");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData(client || {});
        setIsEditing(false);
        // Clear the edit mode state when navigating back
        navigate(`/gym/clients/${id}`, { replace: true, state: {} });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? (value ? Number(value) : undefined) : value
        }));
    };

    const handleBack = () => {
        navigate('/gym/clients');
    };

    const getStatusColor = (status: string | undefined) => {
        if (!status) return 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20';
        switch (status.toUpperCase()) {
            case 'ACTIVE': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
            case 'PENDING': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
            case 'EXPIRED': return 'text-red-400 bg-red-400/10 border-red-400/20';
            default: return 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20';
        }
    };

    const getPaymentStatusColor = (status: string | undefined) => {
        switch (status) {
            case 'PAID': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
            case 'PARTIAL': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
            case 'UNPAID': return 'text-red-400 bg-red-400/10 border-red-400/20';
            default: return 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20';
        }
    };

    // Removed local formatDate since we use hook

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
            <div className="mb-6 flex items-center gap-4">
                <button
                    onClick={handleBack}
                    className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-white">Client Profile</h1>
                    <p className="text-zinc-400 mt-1 text-sm sm:text-base">
                        {isEditing ? 'Edit client information' : 'View client information'}
                    </p>
                </div>
            </div>

            {/* Main Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                {/* Header Gradient */}
                <div className="h-20 sm:h-32 bg-gradient-to-r from-blue-900/20 to-zinc-900 relative">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-400/10 via-transparent to-transparent"></div>
                </div>

                <div className="px-4 sm:px-6 pb-6 sm:pb-8 relative">
                    {/* Profile Avatar - Non-editable */}
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

                    {/* Edit Button (only in view mode) */}
                    <div className="ml-24 sm:ml-32 pt-0 sm:pt-2">
                        {!isEditing && (
                            <div className="flex justify-end mb-3 sm:mb-4">
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white font-semibold rounded-lg text-sm hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
                                >
                                    <Edit3 className="w-4 h-4" />
                                    Edit Profile
                                </button>
                            </div>
                        )}

                        {/* Name Section */}
                        {isEditing ? (
                            <div className="space-y-4 max-w-lg">
                                <div>
                                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5 block">Full Name</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName || ''}
                                        onChange={handleChange}
                                        className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-400 transition-colors text-sm sm:text-base"
                                        placeholder="Enter full name"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold text-white">{client.fullName}</h2>
                                <p className="text-zinc-400 text-sm sm:text-base mt-1">
                                    Member since {formatDate(client.joinedDate)}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Client Details Grid */}
                    <div className="mt-8 sm:mt-10 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
                        {/* Email - Conditional */}
                        <div className="group">
                            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">Email Address</label>
                            {isEditing && !client.isEmailVerified ? (
                                <div className="relative">
                                    <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 absolute left-3 top-2.5 z-10" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email || ''}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-20 bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-400 transition-colors text-sm sm:text-base"
                                        placeholder="Enter email address"
                                    />
                                    <span className="absolute right-3 top-3 text-xs text-amber-500 font-medium">Unverified</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 text-zinc-300 p-3 bg-zinc-950/50 rounded-lg border border-zinc-800/50 text-sm sm:text-base">
                                    <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 flex-shrink-0" />
                                    <span className="truncate">{client.email}</span>
                                    {client.isEmailVerified ? (
                                        <span className="ml-auto text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded flex-shrink-0">Verified</span>
                                    ) : (
                                        <span className="ml-auto text-xs bg-zinc-800 px-2 py-0.5 rounded text-zinc-500 flex-shrink-0">Unverified</span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Phone Number - Editable */}
                        <div className="group">
                            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">Phone Number</label>
                            {isEditing ? (
                                <div className="relative">
                                    <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 absolute left-3 top-2.5 z-10" />
                                    <input
                                        type="text"
                                        name="phoneNumber"
                                        value={formData.phoneNumber || ''}
                                        onChange={handleChange}
                                        className="w-full pl-10 bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-400 transition-colors text-sm sm:text-base"
                                        placeholder="Enter phone number"
                                    />
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 text-zinc-300 p-3 bg-zinc-950/50 rounded-lg border border-zinc-800/50 text-sm sm:text-base">
                                    <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 flex-shrink-0" />
                                    <span className="truncate">{client.phoneNumber || 'Not set'}</span>
                                </div>
                            )}
                        </div>

                        {/* Date of Birth - Editable */}
                        <div className="group">
                            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">Date of Birth</label>
                            {isEditing ? (
                                <div className="relative">
                                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 absolute left-3 top-2.5 z-10" />
                                    <DateInput
                                        name="dateOfBirth"
                                        value={formData.dateOfBirth ? formData.dateOfBirth.split('T')[0] : ''}
                                        onChange={handleChange}
                                        className="w-full pl-10 bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-400 transition-colors text-sm sm:text-base"
                                    />
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 text-zinc-300 p-3 bg-zinc-950/50 rounded-lg border border-zinc-800/50 text-sm sm:text-base">
                                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 flex-shrink-0" />
                                    <span className="truncate">{formatDate(client.dateOfBirth)}</span>
                                </div>
                            )}
                        </div>

                        {/* Current Plan - Read Only */}
                        <div className="group">
                            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">Current Plan</label>
                            <div className="flex items-center gap-3 text-zinc-300 p-3 bg-zinc-950/50 rounded-lg border border-zinc-800/50 text-sm sm:text-base">
                                <Tag className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 flex-shrink-0" />
                                <span className="truncate">{client.currentPlan || 'No active plan'}</span>
                            </div>
                        </div>

                        {/* Emergency Contact - Editable */}
                        <div className="group">
                            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">Emergency Contact</label>
                            {isEditing ? (
                                <div className="relative">
                                    <PhoneCall className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 absolute left-3 top-2.5 z-10" />
                                    <input
                                        type="text"
                                        name="emergencyContact"
                                        value={formData.emergencyContact || ''}
                                        onChange={handleChange}
                                        className="w-full pl-10 bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-400 transition-colors text-sm sm:text-base"
                                        placeholder="Emergency contact number"
                                    />
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 text-zinc-300 p-3 bg-zinc-950/50 rounded-lg border border-zinc-800/50 text-sm sm:text-base">
                                    <PhoneCall className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 flex-shrink-0" />
                                    <span className="truncate">{client.emergencyContact || 'Not set'}</span>
                                </div>
                            )}
                        </div>

                        {/* Contact Person - Editable */}
                        <div className="group">
                            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">Contact Person</label>
                            {isEditing ? (
                                <div className="relative">
                                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 absolute left-3 top-2.5 z-10" />
                                    <input
                                        type="text"
                                        name="contactPerson"
                                        value={formData.contactPerson || ''}
                                        onChange={handleChange}
                                        className="w-full pl-10 bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-400 transition-colors text-sm sm:text-base"
                                        placeholder="Contact person name"
                                    />
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 text-zinc-300 p-3 bg-zinc-950/50 rounded-lg border border-zinc-800/50 text-sm sm:text-base">
                                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 flex-shrink-0" />
                                    <span className="truncate">{client.contactPerson || 'Not set'}</span>
                                </div>
                            )}
                        </div>

                        {/* Client ID - Editable */}
                        <div className="group">
                            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">Client ID</label>
                            {isEditing ? (
                                <div className="relative">
                                    <IdCard className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 absolute left-3 top-2.5 z-10" />
                                    <input
                                        type="text"
                                        name="clientId"
                                        value={formData.clientId || ''}
                                        onChange={handleChange}
                                        className="w-full pl-10 bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-400 transition-colors text-sm sm:text-base"
                                        placeholder="Enter client ID"
                                    />
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 text-zinc-300 p-3 bg-zinc-950/50 rounded-lg border border-zinc-800/50 text-sm sm:text-base">
                                    <IdCard className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 flex-shrink-0" />
                                    <span className="truncate">{client.clientId || 'Not set'}</span>
                                </div>
                            )}
                        </div>

                        {/* Gender - Editable */}
                        <div className="group">
                            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">Gender</label>
                            {isEditing ? (
                                <div className="relative">
                                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 absolute left-3 top-2.5 z-10" />
                                    <select
                                        name="gender"
                                        value={formData.gender || ''}
                                        onChange={handleChange}
                                        className="w-full pl-10 bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-400 transition-colors text-sm sm:text-base"
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="MALE">Male</option>
                                        <option value="FEMALE">Female</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 text-zinc-300 p-3 bg-zinc-950/50 rounded-lg border border-zinc-800/50 text-sm sm:text-base">
                                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 flex-shrink-0" />
                                    <span className="truncate capitalize">{client.gender?.toLowerCase() || 'Not set'}</span>
                                </div>
                            )}
                        </div>

                        {/* Height - Editable */}
                        <div className="group">
                            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">Height (cm)</label>
                            {isEditing ? (
                                <div className="relative">
                                    <Ruler className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 absolute left-3 top-2.5 z-10" />
                                    <input
                                        type="number"
                                        name="height"
                                        value={formData.height || ''}
                                        onChange={handleChange}
                                        className="w-full pl-10 bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-400 transition-colors text-sm sm:text-base"
                                        placeholder="Enter height"
                                    />
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 text-zinc-300 p-3 bg-zinc-950/50 rounded-lg border border-zinc-800/50 text-sm sm:text-base">
                                    <Ruler className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 flex-shrink-0" />
                                    <span className="truncate">{client.height ? `${client.height} cm` : 'Not set'}</span>
                                </div>
                            )}
                        </div>

                        {/* Weight - Editable */}
                        <div className="group">
                            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">Weight (kg)</label>
                            {isEditing ? (
                                <div className="relative">
                                    <Scale className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 absolute left-3 top-2.5 z-10" />
                                    <input
                                        type="number"
                                        name="weight"
                                        value={formData.weight || ''}
                                        onChange={handleChange}
                                        className="w-full pl-10 bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-400 transition-colors text-sm sm:text-base"
                                        placeholder="Enter weight"
                                    />
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 text-zinc-300 p-3 bg-zinc-950/50 rounded-lg border border-zinc-800/50 text-sm sm:text-base">
                                    <Scale className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 flex-shrink-0" />
                                    <span className="truncate">{client.weight ? `${client.weight} kg` : 'Not set'}</span>
                                </div>
                            )}
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

                            {/* Assigned Trainer */}
                            <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-zinc-500">Assigned Trainer</span>
                                </div>
                                <div className="flex items-center gap-2 text-zinc-300">
                                    <User className="w-4 h-4 text-emerald-400" />
                                    <span className="text-sm truncate">
                                        {client.assignedTrainer || 'No Trainer Assigned'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Payments Section */}
                        <div className="bg-zinc-950/50 rounded-xl border border-zinc-800/50 overflow-hidden">
                            <div className="p-4 border-b border-zinc-800/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                <div className="flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-zinc-400" />
                                    <h4 className="text-sm font-semibold text-white">Payment Information</h4>
                                </div>
                                {client.paymentStatus && (
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getPaymentStatusColor(client.paymentStatus)}`}>
                                        {client.paymentStatus}
                                    </span>
                                )}
                            </div>

                            <div className="p-2 sm:p-4">
                                {client.payments && client.payments.length > 0 ? (
                                    <div className="flex flex-col gap-2">
                                        {client.payments.map((payment, i) => (
                                            <div key={i} className="flex justify-between items-center p-3 sm:p-4 rounded-lg bg-zinc-900 border border-zinc-800">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                                                        <Calendar className="w-4 h-4 text-zinc-400" />
                                                    </div>
                                                    <span className="text-sm text-zinc-300 font-medium">
                                                        {formatDate(payment.date)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1 font-semibold text-emerald-400 text-sm sm:text-base">
                                                    <IndianRupee className="w-4 h-4" />
                                                    {payment.amount}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-sm text-zinc-500">
                                        No payment records found
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Edit/Save Buttons (when editing) */}
            {isEditing && (
                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={handleCancel}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-800 text-white font-semibold rounded-lg text-sm hover:bg-zinc-700 transition-colors disabled:opacity-50"
                    >
                        <X className="w-4 h-4" />
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white font-semibold rounded-lg text-sm hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Changes
                    </button>
                </div>
            )}
        </div>
    );
};

export default ClientProfile;