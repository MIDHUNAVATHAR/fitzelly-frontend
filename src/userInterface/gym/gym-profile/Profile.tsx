import React from 'react';
import Spinner from '../../../components/ui/Spinner';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import ImageCropperModal from '../../../components/ui/ImageCropperModal';
import { ApprovalBanner } from './components/ApprovalBanner';
import { ProfileHeader } from './components/ProfileHeader';
import { LocationSection } from './components/LocationSection';
import { CertificatesSection } from './components/CertificatesSection';
import { SubscriptionSection } from './components/SubscriptionSection';
import { LocationWarningModal } from './components/Modals/LocationWarningModal';
import { CertNameModal } from './components/Modals/CertNameModal';
import { ProfileEditModal } from './components/Modals/ProfileEditModal';
import { useProfile } from './hooks/useProfile';

const Profile: React.FC = () => {
    const profileState = useProfile();
    const {
        profile, formData, loadingProfile, isSaving, isReApplying, showLocationWarning,
        loadingLocation, certName, isUploadingCert, certToDelete, showCertNameModal,
        fileInputRef, certInputRef, imageSrc, crop, zoom, isCropping, isUploadingImage,
        setCrop, setZoom, handleUploadCroppedImage, onCropComplete, cancelCropping,
        handleSave, handleCancel, handleReApply, handleGetLocation, confirmUpdateLocation,
        closeLocationWarning, confirmCertUpload, handleDeleteCert, handleFileChange, handleCertFileChange,
        setFormData, setIsEditing, setCertName, setShowCertNameModal, setPendingCertFile,
        setCertToDelete, isNotApproved, getStatusColor,
    } = profileState;

    if (loadingProfile) return <div className="w-full animate-in fade-in duration-500"><Spinner /></div>;

    return (
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            {isNotApproved && <ApprovalBanner profile={profile} isReApplying={isReApplying} onReApply={handleReApply} />}
            <div className="grid grid-cols-1 gap-6 pb-10">
                <div className="space-y-6">
                    <ProfileHeader profile={profile} fileInputRef={fileInputRef as React.RefObject<HTMLInputElement>} onFileChange={handleFileChange} onEditToggle={() => setIsEditing(true)} />
                    <LocationSection hasLocation={!!profile?.location?.latitude} loadingLocation={loadingLocation} onUpdateLocation={handleGetLocation} />
                    <CertificatesSection profile={profile} certInputRef={certInputRef as React.RefObject<HTMLInputElement>} onCertFileChange={handleCertFileChange} onDeleteCert={(key) => setCertToDelete(key)} />
                    <SubscriptionSection profile={profile} statusColor={getStatusColor(profile?.subscriptionStatus)} />
                </div>
            </div>
            <ProfileEditModal profile={profile} formData={formData} isOpen={profileState.isEditing} isSaving={isSaving} fileInputRef={fileInputRef as React.RefObject<HTMLInputElement>} onClose={handleCancel} onChange={setFormData} onFileChange={handleFileChange} onSave={handleSave} />
            {isCropping && imageSrc && <ImageCropperModal imageSrc={imageSrc} crop={crop} zoom={zoom} isUploading={isUploadingImage} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete} onUpload={handleUploadCroppedImage} onCancel={cancelCropping} title="Adjust Gym Logo" aspectRatio={1} />}
            {showLocationWarning && <LocationWarningModal onCancel={closeLocationWarning} onConfirm={confirmUpdateLocation} />}
            {showCertNameModal && <CertNameModal certName={certName} onCertNameChange={setCertName} onCancel={() => { setShowCertNameModal(false); setCertName(''); setPendingCertFile(null); }} onConfirm={confirmCertUpload} />}
            <ConfirmModal isOpen={!!certToDelete} onClose={() => setCertToDelete(null)} onConfirm={handleDeleteCert} title="Delete Certificate?" message="This process cannot be undone. The document will be permanently removed." variant="danger" confirmText="Delete Document" isProcessing={isUploadingCert} />
        </div>
    );
};

export default Profile;
