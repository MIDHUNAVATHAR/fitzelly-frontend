import React, { useState, useEffect, useRef } from 'react';
import { Mail, Phone, MapPin, Edit3, Camera, Save, X, Crosshair, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getGymProfile, updateGymProfile, uploadGymLogo, type GymProfile } from "../../../api/gym-profile.api";

import Cropper from 'react-easy-crop';
import getCroppedImg from "../../../utils/cropImage";


interface CropArea {
    x: number;
    y: number;
    width: number;
    height: number;
}

const Profile: React.FC = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState<GymProfile | null>(null);
    const [formData, setFormData] = useState<GymProfile>({});
    const [loadingLocation, setLoadingLocation] = useState(false);
    const [showLocationWarning, setShowLocationWarning] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [isUploadingImage, setIsUploadingImage] = useState(false);

    // Image Cropping State
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null);
    const [isCropping, setIsCropping] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const onCropComplete = (_croppedArea: any, croppedAreaPixels: CropArea) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const readFile = (file: File): Promise<string> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.addEventListener('load', () => resolve(reader.result as string), false);
            reader.readAsDataURL(file);
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const imageDataUrl = await readFile(file);
            setImageSrc(imageDataUrl);
            setIsCropping(true);
            e.target.value = '';
        }
    };

    const handleUploadCroppedImage = async () => {
        if (isUploadingImage) return
        try {
            setIsUploadingImage(true)
            if (!imageSrc || !croppedAreaPixels) return;
            const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
            if (!croppedImageBlob) return;

            // Create a File from the Blob
            const file = new File([croppedImageBlob], "profile.jpg", { type: "image/jpeg" });

            // Upload
            const toastId = toast.loading("Uploading image...");
            const { logoUrl } = await uploadGymLogo(file);

            setProfile(prev => prev ? ({ ...prev, logoUrl }) : null);
            setFormData(prev => ({ ...prev, logoUrl }));
            setIsCropping(false);
            setImageSrc(null);
            toast.dismiss(toastId);
            toast.success("Profile picture updated!");
        } catch (e) {
            console.error(e);
            toast.error("Failed to upload image");
        } finally {
            setIsUploadingImage(false)
        }
    };


    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const profile = await getGymProfile();
            setProfile(profile);
            setFormData(profile);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load profile");
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const profile = await updateGymProfile(formData);
            setProfile({ ...profile })
            setIsEditing(false);
            toast.success("Profile updated successfully");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update profile");
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


    const getPosition = (options?: PositionOptions): Promise<GeolocationPosition> => {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, options);
        });
    };

    const confirmUpdateLocation = async () => {

        if (loadingLocation) return;

        toast.dismiss();
        setShowLocationWarning(false);
        setLoadingLocation(true);

        try {

            // Promisified Geolocation Call
            const position = await getPosition({ enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });

            const { latitude, longitude } = position.coords;

            // Update Backend
            await updateGymProfile({ location: { latitude: latitude, longitude: longitude } });

            // Update Local State
            const updatedLocation = { latitude: latitude, longitude: longitude };
            setProfile(prev => prev ? ({ ...prev, location: updatedLocation }) : { location: updatedLocation });
            setFormData(prev => ({ ...prev, location: updatedLocation }));

            toast.success("Gym location updated to your current position!");

        } catch (error: any) {
            console.error("Location/Update Error:", error);

            let errorMessage = "Unable to retrieve your location";

            // Handle specific Geolocation errors or Backend errors
            if (error.code === 1) errorMessage = "Permission denied. Please click the lock icon in your URL bar to allow location.";
            else if (error.code === 2) errorMessage = "Location unavailable. Check your device GPS / Signal.";
            else if (error.code === 3) errorMessage = "Request timed out. Please try again in an open area.";
            else if (error.message) errorMessage = error.message;

            toast.error(errorMessage);
        } finally {
            setLoadingLocation(false);
            //timeout for prevent immediate clicking
        }
    };

    return (
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header  */}
            <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Gym Profile</h1>
                <p className="text-zinc-400 mt-1 text-sm sm:text-base">Manage your gym's public information and settings.</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {/* Main Content  */}
                <div className="space-y-6">

                    {/* Main Card */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                        {/* Cover Image Placeholder */}
                        <div className="h-20 sm:h-40 bg-gradient-to-r from-emerald-900/20 to-zinc-900 relative">
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-400/10 via-transparent to-transparent"></div>
                        </div>

                        <div className="px-4 sm:px-6 pb-6 sm:pb-8 relative">
                            {/* Avatar with better mobile spacing */}
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
                                    <img src={profile?.logoUrl || formData.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-2xl sm:text-3xl font-bold text-zinc-600 group-hover:hidden">𓆩gym𓆪</span>
                                )}
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
                                </div>
                            </div>

                            {/* Info section with Edit button */}
                            <div className="ml-24 sm:ml-32 pt-0 sm:pt-2">
                                {/* Edit Profile Button - Top Right */}
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

                            {/* Grid Details */}
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

                    {/* Bio / Description */}
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
                                    <button
                                        onClick={handleCancel}
                                        disabled={isSaving}
                                        className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-zinc-800 text-white font-semibold rounded-lg text-sm hover:bg-zinc-700 transition-colors disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-emerald-400 text-black font-semibold rounded-lg text-sm hover:bg-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSaving ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4" />
                                                Save Changes
                                            </>
                                        )}
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
                            {/* Title and status label in one line */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-white">Gym Location</h3>
                                    <p className="text-zinc-400 text-sm mt-1">
                                        Set your gym's precise location data. This is used for track client and trainer attendance
                                    </p>
                                </div>

                                {/* Status label */}
                                <div className={`self-start sm:self-center px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap ${profile?.location && typeof profile.location.latitude === 'number' && typeof profile.location.longitude === 'number' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                    {profile?.location && typeof profile.location.latitude === 'number' && typeof profile.location.longitude === 'number' ? 'Location Configured' : 'Location Not Set'}
                                </div>
                            </div>

                            {/* Warning box */}
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
                                    {profile?.location && typeof profile.location.latitude === 'number' && typeof profile.location.longitude === 'number' ? (
                                        <span className="truncate">
                                            {profile.location.latitude.toFixed(6)}, {profile.location.longitude.toFixed(6)}
                                        </span>
                                    ) : (
                                        <span className="text-zinc-500 italic">No coordinates stored</span>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={handleGetLocation}
                                disabled={loadingLocation}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-zinc-700 text-sm sm:text-base"
                            >
                                {loadingLocation ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Fetching Location...</span>
                                    </>
                                ) : (
                                    <>
                                        <Crosshair className="w-4 h-4" />
                                        <span>Update to Current Location</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                </div>
            </div>

            {/* Image Cropper Modal */}
            {isCropping && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-zinc-900 rounded-2xl w-full max-w-lg overflow-hidden border border-zinc-800">
                        <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
                            <h3 className="font-semibold text-white">Adjust Image</h3>
                            <button onClick={() => { setIsCropping(false); setImageSrc(null); }} className="text-zinc-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="relative w-full h-80 bg-zinc-950">
                            <Cropper
                                image={imageSrc || ""}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                            />
                        </div>
                        <div className="p-6">
                            <div className="mb-4">
                                <label className="text-xs text-zinc-500 uppercase font-semibold mb-2 block">Zoom</label>
                                <input
                                    type="range"
                                    value={zoom}
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    aria-labelledby="Zoom"
                                    onChange={(e) => setZoom(Number(e.target.value))}
                                    className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                    style={{ accentColor: '#34d399' }}
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => { setIsCropping(false); setImageSrc(null); }}
                                    className="flex-1 px-4 py-2 bg-zinc-800 text-white font-semibold rounded-lg hover:bg-zinc-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUploadCroppedImage}
                                    disabled={isUploadingImage}
                                    className="flex-1 px-4 py-2 bg-emerald-400 text-black font-semibold rounded-lg hover:bg-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isUploadingImage ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                            Uploading...
                                        </>
                                    ) : (
                                        'Upload & Save'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Location Warning Modal */}
            {showLocationWarning && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-zinc-900 rounded-2xl w-full max-w-md overflow-hidden border border-red-500/30 shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="p-6 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                                <AlertTriangle className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Are you at the gym?</h3>
                            <p className="text-zinc-400 mb-6">
                                We are about to capture your device's current GPS coordinates. Please ensure you are physically standing at your gym's location to ensure accuracy for your customers.
                            </p>

                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setShowLocationWarning(false)}
                                    className="flex-1 px-4 py-3 bg-zinc-800 text-white font-semibold rounded-xl hover:bg-zinc-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmUpdateLocation}
                                    className="flex-1 px-4 py-3 bg-emerald-400 text-black font-semibold rounded-xl hover:bg-emerald-500 transition-colors"
                                >
                                    Yes, I'm here
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Profile;