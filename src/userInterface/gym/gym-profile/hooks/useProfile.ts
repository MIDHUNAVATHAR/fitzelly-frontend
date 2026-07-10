import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { getGymProfile, updateGymProfile, uploadGymLogo, uploadGymCertificate, 
    deleteGymCertificate, reApplyGym } from "../../../../api/gym-profile.api";
import { type GymProfile } from '../../../../dtos/gym-profile.resDTO';
import { useImageCropper } from '../../../../hooks/useImageCropper';
import { useLocation } from '../../../../hooks/useLocation';

const keepSubscriptionDetails = (current: GymProfile | null | undefined, next: GymProfile): GymProfile => ({
    ...next,
    subscriptionStatus: current?.subscriptionStatus ?? next.subscriptionStatus,
    planName: current?.planName ?? next.planName,
    amount: current?.amount ?? next.amount,
    paymentMethod: current?.paymentMethod ?? next.paymentMethod,
    startDate: current?.startDate ?? next.startDate,
    expiryDate: current?.expiryDate ?? next.expiryDate,
});

export const useProfile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [profile, setProfile] = useState<GymProfile | null>(null);
    const [formData, setFormData] = useState<GymProfile>({});
    const [showLocationWarning, setShowLocationWarning] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isReApplying, setIsReApplying] = useState(false);
    
    // Fix: Explicitly type refs
    const fileInputRef = useRef<HTMLInputElement>(null);
    const certInputRef = useRef<HTMLInputElement>(null);

    const [certName, setCertName] = useState('');
    const [isUploadingCert, setIsUploadingCert] = useState(false);
    const [certToDelete, setCertToDelete] = useState<string | null>(null);
    const [showCertNameModal, setShowCertNameModal] = useState(false);
    const [pendingCertFile, setPendingCertFile] = useState<File | null>(null);

    const { getCurrentLocation, loadingLocation } = useLocation();

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

    const handleSave = async () => {
        const { gymName, caption, phoneNumber, address, description } = formData;

        if (!gymName?.trim() || !caption?.trim() || !phoneNumber?.trim() || !address?.trim() || !description?.trim()) {
            toast.error("All fields are mandatory");
            return;
        }

        setIsSaving(true);
        try {
            const updateData = { gymName, caption, phoneNumber, address, description, logoUrl: formData.logoUrl };
            const updatedProfile = await updateGymProfile(updateData);
            setProfile((prev) => keepSubscriptionDetails(prev, updatedProfile));
            setFormData((prev) => keepSubscriptionDetails(prev, updatedProfile));
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

    const handleReApply = async () => {
        if (!profile) return;

        const isComplete = profile.logoUrl && profile.gymName && profile.phoneNumber &&
            profile.address && profile.description && profile.location?.latitude &&
            profile.location?.longitude && profile.certificates && profile.certificates.length > 0;

        if (!isComplete) {
            toast.error("Profile incomplete. Please ensure all fields are filled.", { duration: 5000 });
            return;
        }

        try {
            setIsReApplying(true);
            await reApplyGym();
            toast.success("Re-application submitted successfully!");
            await loadProfile();
        } catch (error) {
            console.error(error);
            toast.error("Failed to re-apply");
        } finally {
            setIsReApplying(false);
        }
    };

    const handleGetLocation = () => setShowLocationWarning(true);
    const closeLocationWarning = () => setShowLocationWarning(false);

    const confirmUpdateLocation = async () => {
        setShowLocationWarning(false);
        const coords = await getCurrentLocation();

        if (coords) {
            try {
                await updateGymProfile({ location: { latitude: coords.latitude, longitude: coords.longitude } });
                const updatedLocation = { latitude: coords.latitude, longitude: coords.longitude };
                setProfile(prev => prev ? { ...prev, location: updatedLocation } : { location: updatedLocation });
                setFormData(prev => ({ ...prev, location: updatedLocation }));
                toast.success("Location updated!");
            } catch {
                toast.error("Failed to update location");
            }
        }
    };

    const handleCertFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            if (file.size > 10 * 1024 * 1024) {
                toast.error("File size should be less than 10MB");
                return;
            }
            const isPdf = file.type === 'application/pdf';
            const isImage = file.type.startsWith('image/');
            if (!isPdf && !isImage) {
                toast.error("Only PDF and image files are allowed");
                return;
            }
            setPendingCertFile(file);
            setShowCertNameModal(true);
            e.target.value = '';
        }
    };

    const confirmCertUpload = async () => {
        if (!pendingCertFile || !certName.trim()) {
            toast.error("Please enter a name for the certificate");
            return;
        }

        const file = pendingCertFile;
        const name = certName.trim();
        setShowCertNameModal(false);
        setPendingCertFile(null);

        try {
            const toastId = toast.loading(`Uploading certificate...`);
            const updatedGym = await uploadGymCertificate(file, name);
            setProfile((prev) => keepSubscriptionDetails(prev, updatedGym));
            setFormData((prev) => keepSubscriptionDetails(prev, updatedGym));
            toast.dismiss(toastId);
            toast.success("Certificate uploaded!");
            setCertName('');
        } catch (error) {
            console.error(error);
            toast.error("Failed to upload certificate");
        }
    };

    const handleDeleteCert = async () => {
        if (!certToDelete) return;
        try {
            setIsUploadingCert(true);
            const updatedGym = await deleteGymCertificate(certToDelete);
            setProfile((prev) => keepSubscriptionDetails(prev, updatedGym));
            setFormData((prev) => keepSubscriptionDetails(prev, updatedGym));
            toast.success("Certificate deleted");
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete certificate");
        } finally {
            setIsUploadingCert(false);
            setCertToDelete(null);
        }
    };

    const handleCroppedImage = async (croppedImageBlob: Blob) => {
        try {
            const fileName = `logo-${Date.now()}.jpg`;
            const file = new File([croppedImageBlob], fileName, { type: "image/jpeg" });
            const toastId = toast.loading('Uploading logo...');
            const { logoUrl } = await uploadGymLogo(file);
            setProfile(prev => prev ? ({ ...prev, logoUrl }) : null);
            setFormData(prev => ({ ...prev, logoUrl }));
            toast.dismiss(toastId);
            toast.success("Logo updated!");
        } catch (error) {
            console.error('Error uploading logo:', error);
            toast.error("Failed to upload logo");
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

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image size should be less than 5MB");
            return;
        }

        await handleFileSelect(file);

        e.target.value = '';
    }
};

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

    const isNotApproved = profile?.approvalStatus !== "Approved";

    const getStatusColor = (status: string | undefined) => {
        switch (status) {
            case 'Active': return 'text-emerald-400 bg-emerald-400/10';
            case 'Trial': return 'text-blue-400 bg-blue-400/10';
            case 'Expired': return 'text-red-400 bg-red-400/10';
            default: return 'text-amber-400 bg-amber-400/10';
        }
    };

    return {
        profile,
        formData,
        isEditing,
        loadingProfile,
        isSaving,
        isReApplying,
        showLocationWarning,
        loadingLocation,
        certName,
        isUploadingCert,
        certToDelete,
        showCertNameModal,
        pendingCertFile,
        fileInputRef,
        certInputRef,
        imageSrc,
        crop,
        zoom,
        isCropping,
        isUploadingImage,
        setCrop,
        setZoom,
        handleUploadCroppedImage,
        onCropComplete,
        cancelCropping,
        handleSave,
        handleCancel,
        handleReApply,
        handleGetLocation,
        closeLocationWarning,
        confirmUpdateLocation,
        confirmCertUpload,
        handleDeleteCert,
        handleFileChange,
        handleCertFileChange,
        setProfile,
        setFormData,
        setIsEditing,
        setCertName,
        setShowCertNameModal,
        setPendingCertFile,
        setCertToDelete,
        setShowLocationWarning,
        isNotApproved,
        getStatusColor,
    };
};
