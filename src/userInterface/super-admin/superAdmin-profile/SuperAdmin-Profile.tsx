import React, { useState, useRef, useEffect } from 'react';
import { Mail, Phone, Edit3, Camera, Save, Building2 } from 'lucide-react';
import { getSuperAdminProfile, updateSuperAdminProfile, uploadSuperAdminLogo, type SuperAdminProfile } from "../../../api/superAdmin-profile.api";
import { toast } from 'react-hot-toast';
import { useImageCropper } from '../../../hooks/useImageCropper';
import ImageCropperModal from '../../../components/ui/ImageCropperModal';

const SuperAdmProfile: React.FC = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState<SuperAdminProfile>({});
    const [formData, setFormData] = useState<SuperAdminProfile>({});
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);


    // Handle cropped image
    const handleCroppedImage = async (croppedImageBlob: Blob) => {
        try {
            const fileName = `logo-${Date.now()}.jpg`;
            const file = new File([croppedImageBlob], fileName, { type: "image/jpeg" });

            const toastId = toast.loading("Uploading image...");
            await uploadSuperAdminLogo(file);


            const base64Image = URL.createObjectURL(croppedImageBlob);
            setFormData(prev => ({ ...prev, logoUrl: base64Image }));
            setProfile(prev => ({ ...prev, logoUrl: base64Image }));

            toast.dismiss(toastId);
            toast.success("Logo updated successfully!");


        }
        catch (error) {
            console.error('Error uploading cropped image:', error);
            toast.error("Failed to upload logo");
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
        aspectRatio: 1 // Square for app logo
    });

    
    // Get profile info
    useEffect(() => {
        const loadProfile = async () => {
            try {
                const data = await getSuperAdminProfile();
                setProfile(data);
                setFormData(data);
            } catch {
                toast.error("Failed to load profile");
            }
        };
        
        loadProfile();
    }, []);



    // Profile edit
    const handleSave = async () => {
        setIsSaving(true);
        try {
            const data = await updateSuperAdminProfile(formData);
            setProfile(formData);
            if (data.status === "success") {
                toast.success(data.message || "Profile edit successful");
            }
            setIsSaving(false);
            setIsEditing(false);
        } catch {
            setIsSaving(false);
            toast.error("Failed to edit profile");
        }
    };

    const handleCancel = () => {
        setFormData(profile);
        setIsEditing(false);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];

            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error("Please select an image file");
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Image size should be less than 5MB");
                return;
            }

            await handleFileSelect(file);
            e.target.value = '';
        }
    };

    return (
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-white">App Configuration</h1>
                <p className="text-zinc-400 mt-1 text-sm sm:text-base">Manage global Fitzelly settings and information.</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <div className="space-y-6">
                    {/* Main Card */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
                        {/* Cover Gradient */}
                        <div className="h-24 sm:h-40 bg-gradient-to-r from-emerald-900/30 via-zinc-900 to-zinc-900 relative">
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-400/10 via-transparent to-transparent"></div>
                        </div>

                        <div className="px-4 sm:px-8 pb-8 relative">
                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handleFileChange}
                            />
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-zinc-800 border-4 border-black absolute -top-12 sm:-top-16 flex items-center justify-center group cursor-pointer overflow-hidden shadow-2xl transition-transform hover:scale-[1.02]"
                            >
                                {profile?.logoUrl || formData.logoUrl ? (
                                    <img
                                        src={profile?.logoUrl || formData.logoUrl}
                                        alt="App Logo"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            // Fallback if image fails to load
                                            const target = e.target as HTMLImageElement;
                                            target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23222'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='16' fill='%234a4a4a'%3EApp%3C/text%3E%3C/svg%3E`;
                                        }}
                                    />
                                ) : (
                                    <Building2 className="w-10 h-10 text-zinc-600" />
                                )}
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                                </div>
                            </div>

                            <div className="ml-28 sm:ml-40 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    {isEditing ? (
                                        <div className="space-y-3 max-w-md">
                                            <input
                                                type="text"
                                                value={formData.appName || ''}
                                                onChange={e => setFormData({ ...formData, appName: e.target.value })}
                                                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-400 transition-colors text-lg font-bold"
                                                placeholder="App Name"
                                            />
                                            <input
                                                type="text"
                                                value={formData.caption || ''}
                                                onChange={e => setFormData({ ...formData, caption: e.target.value })}
                                                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-zinc-400 focus:outline-none focus:border-emerald-400 transition-colors text-sm"
                                                placeholder="App Tagline"
                                            />
                                        </div>
                                    ) : (
                                        <>
                                            <h2 className="text-xl sm:text-3xl font-bold text-white tracking-tight">{profile?.appName || "Fitzelly"}</h2>
                                            <p className="text-emerald-400/80 text-sm sm:text-base font-medium">{profile?.caption || "Elevating Fitness Management"}</p>
                                        </>
                                    )}
                                </div>
                                {!isEditing && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="flex items-center justify-center gap-2 px-4 py-2 bg-zinc-800 text-white font-semibold rounded-xl text-sm hover:bg-zinc-700 transition-all border border-zinc-700"
                                    >
                                        <Edit3 className="w-4 h-4 text-emerald-400" />
                                        Edit Details
                                    </button>
                                )}
                            </div>

                            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Login Identity</label>
                                    <div className="flex items-center gap-3 text-zinc-400 p-4 bg-zinc-950/50 rounded-xl border border-zinc-800/50">
                                        <Mail className="w-5 h-5 text-emerald-500/50" />
                                        <span className="truncate text-sm sm:text-base">{profile?.email}</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Public Contact Email</label>
                                    {isEditing ? (
                                        <div className="relative group">
                                            <Mail className="w-5 h-5 text-emerald-400 absolute left-4 top-1/2 -translate-y-1/2" />
                                            <input
                                                type="email"
                                                value={formData.contactEmail || ''}
                                                onChange={e => setFormData({ ...formData, contactEmail: e.target.value })}
                                                className="w-full pl-12 pr-4 bg-zinc-950 border border-zinc-700 rounded-xl py-3.5 text-white focus:outline-none focus:border-emerald-400 transition-all shadow-inner"
                                                placeholder="contact@fitzelly.com"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3 text-zinc-200 p-4 bg-zinc-950/80 rounded-xl border border-zinc-800 shadow-sm">
                                            <Mail className="w-5 h-5 text-emerald-400" />
                                            <span className="truncate text-sm sm:text-base">{profile?.contactEmail || "Not configured"}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Support Line</label>
                                    {isEditing ? (
                                        <div className="relative group">
                                            <Phone className="w-5 h-5 text-emerald-400 absolute left-4 top-1/2 -translate-y-1/2" />
                                            <input
                                                type="text"
                                                value={formData.phoneNumber || ''}
                                                onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                                                className="w-full pl-12 pr-4 bg-zinc-950 border border-zinc-700 rounded-xl py-3.5 text-white focus:outline-none focus:border-emerald-400 transition-all shadow-inner"
                                                placeholder="+1 (555) 000-0000"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3 text-zinc-200 p-4 bg-zinc-950/80 rounded-xl border border-zinc-800 shadow-sm">
                                            <Phone className="w-5 h-5 text-emerald-400" />
                                            <span className="truncate text-sm sm:text-base">{profile?.phoneNumber || "Not configured"}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* About Section */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-lg">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <div className="w-1 h-6 bg-emerald-400 rounded-full"></div>
                                Platform Description
                            </h3>
                        </div>
                        {isEditing ? (
                            <div className="space-y-4">
                                <textarea
                                    value={formData.description || ''}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-emerald-400 transition-all min-h-[200px] shadow-inner text-sm sm:text-base leading-relaxed"
                                    placeholder="Tell users more about Fitzelly..."
                                />
                                <div className="flex gap-3 justify-end pt-4">
                                    <button
                                        onClick={handleCancel}
                                        disabled={isSaving}
                                        className="px-6 py-2.5 bg-zinc-800 text-zinc-300 font-bold rounded-xl text-sm hover:bg-zinc-700 transition-colors disabled:opacity-50"
                                    >
                                        Discard
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="flex items-center gap-2 px-8 py-2.5 bg-emerald-400 text-black font-bold rounded-xl text-sm hover:bg-emerald-500 transition-all hover:shadow-[0_0_20px_rgba(52,211,153,0.3)] disabled:opacity-50"
                                    >
                                        {isSaving ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                                        Apply Changes
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-zinc-950/30 p-6 rounded-xl border border-zinc-800/50">
                                <p className="text-zinc-400 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                                    {profile?.description || "Explain the platform's vision and core values here."}
                                </p>
                            </div>
                        )}
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
                    title="Position App Logo"
                    aspectRatio={1}
                />
            )}
        </div>
    );
};

export default SuperAdmProfile;