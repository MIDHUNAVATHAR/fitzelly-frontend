import React, { useState, useEffect, useRef } from 'react';
import { Mail, Phone, MapPin, Edit3, Camera, Save, Crosshair, AlertTriangle, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getGymProfile, updateGymProfile, uploadGymLogo, type GymProfile } from "../../../api/gym-profile.api";
import { useImageCropper } from '../../../hooks/useImageCropper';
import ImageCropperModal from '../../../components/ui/ImageCropperModal';
import { useLocation } from '../../../hooks/useLocation';

const Profile: React.FC = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [loadingProfile, setLoadingProfile] = useState(true);

    const [profile, setProfile] = useState<GymProfile | null>(null);
    const [formData, setFormData] = useState<GymProfile>({});
    const [showLocationWarning, setShowLocationWarning] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Location hook
    const { getCurrentLocation, loadingLocation } = useLocation();

    // Handle cropped image
    const handleCroppedImage = async (croppedImageBlob: Blob) => {
        try {
            const fileName = `logo-${Date.now()}.jpg`;
            const file = new File([croppedImageBlob], fileName, { type: "image/jpeg" });

            const toastId = toast.loading("Uploading image...");
            const { logoUrl } = await uploadGymLogo(file);

            setProfile(prev => prev ? ({ ...prev, logoUrl }) : null);
            setFormData(prev => ({ ...prev, logoUrl }));
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
        aspectRatio: 1 // Square for gym logo
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const profileData = await getGymProfile();
            setProfile(profileData);
            setFormData(profileData);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load profile");
        } finally {
            setLoadingProfile(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];

            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error("Please select an image file");
                return;
            }

            // Validate file size -max 5MB
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Image size should be less than 5MB");
                return;
            }

            await handleFileSelect(file);
            e.target.value = '';
        }
    };

    const handleSave = async () => {

        const { gymName, caption, phoneNumber, address, description } = formData;

        if (!gymName?.trim() || !caption?.trim() || !phoneNumber?.trim() || !address?.trim() || !description?.trim()) {
            toast.error("All fields are mandatory");
            return;
        }

        if (gymName?.trim().length > 30 || caption?.trim().length > 50 || phoneNumber?.trim().length > 30 || address?.trim().length > 30 || description?.trim().length > 30) {
            toast.error("Data too long...");
            return;
        }
        setIsSaving(true);
        try {
            const updatedProfile = await updateGymProfile(formData);
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

    const handleGetLocation = () => {
        setShowLocationWarning(true);
    };

    const confirmUpdateLocation = async () => {
        setShowLocationWarning(false);

        const coords = await getCurrentLocation();

        if (coords) {
            try {
                await updateGymProfile({
                    location: { latitude: coords.latitude, longitude: coords.longitude }
                });

                const updatedLocation = { latitude: coords.latitude, longitude: coords.longitude };
                setProfile(prev => prev ? ({ ...prev, location: updatedLocation }) : { location: updatedLocation });
                setFormData(prev => ({ ...prev, location: updatedLocation }));

                toast.success("Gym location updated to your current position!");
            } catch {
                toast.error("Failed to update location on server");
            }
        }
    };


    // Check if approval status is not approved

    const isNotApproved = profile?.approvalStatus !== "Approved";

    // Get status color based on subscription status
    const getStatusColor = (status: string | undefined) => {
        switch (status) {
            case 'Active': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
            case 'Trial': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
            case 'Expired': return 'text-red-400 bg-red-400/10 border-red-400/20';
            default: return 'text-amber-400 bg-amber-400/10 border-amber-400/20'; // Pending
        }
    };

    return (
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Gym Profile</h1>
                <p className="text-zinc-400 mt-1 text-sm sm:text-base">Manage your gym's public information and settings.</p>
            </div>

            {/* Approval Status Banner -not approved */}
            {isNotApproved && !loadingProfile && (
                <div className="mb-6 bg-gradient-to-r from-amber-300/20 to-orange-400/20 border border-amber-500/30 rounded-xl p-4 sm:p-5 backdrop-blur-sm">
                    <div className="flex items-start gap-3 sm:gap-4">
                        <div className="p-2 sm:p-3 bg-amber-500/20 rounded-xl flex-shrink-0">
                            <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-base sm:text-lg font-semibold text-amber-400 mb-1">Approval {profile?.approvalStatus}</h3>
                            <p className="text-sm sm:text-base text-amber-200/90">
                                Your gym profile is currently under review. Once approved, you'll automatically receive a <span className="font-bold text-amber-300">30-day free trial</span> to explore all premium features!
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-1 rounded-full border border-amber-500/30">
                                    ✓ Complete your profile
                                </span>
                                <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-1 rounded-full border border-amber-500/30">
                                    ✓ Get approved
                                </span>
                                <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded-full border border-emerald-500/30">
                                    🎁 30 days free trial
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Simple Subscription Status Banner */}
            {profile?.subscriptionStatus !== "Pending" && !loadingProfile && (

                <div className={`mb-4 px-4 py-3 rounded-lg border ${getStatusColor(profile?.subscriptionStatus)} flex items-center justify-between`}>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Subscription Status:</span>
                        <span className="text-sm font-semibold capitalize">{profile?.subscriptionStatus || 'Pending'}</span>
                    </div>
                    {profile?.expiryDate && profile?.subscriptionStatus !== 'Pending' && (
                        <span className="text-xs text-zinc-400">
                            Expires: {new Date(profile.expiryDate).toLocaleDateString('en-IN')}
                        </span>
                    )}
                </div>
            )}



            <div className="grid grid-cols-1 gap-6">
                <div className="space-y-6">
                    {/* Main Card */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                        <div className="h-20 sm:h-40 bg-gradient-to-r from-emerald-900/20 to-zinc-900 relative">
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-400/10 via-transparent to-transparent"></div>
                        </div>

                        <div className="px-4 sm:px-6 pb-6 sm:pb-8 relative">
                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handleFileChange}
                            />
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="w-20 h-20 sm:w-28 sm:h-28 rounded-xl sm:rounded-2xl bg-zinc-800 border-4 border-zinc-900 absolute -top-10 sm:-top-14 flex items-center justify-center group cursor-pointer overflow-hidden shadow-xl"
                            >
                                {profile?.logoUrl || formData.logoUrl ? (
                                    <img
                                        src={profile?.logoUrl || formData.logoUrl}
                                        alt="Gym Logo"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            // Fallback if image fails to load
                                            const target = e.target as HTMLImageElement;
                                            target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23222'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='16' fill='%234a4a4a'%3Egym%3C/text%3E%3C/svg%3E`;
                                        }}
                                    />
                                ) : (
                                    <span className="text-2xl sm:text-3xl font-bold text-zinc-600 group-hover:hidden">𓆩gym𓆪</span>
                                )}
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
                                </div>
                            </div>

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

                                {isEditing ? (
                                    <div className="space-y-4 max-w-lg">
                                        <div>
                                            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5 block">Gym Name</label>
                                            <input
                                                type="text"
                                                value={formData.gymName || ''}
                                                onChange={e => setFormData({ ...formData, gymName: e.target.value })}
                                                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-400 transition-colors text-sm sm:text-base"
                                                placeholder="Enter gym name"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5 block">Caption / Tagline</label>
                                            <input
                                                type="text"
                                                value={formData.caption || ''}
                                                onChange={e => setFormData({ ...formData, caption: e.target.value })}
                                                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-400 transition-colors text-sm sm:text-base"
                                                placeholder="e.g. Premium Fitness Center"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <h2 className="text-xl sm:text-2xl font-bold text-white">{profile?.gymName || formData.gymName || "Gym Name"}</h2>
                                        <p className="text-zinc-400 text-sm sm:text-base mt-1">{profile?.caption || formData.caption || "Add a caption"}</p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-8 sm:mt-10 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
                                <div className="group">
                                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">Email Address</label>
                                    <div className="flex items-center gap-3 text-zinc-300 p-3 bg-zinc-950/50 rounded-lg border border-zinc-800/50 text-sm sm:text-base">
                                        <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 flex-shrink-0" />
                                        <span className="opacity-70 cursor-not-allowed truncate" title="Email cannot be changed">{profile?.email || formData.email || "email@example.com"}</span>
                                        <span className="ml-auto text-xs bg-zinc-800 px-2 py-0.5 rounded text-zinc-500 flex-shrink-0">Read-only</span>
                                    </div>
                                </div>

                                <div className="group">
                                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">Phone Number</label>
                                    {isEditing ? (
                                        <div className="relative">
                                            <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 absolute left-3 top-2.5 z-10" />
                                            <input
                                                type="text"
                                                value={formData.phoneNumber || ''}
                                                onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                                                className="w-full pl-10 bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-400 transition-colors text-sm sm:text-base"
                                                placeholder="+1 (555) 000-0000"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3 text-zinc-300 p-3 bg-zinc-950/50 rounded-lg border border-zinc-800/50 text-sm sm:text-base">
                                            <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 flex-shrink-0" />
                                            <span className="truncate">{profile?.phoneNumber || formData.phoneNumber || "Not set"}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="group md:col-span-2">
                                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">Address</label>
                                    {isEditing ? (
                                        <div className="relative">
                                            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 absolute left-3 top-2.5 z-10" />
                                            <input
                                                type="text"
                                                value={formData.address || ''}
                                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                                                className="w-full pl-10 bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-400 transition-colors text-sm sm:text-base"
                                                placeholder="123 Fitness St, Muscle City"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3 text-zinc-300 p-3 bg-zinc-950/50 rounded-lg border border-zinc-800/50 text-sm sm:text-base">
                                            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 flex-shrink-0" />
                                            <span className="truncate">{profile?.address || formData.address || "Not set"}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* About Section */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">About the Gym</h3>
                        {isEditing ? (
                            <div className="space-y-4">
                                <textarea
                                    value={formData.description || ''}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-400 transition-colors min-h-[120px] text-sm sm:text-base"
                                    placeholder="Describe your gym..."
                                />
                                <div className="flex gap-3 justify-end pt-2">
                                    <button onClick={handleCancel} disabled={isSaving} className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-zinc-800 text-white font-semibold rounded-lg text-sm hover:bg-zinc-700 transition-colors disabled:opacity-50">
                                        Cancel
                                    </button>
                                    <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-emerald-400 text-black font-semibold rounded-lg text-sm hover:bg-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                        {isSaving ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                                {profile?.description || formData.description || "No description provided yet."}
                            </p>
                        )}
                    </div>

                    {/* Location Section */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-6">
                        <div className="mb-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-white">Gym Location</h3>
                                    <p className="text-zinc-400 text-sm mt-1">Set your gym's precise location data for attendance tracking.</p>
                                </div>
                                <div className={`self-start sm:self-center px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap ${profile?.location?.latitude ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                    {profile?.location?.latitude ? 'Location Configured' : 'Location Not Set'}
                                </div>
                            </div>
                            <div className="text-xs text-amber-500/90 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg flex gap-2 items-start">
                                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                <span>Important: Only update this when you are physically standing at the gym location.</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50">
                            <div>
                                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">Current Coordinates</label>
                                <div className="flex items-center gap-3 text-zinc-300 font-mono text-sm bg-zinc-900/50 p-3 rounded-lg border border-zinc-800/50">
                                    <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                    {profile?.location?.latitude ? (
                                        <span className="truncate">{profile.location.latitude.toFixed(6)}, {profile.location.longitude.toFixed(6)}</span>
                                    ) : (
                                        <span className="text-zinc-500 italic">No coordinates stored</span>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={handleGetLocation}
                                disabled={loadingLocation}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 border border-zinc-700 text-sm sm:text-base"
                            >
                                {loadingLocation ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Crosshair className="w-4 h-4" />}
                                {loadingLocation ? "Fetching Location..." : "Update to Current Location"}
                            </button>
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
                    title="Adjust Gym Logo"
                    aspectRatio={1}
                />
            )}

            {/* Location Warning Modal */}
            {showLocationWarning && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-zinc-900 rounded-2xl w-full max-w-md overflow-hidden border border-red-500/30 p-6 text-center">
                        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Are you at the gym?</h3>
                        <p className="text-zinc-400 mb-6">Please ensure you are physically standing at your gym's location for accuracy.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowLocationWarning(false)} className="flex-1 px-4 py-3 bg-zinc-800 text-white font-semibold rounded-xl">Cancel</button>
                            <button onClick={confirmUpdateLocation} className="flex-1 px-4 py-3 bg-emerald-400 text-black font-semibold rounded-xl">Yes, I'm here</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;