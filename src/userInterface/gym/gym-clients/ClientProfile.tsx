import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Mail, Phone, Calendar, User, PhoneCall, Tag, Award, ArrowLeft, Edit3, Save, X, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getClientById, updateClient } from "../../../api/gym-clients.api";
import type { ClientDTO } from "../../../api/gym-clients.api";

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

    useEffect(() => {
        loadClient();
    }, [id]);

    const loadClient = async () => {
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
    };

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleBack = () => {
        navigate('/gym/clients');
    };

    // Get membership status color
    const getStatusColor = (status: string | undefined) => {
        switch (status) {
            case 'Active': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
            case 'Pending': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
            case 'Expired': return 'text-red-400 bg-red-400/10 border-red-400/20';
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
            <div className="mb-6 flex items-center gap-4">
                <button
                    onClick={handleBack}
                    className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">Client Profile</h1>
                    <p className="text-zinc-400 mt-1 text-sm sm:text-base">
                        {isEditing ? 'Edit client information' : 'View client information'}
                    </p>
                </div>
            </div>

            {/* Main Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
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
                                    className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-emerald-400 text-black font-semibold rounded-lg text-xs sm:text-sm hover:bg-emerald-500 transition-colors"
                                >
                                    <Edit3 className="w-3 h-3 sm:w-4 sm:h-4" />
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
                                    <input
                                        type="date"
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
                    </div>
                </div>
            </div>

            {/* Membership Status Card */}
            <div className="mt-6 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Membership Details</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-zinc-500">Status</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(client.membershipStatus)}`}>
                                {client.membershipStatus}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-300">
                            <Award className="w-4 h-4 text-emerald-400" />
                            <span className="text-sm">{client.currentPlan || 'No plan assigned'}</span>
                        </div>
                    </div>

                    <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-zinc-500">Joined Date</span>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-300">
                            <Calendar className="w-4 h-4 text-emerald-400" />
                            <span className="text-sm">{formatDate(client.joinedDate)}</span>
                        </div>
                    </div>
                </div>
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
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-400 text-black font-semibold rounded-lg text-sm hover:bg-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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