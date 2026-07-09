import React from 'react';
import Spinner from '../../../components/ui/Spinner';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import ImageCropperModal from '../../../components/ui/ImageCropperModal';
import { ApprovalBanner } from './components/ApprovalBanner';
import { ProfileHeader } from './components/ProfileHeader';
import { AboutSection } from './components/AboutSection';
import { LocationSection } from './components/LocationSection';
import { CertificatesSection } from './components/CertificatesSection';
import { SubscriptionSection } from './components/SubscriptionSection';
import { LocationWarningModal } from './components/Modals/LocationWarningModal';
import { CertNameModal } from './components/Modals/CertNameModal';
import { useProfile } from './hooks/useProfile';

const Profile: React.FC = () => {
    const {
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
        confirmUpdateLocation,
        confirmCertUpload,
        handleDeleteCert,
        handleFileChange,
        handleCertFileChange,
        setFormData,
        setIsEditing,
        setCertName,
        setShowCertNameModal,
        setPendingCertFile,
        setCertToDelete,
        isNotApproved,
        getStatusColor,
    } = useProfile();

    if (loadingProfile) {
        return (
            <div className="w-full animate-in fade-in duration-500">
                <Spinner />
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl mx-auto px-4 py-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Approval Banner */}
            {isNotApproved && (
                <ApprovalBanner
                    profile={profile}
                    isReApplying={isReApplying}
                    onReApply={handleReApply}
                />
            )}

            {/* Profile Header */}
            <ProfileHeader
                profile={profile}
                formData={formData}
                isEditing={isEditing}
                fileInputRef={fileInputRef as React.RefObject<HTMLInputElement>}
                onEditToggle={() => setIsEditing(true)}
                onFormChange={(data) => setFormData({ ...formData, ...data })}
                onFileChange={handleFileChange}
                onSave={handleSave}
                onCancel={handleCancel}
                isSaving={isSaving}
            />

            {/* About Section */}
            <AboutSection
                profile={profile}
                formData={formData}
                isEditing={isEditing}
                onFormChange={(data) => setFormData({ ...formData, ...data })}
            />

            {/* Location Section */}
            <LocationSection
                hasLocation={!!profile?.location?.latitude}
                loadingLocation={loadingLocation}
                onUpdateLocation={handleGetLocation}
            />

            {/* Certificates Section */}
            <CertificatesSection
                profile={profile}
                certInputRef={certInputRef as React.RefObject<HTMLInputElement>}
                onCertFileChange={handleCertFileChange}
                onDeleteCert={(key) => setCertToDelete(key)}
            />

            {/* Subscription Section */}
            {profile?.subscriptionStatus && profile.subscriptionStatus !== "Pending" && (
                <SubscriptionSection
                    profile={profile}
                    statusColor={getStatusColor(profile?.subscriptionStatus)}
                />
            )}

            {/* Modals */}
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

            {showLocationWarning && (
                <LocationWarningModal
                    onCancel={() => {}}
                    onConfirm={confirmUpdateLocation}
                />
            )}

            {showCertNameModal && (
                <CertNameModal
                    certName={certName}
                    onCertNameChange={setCertName}
                    onCancel={() => {
                        setShowCertNameModal(false);
                        setCertName('');
                        setPendingCertFile(null);
                    }}
                    onConfirm={confirmCertUpload}
                />
            )}

            <ConfirmModal
                isOpen={!!certToDelete}
                onClose={() => setCertToDelete(null)}
                onConfirm={handleDeleteCert}
                title="Delete Certificate?"
                message="This process cannot be undone. The document will be permanently removed."
                variant="danger"
                confirmText="Delete Document"
                isProcessing={isUploadingCert}
            />
        </div>
    );
};

export default Profile;