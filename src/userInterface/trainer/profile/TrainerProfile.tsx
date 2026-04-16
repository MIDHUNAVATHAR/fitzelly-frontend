import React, { useState, useEffect, useRef } from 'react';
import { Mail, Phone, Calendar, Save, Camera, Edit3, DollarSign, CalendarDays, Briefcase, MapPin, GraduationCap, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getTrainerProfile, updateTrainerProfile, uploadTrainerProfileImage, type TrainerProfile } from "../../../api/trainer-profile.api";
import { useImageCropper } from '../../../hooks/useImageCropper';
import ImageCropperModal from '../../../components/ui/ImageCropperModal';
import DateInput from '../../../components/ui/DateInput';
import { useDateFormat } from '../../../hooks/useDateFormat';

const TrainerProfilePage: React.FC = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);

    const [profile, setProfile] = useState<TrainerProfile | null>(null);
    const [formData, setFormData] = useState<TrainerProfile>({});
    const { formatToGB } = useDateFormat();
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    // Handle cropped image
    const handleCroppedImage = async (croppedImageBlob: Blob) => {
        try {
            const fileName = `profile-${Date.now()}.jpg`;
            const file = new File([croppedImageBlob], fileName, { type: "image/jpeg" });

            const toastId = toast.loading("Uploading image...");
            const { profileUrl } = await uploadTrainerProfileImage(file);

            setProfile(prev => prev ? ({ ...prev, profileUrl }) : null);
            setFormData(prev => ({ ...prev, profileUrl }));
            toast.dismiss(toastId);
            toast.success("Profile picture updated!");
        } catch (error) {
            console.error('Error uploading cropped image:', error);
            toast.error("Failed to upload image");
        }
    };

    // Image Cropper Hook
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
        aspectRatio: 1
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await getTrainerProfile();
            setProfile(data);
            setFormData(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load profile");
        } finally {
            setLoading(false);
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
        const { fullName, phoneNumber, specialization, dateOfBirth, qualification, address } = formData;

        if (!fullName?.trim() || !phoneNumber?.trim() || !specialization?.trim() || !dateOfBirth?.trim() || !qualification?.trim() || !address?.trim()) {
            toast.error("All editable fields are mandatory");
            return;
        }

        const dob = new Date(dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
            age--;
        }

        if (age < 10 || age > 100) {
            toast.error("Age must be between 10 and 100 years");
            return;
        }

        setIsSaving(true);
        try {
            const updatedProfile = await updateTrainerProfile({
                fullName,
                phoneNumber,
                specialization,
                dateOfBirth,
                qualification,
                address
            });
            setProfile({ ...updatedProfile });
            setFormData({ ...updatedProfile });
            setIsEditing(false);
            toast.success("Profile updated successfully");
        } catch {
            toast.error("Failed to update profile");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData(profile || {});
        setIsEditing(false);
    };

    if (loading) {
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
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Trainer Profile</h1>
                <p className="text-zinc-400 mt-1 text-sm sm:text-base">Manage your professional information.</p>
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
                                {formData.profileUrl ? (
                                    <img
                                        src={formData.profileUrl}
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
                                        <h2 className="text-xl sm:text-2xl font-bold text-white">{profile?.fullName || formData.fullName || "Trainer Name"}</h2>
                                    </div>
                                )}
                            </div>

                            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Readonly: Email */}
                                <div className="group">
                                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">Email Address</label>
                                    <div className="flex items-center gap-3 text-zinc-300 p-3 bg-zinc-950/70 rounded-lg border border-zinc-800/80">
                                        <Mail className="w-5 h-5 text-emerald-400 opacity-80 flex-shrink-0" />
                                        <span className="opacity-70 cursor-not-allowed truncate" title="Email cannot be changed">{profile?.email || "email@example.com"}</span>
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

                                {/* Readonly: Salary */}
                                <div className="group">
                                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">Salary</label>
                                    <div className="flex items-center gap-3 text-zinc-300 p-3 bg-zinc-950/70 rounded-lg border border-zinc-800/80">
                                        <DollarSign className="w-5 h-5 text-emerald-400 opacity-80 flex-shrink-0" />
                                        <span className="truncate opacity-70">
                                            {profile?.salary ? profile.salary : "Not set"}
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
                                            <span className="truncate">{profile?.phoneNumber || "Not set"}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Editable: Specialization */}
                                <div className="group">
                                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block flex justify-between">
                                        Specialization {isEditing && <span className="text-[10px] text-emerald-400 lowercase normal-case tracking-normal font-normal">*Required</span>}
                                    </label>
                                    {isEditing ? (
                                        <div className="relative">
                                            <Briefcase className="w-5 h-5 text-emerald-400 absolute left-3 top-2.5 z-10" />
                                            <input
                                                type="text"
                                                value={formData.specialization || ''}
                                                onChange={e => setFormData({ ...formData, specialization: e.target.value })}
                                                className="w-full pl-10 bg-zinc-950 border border-emerald-500/50 outline-none ring-2 ring-emerald-500/20 rounded-lg px-3 py-2 text-white transition-all shadow-input"
                                                placeholder="e.g. Strength Training, Yoga"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3 text-zinc-300 p-3 bg-zinc-950/40 rounded-lg border border-zinc-800/50 hover:bg-zinc-900 hover:border-zinc-700 transition-colors cursor-default">
                                            <Briefcase className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                            <span className="truncate">{profile?.specialization || "Not set"}</span>
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

                                {/* Editable: Qualification */}
                                <div className="group">
                                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block flex justify-between">
                                        Qualification {isEditing && <span className="text-[10px] text-emerald-400 lowercase normal-case tracking-normal font-normal">*Required</span>}
                                    </label>
                                    {isEditing ? (
                                        <div className="relative">
                                            <GraduationCap className="w-5 h-5 text-emerald-400 absolute left-3 top-2.5 z-10" />
                                            <input
                                                type="text"
                                                value={formData.qualification || ''}
                                                onChange={e => setFormData({ ...formData, qualification: e.target.value })}
                                                className="w-full pl-10 bg-zinc-950 border border-emerald-500/50 outline-none ring-2 ring-emerald-500/20 rounded-lg px-3 py-2 text-white transition-all shadow-input"
                                                placeholder="e.g. B.Sc Sports Science"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3 text-zinc-300 p-3 bg-zinc-950/40 rounded-lg border border-zinc-800/50 hover:bg-zinc-900 hover:border-zinc-700 transition-colors cursor-default">
                                            <GraduationCap className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                            <span className="truncate">{profile?.qualification || "Not set"}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Editable: Address */}
                                <div className="group md:col-span-2">
                                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block flex justify-between">
                                        Address {isEditing && <span className="text-[10px] text-emerald-400 lowercase normal-case tracking-normal font-normal">*Required</span>}
                                    </label>
                                    {isEditing ? (
                                        <div className="relative">
                                            <MapPin className="w-5 h-5 text-emerald-400 absolute left-3 top-3 z-10" />
                                            <textarea
                                                value={formData.address || ''}
                                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                                                className="w-full pl-10 bg-zinc-950 border border-emerald-500/50 outline-none ring-2 ring-emerald-500/20 rounded-lg px-3 py-2 text-white transition-all shadow-input resize-none h-24"
                                                placeholder="Enter full address"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex items-start gap-3 text-zinc-300 p-3 bg-zinc-950/40 rounded-lg border border-zinc-800/50 hover:bg-zinc-900 hover:border-zinc-700 transition-colors cursor-default min-h-[5rem]">
                                            <MapPin className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                                            <span className="whitespace-pre-wrap">{profile?.address || "Not set"}</span>
                                        </div>
                                    )}
                                </div>

                            </div>

                            {/* Certificates Section */}
                            {profile?.certificates && profile.certificates.length > 0 && (
                                <div className="mt-8">
                                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 block flex justify-between items-center">
                                        <span>Certificates</span>
                                        <span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded text-zinc-500 uppercase tracking-wider font-semibold shadow-inner border border-zinc-700/50">View Only</span>
                                    </label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                        {profile.certificates.map((certUrl, idx) => {
                                            const isPdf = certUrl.toLowerCase().endsWith('.pdf');
                                            return (
                                                <div key={idx} className="relative group rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 aspect-square flex flex-col items-center justify-center hover:border-zinc-700 transition-all">
                                                    {isPdf ? (
                                                        <>
                                                            <FileText className="w-12 h-12 text-zinc-500 mb-2" />
                                                            <span className="text-xs text-zinc-400">PDF Document</span>
                                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                                                <a href={certUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-emerald-400 text-black text-xs font-bold rounded-lg shadow-lg hover:bg-emerald-300 transition-colors">
                                                                    View
                                                                </a>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <img src={certUrl} alt={`Certificate ${idx + 1}`} className="w-full h-full object-cover" />
                                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                                                <a href={certUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-emerald-400 text-black text-xs font-bold rounded-lg shadow-lg hover:bg-emerald-300 transition-colors">
                                                                    View
                                                                </a>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

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

export default TrainerProfilePage;
