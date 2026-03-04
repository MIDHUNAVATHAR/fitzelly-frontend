import React, { useState, useEffect, useRef } from 'react';
import { Mail, Phone, Calendar, Users, PhoneCall, Edit3, Camera, Save, CalendarDays, Activity, Award, User, CreditCard, IndianRupee } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getClientProfile, updateClientProfile, uploadClientProfileImage, type ClientProfile, type ClientMembership } from "../../../api/client-profile.api";
import { useImageCropper } from '../../../hooks/useImageCropper';
import ImageCropperModal from '../../../components/ui/ImageCropperModal';
import DateInput from '../../../components/ui/DateInput';
import { useDateFormat } from '../../../hooks/useDateFormat';

const ClientProfilePage: React.FC = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [loadingMembership, setLoadingMembership] = useState(true);

    const [profile, setProfile] = useState<ClientProfile | null>(null);
    const [membership, setMembership] = useState<ClientMembership | null>(null);
    const { formatToGB } = useDateFormat();

    // Get membership status color
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
    const [formData, setFormData] = useState<ClientProfile>({});
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Handle cropped image
    const handleCroppedImage = async (croppedImageBlob: Blob) => {
        try {
            const fileName = `profile-${Date.now()}.jpg`;
            const file = new File([croppedImageBlob], fileName, { type: "image/jpeg" });

            const toastId = toast.loading("Uploading image...");
            const { profileImage } = await uploadClientProfileImage(file);

            setProfile(prev => prev ? ({ ...prev, profileImage }) : null);
            setFormData(prev => ({ ...prev, profileImage }));
            toast.dismiss(toastId);
            toast.success("Profile picture updated!");
        } catch (error) {
            console.error('Error uploading cropped image:', error);
            toast.error("Failed to upload image");
        }
    };

    // Use the image cropper hook
    const {
        imageSrc,
        crop,
        zoom,
        isCropping,
        isUploadingImage,
        setCrop,
        setZoom,
        handleFileSelect,
        handleUploadCroppedImage,
        onCropComplete,
        cancelCropping
    } = useImageCropper({
        onCropComplete: handleCroppedImage,
        aspectRatio: 1 // Square for profile picture
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await getClientProfile().catch((e) => {
                console.error("Failed to fetch profile", e);
                toast.error("Failed to load profile");
                return null;
            });

            if (data) {
                setProfile(data.profile);
                setFormData(data.profile);
                setMembership(data.membership);
            }
        } finally {
            setLoadingProfile(false);
            setLoadingMembership(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!isEditing) return; // Only allow upload in edit mode

        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];

            if (!file.type.startsWith('image/')) {
                toast.error("Please select an image file");
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                toast.error("Image size should be less than 5MB");
                return;
            }

            await handleFileSelect(file);
            e.target.value = '';
        }
    };

    const handleSave = async () => {
        const { fullName, phoneNumber, emergencyContact, contactPerson, dateOfBirth } = formData;

        if (!fullName?.trim() || !phoneNumber?.trim() || !emergencyContact?.trim() || !contactPerson?.trim() || !dateOfBirth?.trim()) {
            toast.error("All editable fields are mandatory");
            return;
        }

        setIsSaving(true);
        try {
            const updatedProfile = await updateClientProfile({
                fullName,
                phoneNumber,
                emergencyContact,
                contactPerson,
                dateOfBirth
            });
            setProfile({ ...updatedProfile });
            setIsEditing(false);
            toast.success("Profile updated successfully");
        } catch {
            toast.error("Failed to update the profile");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData(profile || {});
        setIsEditing(false);
    };

    if (loadingProfile) {
        return (
            <div className="flex items-center justify-center w-full h-[60vh]">
                <div className="w-8 h-8 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Client Profile</h1>
                <p className="text-zinc-400 mt-1 text-sm sm:text-base">Manage your personal information and view membership status.</p>
            </div>

            <div className="grid grid-cols-1 gap-6 pb-10">
                <div className="space-y-6">
                    {/* Main Settings Card */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                        {/* Banner */}
                        <div className="h-20 sm:h-32 bg-gradient-to-r from-emerald-900/30 to-zinc-900 relative">
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-400/10 via-transparent to-transparent"></div>
                        </div>

                        <div className="px-4 sm:px-8 pb-6 sm:pb-8 relative">
                            {/* Profile Image Component */}
                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handleFileChange}
                            />
                            <div
                                onClick={() => isEditing && fileInputRef.current?.click()}
                                className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-zinc-800 border-4 border-zinc-900 absolute -top-12 sm:-top-16 flex items-center justify-center group overflow-hidden shadow-xl ${isEditing ? 'cursor-pointer' : ''}`}
                            >
                                {profile?.profileImage || formData.profileImage ? (
                                    <img
                                        src={profile?.profileImage || formData.profileImage}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.fullName || 'User')}&background=0D8B93&color=fff`;
                                        }}
                                    />
                                ) : (
                                    <span className="text-3xl font-bold text-zinc-600 group-hover:hidden">👤</span>
                                )}
                                {isEditing && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                                    </div>
                                )}
                            </div>

                            <div className="ml-28 sm:ml-40 pt-2 sm:pt-4">
                                {!isEditing && (
                                    <div className="flex justify-end mb-4">
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="flex items-center gap-2 px-4 py-2 bg-emerald-400 text-black font-semibold rounded-lg text-sm hover:bg-emerald-500 transition-colors"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                            <span className="hidden sm:inline">Edit Profile</span>
                                            <span className="inline sm:hidden">Edit</span>
                                        </button>
                                    </div>
                                )}

                                {isEditing ? (
                                    <div className="space-y-4 max-w-lg mb-4">
                                        <div>
                                            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5 block">Full Name</label>
                                            <input
                                                type="text"
                                                value={formData.fullName || ''}
                                                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-400 transition-colors"
                                                placeholder="Enter full name"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mb-4">
                                        <h2 className="text-xl sm:text-2xl font-bold text-white">{profile?.fullName || formData.fullName || "User Name"}</h2>
                                    </div>
                                )}
                            </div>

                            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Readonly: Email */}
                                <div className="group">
                                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">Email Address</label>
                                    <div className="flex items-center gap-3 text-zinc-300 p-3 bg-zinc-950/70 rounded-lg border border-zinc-800/80">
                                        <Mail className="w-5 h-5 text-emerald-400 opacity-80 flex-shrink-0" />
                                        <span className="opacity-70 cursor-not-allowed truncate" title="Email cannot be changed">{profile?.email || formData.email || "email@example.com"}</span>
                                        <span className="ml-auto text-[10px] bg-zinc-800 px-2 py-0.5 rounded text-zinc-500 uppercase tracking-wider font-semibold shadow-inner border border-zinc-700/50">Read Only</span>
                                    </div>
                                </div>

                                {/* Readonly: Joined Date */}
                                <div className="group">
                                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">Joined Date</label>
                                    <div className="flex items-center gap-3 text-zinc-300 p-3 bg-zinc-950/70 rounded-lg border border-zinc-800/80">
                                        <CalendarDays className="w-5 h-5 text-emerald-400 opacity-80 flex-shrink-0" />
                                        <span className="truncate opacity-70">
                                            {profile?.joinedDate ? new Date(profile.joinedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : "Not available"}
                                        </span>
                                        <span className="ml-auto text-[10px] bg-zinc-800 px-2 py-0.5 rounded text-zinc-500 uppercase tracking-wider font-semibold shadow-inner border border-zinc-700/50">Read Only</span>
                                    </div>
                                </div>

                                {/* Editable: Phone Number */}
                                <div className="group">
                                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block flex justify-between">
                                        Phone Number {isEditing && <span className="text-[10px] text-emerald-400 lowercase normal-case tracking-normal font-normal">*Required</span>}
                                    </label>
                                    {isEditing ? (
                                        <div className="relative">
                                            <Phone className="w-5 h-5 text-emerald-400 absolute left-3 top-2.5 z-10" />
                                            <input
                                                type="text"
                                                value={formData.phoneNumber || ''}
                                                onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                                                className="w-full pl-10 bg-zinc-950 border border-emerald-500/50 outline-none ring-2 ring-emerald-500/20 rounded-lg px-3 py-2 text-white transition-all shadow-input"
                                                placeholder="+1 (555) 000-0000"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3 text-zinc-300 p-3 bg-zinc-950/40 rounded-lg border border-zinc-800/50 hover:bg-zinc-900 hover:border-zinc-700 transition-colors cursor-default">
                                            <Phone className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                            <span className="truncate">{profile?.phoneNumber || formData.phoneNumber || "Not set"}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Editable: Date of Birth */}
                                <div className="group">
                                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block flex justify-between">
                                        Date of Birth {isEditing && <span className="text-[10px] text-emerald-400 lowercase normal-case tracking-normal font-normal">*Required</span>}
                                    </label>
                                    {isEditing ? (
                                        <div className="relative">
                                            <Calendar className="w-5 h-5 text-emerald-400 absolute left-3 top-2.5 z-10" />
                                            <DateInput
                                                value={formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString().split('T')[0] : ''}
                                                onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                                className="w-full pl-10 bg-zinc-950 border border-emerald-500/50 outline-none ring-2 ring-emerald-500/20 rounded-lg px-3 py-2 text-white transition-all shadow-input"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3 text-zinc-300 p-3 bg-zinc-950/40 rounded-lg border border-zinc-800/50 hover:bg-zinc-900 hover:border-zinc-700 transition-colors cursor-default">
                                            <Calendar className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                            <span className="truncate">
                                                {profile?.dateOfBirth ? formatToGB(profile.dateOfBirth) : "Not set"}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Editable: Contact Person */}
                                <div className="group">
                                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block flex justify-between">
                                        Contact Person (Emergency) {isEditing && <span className="text-[10px] text-emerald-400 lowercase normal-case tracking-normal font-normal">*Required</span>}
                                    </label>
                                    {isEditing ? (
                                        <div className="relative">
                                            <Users className="w-5 h-5 text-emerald-400 absolute left-3 top-2.5 z-10" />
                                            <input
                                                type="text"
                                                value={formData.contactPerson || ''}
                                                onChange={e => setFormData({ ...formData, contactPerson: e.target.value })}
                                                className="w-full pl-10 bg-zinc-950 border border-emerald-500/50 outline-none ring-2 ring-emerald-500/20 rounded-lg px-3 py-2 text-white transition-all shadow-input"
                                                placeholder="E.g. Jane Doe (Wife)"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3 text-zinc-300 p-3 bg-zinc-950/40 rounded-lg border border-zinc-800/50 hover:bg-zinc-900 hover:border-zinc-700 transition-colors cursor-default">
                                            <Users className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                            <span className="truncate">{profile?.contactPerson || formData.contactPerson || "Not set"}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Editable: Emergency Contact Number */}
                                <div className="group">
                                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block flex justify-between">
                                        Emergency Contact Number {isEditing && <span className="text-[10px] text-emerald-400 lowercase normal-case tracking-normal font-normal">*Required</span>}
                                    </label>
                                    {isEditing ? (
                                        <div className="relative">
                                            <PhoneCall className="w-5 h-5 text-emerald-400 absolute left-3 top-2.5 z-10" />
                                            <input
                                                type="text"
                                                value={formData.emergencyContact || ''}
                                                onChange={e => setFormData({ ...formData, emergencyContact: e.target.value })}
                                                className="w-full pl-10 bg-zinc-950 border border-emerald-500/50 outline-none ring-2 ring-emerald-500/20 rounded-lg px-3 py-2 text-white transition-all shadow-input"
                                                placeholder="+1 (555) 999-9999"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3 text-zinc-300 p-3 bg-zinc-950/40 rounded-lg border border-zinc-800/50 hover:bg-zinc-900 hover:border-zinc-700 transition-colors cursor-default">
                                            <PhoneCall className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                            <span className="truncate">{profile?.emergencyContact || formData.emergencyContact || "Not set"}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            {isEditing && (
                                <div className="mt-8 flex gap-3 justify-end pt-4 border-t border-zinc-800/60 w-full">
                                    <button
                                        onClick={handleCancel}
                                        disabled={isSaving}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-zinc-800 text-white font-medium rounded-lg text-sm hover:bg-zinc-700 transition-colors disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-emerald-400 text-black font-semibold rounded-lg text-sm shadow-[0_0_15px_rgba(52,211,153,0.3)] hover:shadow-[0_0_20px_rgba(52,211,153,0.5)] transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                                    >
                                        {isSaving ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                                        Save Changes
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Membership Information Component */}
                    <div className="mt-8 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/10 via-zinc-900/50 to-zinc-900 -z-10 group-hover:from-emerald-900/20 transition-all duration-500"></div>
                        <div className="p-6 sm:p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-emerald-400/20 flex items-center justify-center border border-emerald-400/30">
                                    <Activity className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white tracking-wide">Current Membership</h2>
                                    <p className="text-sm text-zinc-400">View your active gym plan and usage</p>
                                </div>
                            </div>

                            {loadingMembership ? (
                                <div className="flex items-center justify-center py-10">
                                    <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : membership ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {/* Plan Name & Status */}
                                        <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-zinc-500">Plan & Status</span>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border uppercase tracking-wider ${getStatusColor(membership.status)}`}>
                                                    {membership.status}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-zinc-300">
                                                <Award className="w-4 h-4 text-emerald-400" />
                                                <span className="text-sm font-medium truncate">{membership.currentPlan}</span>
                                            </div>
                                            {membership.planType && (
                                                <div className="mt-1 pl-6 text-xs text-zinc-500">
                                                    Type: {membership.planType.replace('_', ' ')}
                                                </div>
                                            )}
                                        </div>

                                        {/* Dates */}
                                        <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-zinc-500">Duration</span>
                                                {membership.planType === 'DAY_BASED' && membership.daysLeft !== undefined && membership.daysLeft !== null && (
                                                    <span className="text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">{membership.daysLeft} days left</span>
                                                )}
                                            </div>
                                            <div className="flex flex-col gap-1 text-zinc-300 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                                    <span className="truncate">Start: {membership.startDate ? new Date(membership.startDate).toLocaleDateString() : 'N/A'}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-zinc-400 pl-6">
                                                    <span className="truncate">End: {membership.expiryDate ? new Date(membership.expiryDate).toLocaleDateString() : 'N/A'}</span>
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
                                                    {membership.assignedTrainer || 'No Trainer Assigned'}
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
                                            {membership.paymentStatus && (
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getPaymentStatusColor(membership.paymentStatus)}`}>
                                                    {membership.paymentStatus}
                                                </span>
                                            )}
                                        </div>

                                        <div className="p-2 sm:p-4">
                                            {membership.payments && membership.payments.length > 0 ? (
                                                <div className="flex flex-col gap-2">
                                                    {membership.payments.map((payment, i) => (
                                                        <div key={i} className="flex justify-between items-center p-3 sm:p-4 rounded-lg bg-zinc-900 border border-zinc-800">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                                                                    <Calendar className="w-4 h-4 text-zinc-400" />
                                                                </div>
                                                                <span className="text-sm text-zinc-300 font-medium">
                                                                    {new Date(payment.date).toLocaleDateString()}
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
                            ) : (
                                <div className="text-center py-12 bg-zinc-950 rounded-xl border border-zinc-800 border-dashed">
                                    <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-4">
                                        <CalendarDays className="w-6 h-6 text-zinc-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-white mb-2">No Active Membership</h3>
                                    <p className="text-zinc-500 max-w-sm mx-auto text-sm">You don't have an active membership plan assigned to your profile yet.</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>

            {/* Image Cropper Modal */}
            {isCropping && imageSrc && (
                <ImageCropperModal
                    imageSrc={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    isUploading={isUploadingImage}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                    onUpload={handleUploadCroppedImage}
                    onCancel={cancelCropping}
                    title="Adjust Profile Picture"
                    aspectRatio={1}
                />
            )}

        </div>
    );
};

export default ClientProfilePage;
