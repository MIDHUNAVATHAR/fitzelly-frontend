import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
    ArrowLeft, Edit3, Save, X, Loader2,
    Mail, Phone, Calendar,
    IndianRupee, Tag
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getTrainerById, updateTrainer } from "../../../api/gym-trainers.api";
import type { Trainer } from "../../../api/gym-trainers.api";
import DateInput from "../../../components/ui/DateInput";
import { useDateFormat } from "../../../hooks/useDateFormat";
import ImageCropperModal from "../../../components/ui/ImageCropperModal";
import CertificatePreviewModal from "../../../components/ui/CertificatePreviewModal";
import DeleteConfirmModal from "../plans/DeleteConfirmModal";
import { Upload, FileText, Trash2, MapPin, GraduationCap } from 'lucide-react';
import { useImageCropper } from "../../../hooks/useImageCropper";

interface CertificateItem {
    id: string;
    url?: string;
    file?: File;
    type: 'image' | 'pdf';
    name: string;
}

const TrainerProfile: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    // Check if we're on the edit route
    const isEditRoute = location.pathname.endsWith('/edit');

    const [isEditing, setIsEditing] = useState(isEditRoute);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [trainer, setTrainer] = useState<Trainer | null>(null);
    const [formData, setFormData] = useState<Partial<Trainer>>({});
    const { formatToShortMonth: formatDate } = useDateFormat();

    // Certificates state
    const [certificates, setCertificates] = useState<CertificateItem[]>([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [certToDelete, setCertToDelete] = useState<string | null>(null);
    const [previewCert, setPreviewCert] = useState<CertificateItem | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleCroppedImage = async (croppedImageBlob: Blob) => {
        const fileName = `certificate-${Date.now()}.jpg`;
        const file = new File([croppedImageBlob], fileName, { type: "image/jpeg" });
        setCertificates(prev => [...prev, { id: `new-${Date.now()}`, file, type: 'image', name: file.name }]);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const {
        imageSrc, crop, zoom, isCropping, isUploadingImage, setCrop, setZoom,
        handleFileSelect, handleUploadCroppedImage, onCropComplete, cancelCropping
    } = useImageCropper({
        onCropComplete: handleCroppedImage,
        aspectRatio: 4 / 3
    });

    const loadTrainer = useCallback(async () => {
        if (!id) return;
        try {
            setLoading(true);
            const data = await getTrainerById(id);
            setTrainer(data);
            setFormData(data);

            if (data.certificates && Array.isArray(data.certificates)) {
                setCertificates(data.certificates.map((url: string, i: number) => {
                    const isPdf = url.toLowerCase().endsWith('.pdf');
                    return {
                        id: `existing-${i}`,
                        url,
                        type: isPdf ? 'pdf' : 'image',
                        name: url.split('/').pop() || `Certificate ${i + 1}`
                    };
                }));
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load trainer details");
            navigate('/gym/trainers');
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        loadTrainer();
    }, [loadTrainer]);

    const handleSave = async () => {
        const { fullName, email, phoneNumber } = formData;

        if (!fullName?.trim() || !phoneNumber?.trim() || (!trainer?.isEmailVerified && !email?.trim())) {
            toast.error("Required fields are missing");
            return;
        }

        if (formData.dateOfBirth) {
            const dob = new Date(formData.dateOfBirth);
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
        }

        if (!trainer?.isEmailVerified && email) {
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
            const submitData = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    submitData.append(key, value.toString());
                }
            });

            const existingCerts = certificates.filter(c => c.url).map(c => c.url);
            const newCerts = certificates.filter(c => c.file).map(c => c.file);

            if (existingCerts.length > 0) {
                submitData.append('existingCertificates', JSON.stringify(existingCerts));
            } else {
                submitData.append('existingCertificates', JSON.stringify([]));
            }
            newCerts.forEach(file => { if (file) submitData.append('certificates', file); });

            const updatedTrainer = await updateTrainer(id, submitData);
            if (trainer && updatedTrainer) {
                setTrainer(Object.assign({}, trainer, updatedTrainer) as Trainer);
            }
            setIsEditing(false);
            toast.success("Trainer profile updated successfully");

            // Navigate to view mode (remove /edit)
            navigate(`/gym/trainers/${id}`, { replace: true });
        } catch (error) {
            console.error(error);
            toast.error("Failed to update trainer profile");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData(trainer || {});
        if (trainer?.certificates && Array.isArray(trainer.certificates)) {
            setCertificates(trainer.certificates.map((url: string, i: number) => ({
                id: `existing-${i}`,
                url,
                type: url.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image',
                name: url.split('/').pop() || `Certificate ${i + 1}`
            })));
        } else {
            setCertificates([]);
        }
        setIsEditing(false);
        navigate(`/gym/trainers/${id}`, { replace: true });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            if (file.type === 'application/pdf') {
                setCertificates(prev => [...prev, { id: `new-${Date.now()}`, file, type: 'pdf', name: file.name }]);
                if (fileInputRef.current) fileInputRef.current.value = '';
            } else if (file.type.startsWith('image/')) {
                await handleFileSelect(file);
            }
        }
    };

    const handleDeleteConfirm = () => {
        if (certToDelete) {
            setCertificates(prev => prev.filter(c => c.id !== certToDelete));
            setCertToDelete(null);
        }
        setIsDeleteModalOpen(false);
    };

    const handleBack = () => {
        navigate('/gym/trainers');
    };

    // Removed local formatDate since we use hook

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    if (!trainer) return null;

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
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">Trainer Profile</h1>
                    <p className="text-zinc-400 mt-1 text-sm sm:text-base">
                        {isEditing ? 'Edit trainer information' : 'View trainer information'}
                    </p>
                </div>
            </div>

            {/* Main Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                {/* Header Gradient */}
                <div className="h-20 sm:h-32 bg-gradient-to-r from-purple-900/20 to-zinc-900 relative">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-400/10 via-transparent to-transparent"></div>
                </div>

                <div className="px-4 sm:px-6 pb-6 sm:pb-8 relative">
                    {/* Profile Avatar */}
                    <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 border-4 border-zinc-900 absolute -top-10 sm:-top-14 flex items-center justify-center overflow-hidden shadow-xl">
                        {trainer.profileUrl ? (
                            <img
                                src={trainer.profileUrl}
                                alt={trainer.fullName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23222'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='40' fill='%23333'%3E${trainer.fullName?.charAt(0).toUpperCase() || 'T'}%3C/text%3E%3C/svg%3E`;
                                }}
                            />
                        ) : (
                            <span className="text-3xl sm:text-4xl font-bold text-white/80">
                                {trainer.fullName?.charAt(0).toUpperCase() || 'T'}
                            </span>
                        )}
                    </div>

                    {/* Edit Button (only in view mode) */}
                    <div className="ml-24 sm:ml-32 pt-0 sm:pt-2">
                        {!isEditing && (
                            <div className="flex justify-end mb-3 sm:mb-4">
                                <button
                                    onClick={() => {
                                        setIsEditing(true);
                                        navigate(`/gym/trainers/${id}/edit`, { replace: true });
                                    }}
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
                                <h2 className="text-xl sm:text-2xl font-bold text-white">{trainer.fullName}</h2>
                                <p className="text-zinc-400 text-sm sm:text-base mt-1">
                                    {trainer.specialization || 'Trainer'} • Joined {formatDate(trainer.joinedDate)}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Trainer Details Grid */}
                    <div className="mt-8 sm:mt-10 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
                        {/* Email - Conditional */}
                        <div className="group">
                            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">Email Address</label>
                            {isEditing && !trainer.isEmailVerified ? (
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
                                    <span className="truncate">{trainer.email}</span>
                                    {trainer.isEmailVerified ? (
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
                                    <span className="truncate">{trainer.phoneNumber || 'Not set'}</span>
                                </div>
                            )}
                        </div>


                        {/* Specialization - Editable */}
                        <div className="group">
                            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">Specialization</label>
                            {isEditing ? (
                                <div className="relative">
                                    <Tag className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 absolute left-3 top-2.5 z-10" />
                                    <input
                                        type="text"
                                        name="specialization"
                                        value={formData.specialization || ''}
                                        onChange={handleChange}
                                        className="w-full pl-10 bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-400 transition-colors text-sm sm:text-base"
                                        placeholder="e.g. Yoga, HIIT, Cardio"
                                    />
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 text-zinc-300 p-3 bg-zinc-950/50 rounded-lg border border-zinc-800/50 text-sm sm:text-base">
                                    <Tag className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 flex-shrink-0" />
                                    <span className="truncate">{trainer.specialization || 'Not specified'}</span>
                                </div>
                            )}
                        </div>

                        {/* Salary - Editable */}
                        <div className="group">
                            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">Salary</label>
                            {isEditing ? (
                                <div className="relative">
                                    <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 absolute left-3 top-2.5 z-10" />
                                    <input
                                        type="number"
                                        name="salary"
                                        value={formData.salary || ''}
                                        onChange={handleChange}
                                        className="w-full pl-10 bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-400 transition-colors text-sm sm:text-base"
                                        placeholder="Enter salary"
                                    />
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 text-zinc-300 p-3 bg-zinc-950/50 rounded-lg border border-zinc-800/50 text-sm sm:text-base">
                                    <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 flex-shrink-0" />
                                    <span className="truncate">{trainer.salary ? `₹${Number(trainer.salary).toLocaleString()}` : 'Not set'}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Additional Info Card */}
            <div className="mt-6 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Additional Information</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Joined Date (Read-only) */}
                    <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50">
                        <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-4 h-4 text-emerald-400" />
                            <span className="text-sm font-medium text-zinc-500">Joined Date</span>
                        </div>
                        <p className="text-white text-lg">{formatDate(trainer.joinedDate)}</p>
                    </div>

                    {/* Date of Birth - Editable */}
                    <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50">
                        <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-4 h-4 text-emerald-400" />
                            <span className="text-sm font-medium text-zinc-500">Date of Birth</span>
                        </div>
                        {isEditing ? (
                            <DateInput
                                name="dateOfBirth"
                                value={formData.dateOfBirth ? formData.dateOfBirth.split('T')[0] : ''}
                                onChange={handleChange}
                                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-emerald-400 transition-colors text-base mt-0.5"
                            />
                        ) : (
                            <p className="text-white text-lg">{formatDate(trainer.dateOfBirth)}</p>
                        )}
                    </div>

                    {/* Qualification */}
                    <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50">
                        <div className="flex items-center gap-2 mb-2">
                            <GraduationCap className="w-4 h-4 text-emerald-400" />
                            <span className="text-sm font-medium text-zinc-500">Qualification</span>
                        </div>
                        {isEditing ? (
                            <input
                                name="qualification"
                                value={formData.qualification || ''}
                                onChange={handleChange}
                                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-emerald-400 transition-colors text-base mt-0.5"
                                placeholder="Enter qualification"
                            />
                        ) : (
                            <p className="text-white text-lg">{trainer.qualification || 'Not specified'}</p>
                        )}
                    </div>

                    {/* Address */}
                    <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50">
                        <div className="flex items-center gap-2 mb-2">
                            <MapPin className="w-4 h-4 text-emerald-400" />
                            <span className="text-sm font-medium text-zinc-500">Address</span>
                        </div>
                        {isEditing ? (
                            <textarea
                                name="address"
                                value={formData.address || ''}
                                onChange={handleChange}
                                rows={2}
                                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-emerald-400 transition-colors text-base mt-0.5 resize-none"
                                placeholder="Enter address"
                            />
                        ) : (
                            <p className="text-white text-lg">{trainer.address || 'Not specified'}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Certificates Card */}
            <div className="mt-6 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Certificates</h3>
                    {isEditing && (
                        <div>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".jpg,.jpeg,.png,.pdf" className="hidden" />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 transition rounded-lg text-white text-sm"
                            >
                                <Upload className="w-4 h-4" />
                                Add
                            </button>
                        </div>
                    )}
                </div>

                {certificates.length === 0 ? (
                    <div className="text-center py-8 text-zinc-500 text-sm">
                        No certificates uploaded yet.
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {certificates.map((cert) => (
                            <div key={cert.id} className="relative group bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden flex flex-col cursor-pointer transition-shadow hover:shadow-lg" onClick={() => setPreviewCert(cert)}>
                                {isEditing && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setCertToDelete(cert.id);
                                            setIsDeleteModalOpen(true);
                                        }}
                                        className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-red-500/80 rounded-md text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}

                                <div className="h-32 w-full flex items-center justify-center bg-zinc-950 border-b border-zinc-800">
                                    {cert.type === 'pdf' ? (
                                        <FileText className="w-12 h-12 text-zinc-500" />
                                    ) : (
                                        <img
                                            src={cert.url || (cert.file ? URL.createObjectURL(cert.file) : '')}
                                            alt={cert.name}
                                            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                                        />
                                    )}
                                </div>
                                <div className="p-2 truncate text-xs text-zinc-300 text-center font-medium bg-zinc-800">
                                    {cert.name}
                                </div>
                            </div>
                        ))}
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
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-400 text-black font-semibold rounded-lg text-sm hover:bg-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Changes
                    </button>
                </div>
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
                    onCancel={() => {
                        cancelCropping();
                        if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    title="Crop Certificate"
                    aspectRatio={4 / 3}
                />
            )}

            {isDeleteModalOpen && (
                <DeleteConfirmModal
                    isOpen={isDeleteModalOpen}
                    itemName="this certificate"
                    onClose={() => {
                        setIsDeleteModalOpen(false);
                        setCertToDelete(null);
                    }}
                    onConfirm={handleDeleteConfirm}
                />
            )}

            {previewCert && (
                <CertificatePreviewModal
                    fileUrl={previewCert.url || (previewCert.file ? URL.createObjectURL(previewCert.file) : '')}
                    fileType={previewCert.type}
                    fileName={previewCert.name}
                    onClose={() => setPreviewCert(null)}
                />
            )}
        </div>
    );
};

export default TrainerProfile;