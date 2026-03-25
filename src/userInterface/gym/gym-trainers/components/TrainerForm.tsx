import React, { useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, FileText, Trash2 } from 'lucide-react';
import type { Trainer } from "../../../../api/gym-trainers.api";
import DateInput from "../../../../components/ui/DateInput";
import ImageCropperModal from "../../../../components/ui/ImageCropperModal";
import CertificatePreviewModal from "../../../../components/ui/CertificatePreviewModal";
import DeleteConfirmModal from "../../plans/DeleteConfirmModal";
import { useImageCropper } from "../../../../hooks/useImageCropper";

interface TrainerFormProps {
    initialData?: Partial<Trainer>;
    onSubmit: (data: FormData | Partial<Trainer>) => void;
    isLoading?: boolean;
    title: string;
}

interface CertificateItem {
    id: string;
    url?: string;
    file?: File;
    type: 'image' | 'pdf';
    name: string;
}

const TrainerForm: React.FC<TrainerFormProps> = ({ initialData, onSubmit, isLoading, title }) => {
    const navigate = useNavigate();

    const { register, handleSubmit, control, formState: { errors } } = useForm<Partial<Trainer>>({
        defaultValues: {
            ...initialData,
            dateOfBirth: initialData?.dateOfBirth
                ? new Date(initialData.dateOfBirth).toISOString().split('T')[0]
                : undefined,
            qualification: initialData?.qualification || '',
            address: initialData?.address || ''
        },
    });

    // Certificates State
    const [certificates, setCertificates] = useState<CertificateItem[]>(() => {
        if (initialData?.certificates && Array.isArray(initialData.certificates)) {
            return initialData.certificates.map((url, i) => {
                const isPdf = url.toLowerCase().endsWith('.pdf');
                const name = url.split('/').pop() || `Certificate ${i + 1}`;
                return {
                    id: `existing-${i}`,
                    url,
                    type: isPdf ? 'pdf' : 'image',
                    name
                };
            });
        }
        return [];
    });

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [certToDelete, setCertToDelete] = useState<string | null>(null);
    const [previewCert, setPreviewCert] = useState<CertificateItem | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleCroppedImage = async (croppedImageBlob: Blob) => {
        const fileName = `certificate-${Date.now()}.jpg`;
        const file = new File([croppedImageBlob], fileName, { type: "image/jpeg" });
        setCertificates(prev => [...prev, {
            id: `new-${Date.now()}`,
            file,
            type: 'image',
            name: file.name
        }]);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const {
        imageSrc, crop, zoom, isCropping, isUploadingImage, setCrop, setZoom,
        handleFileSelect, handleUploadCroppedImage, onCropComplete, cancelCropping
    } = useImageCropper({
        onCropComplete: handleCroppedImage,
        aspectRatio: 4 / 3
    });

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const isPdf = file.type === 'application/pdf';

            if (isPdf) {
                // PDF direct upload
                setCertificates(prev => [...prev, {
                    id: `new-${Date.now()}`,
                    file,
                    type: 'pdf',
                    name: file.name
                }]);
                if (fileInputRef.current) fileInputRef.current.value = '';
            } else if (file.type.startsWith('image/')) {
                // Image -> cropper
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

    const onSubmitForm = (data: Partial<Trainer>) => {
        const formData = new FormData();

        // Append all text fields
        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                formData.append(key, value.toString());
            }
        });

        // Split certificates into existing URLs and new Files
        const existingCerts = certificates.filter(c => c.url).map(c => c.url);
        const newCerts = certificates.filter(c => c.file).map(c => c.file);

        if (existingCerts.length > 0) {
            formData.append('existingCertificates', JSON.stringify(existingCerts));
        } else {
            // we must send empty array if all deleted
            formData.append('existingCertificates', JSON.stringify([]));
        }

        newCerts.forEach(file => {
            if (file) formData.append('certificates', file);
        });

        onSubmit(formData);
    };

    return (
        <div className="w-full p-6 bg-zinc-900 border border-zinc-800 rounded-xl">
            <div className="flex items-center mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="mr-4 p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
                    type="button"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-bold text-white">{title}</h2>
            </div>

            <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Full Name */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">
                            Full Name
                        </label>
                        <input
                            {...register('fullName', { required: 'Full name is required' })}
                            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                        {errors.fullName && (
                            <span className="text-red-400 text-xs">{errors.fullName.message}</span>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">
                            Email
                        </label>
                        <input
                            {...register('email', {
                                required: 'Email is required',
                                pattern: /^\S+@\S+$/i
                            })}
                            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                        {errors.email && (
                            <span className="text-red-400 text-xs">
                                {errors.email?.message || "Invalid email"}
                            </span>
                        )}
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">
                            Phone Number
                        </label>
                        <input
                            {...register('phoneNumber', { required: 'Phone number is required' })}
                            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                        {errors.phoneNumber && (
                            <span className="text-red-400 text-xs">{errors.phoneNumber.message}</span>
                        )}
                    </div>

                    {/* Salary */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">
                            Salary
                        </label>
                        <input
                            type="number"
                            {...register('salary', { valueAsNumber: true })}
                            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            placeholder="0"
                        />
                        {errors.salary && (
                            <span className="text-red-400 text-xs">{errors.salary.message}</span>
                        )}
                    </div>

                    {/* Specialization */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">
                            Specialization
                        </label>
                        <input
                            {...register('specialization')}
                            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            placeholder="e.g. Yoga, HIIT, Cardio"
                        />
                    </div>

                    {/* DOB */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">
                            Date of Birth
                        </label>
                        <Controller
                            control={control}
                            name="dateOfBirth"
                            render={({ field }) => (
                                <DateInput
                                    {...field}
                                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                />
                            )}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {/* Qualification */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">
                            Qualification
                        </label>
                        <input
                            {...register('qualification')}
                            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            placeholder="e.g. Certified Personal Trainer (CPT)"
                        />
                    </div>

                    {/* Address */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">
                            Address
                        </label>
                        <textarea
                            {...register('address')}
                            rows={3}
                            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
                            placeholder="Trainer's physical address"
                        />
                    </div>

                    {/* Certificates Upload */}
                    <div className="pt-2">
                        <label className="block text-sm font-medium text-zinc-400 mb-2">
                            Certificates (Images or PDF)
                        </label>
                        <input
                            type="file"
                            accept=".jpg,.jpeg,.png,.pdf"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 transition rounded-lg text-white text-sm"
                        >
                            <Upload className="w-4 h-4" />
                            Upload Certificate
                        </button>

                        {/* Certificates Grid */}
                        {certificates.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                                {certificates.map((cert) => (
                                    <div key={cert.id} className="relative group bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden flex flex-col cursor-pointer" onClick={() => setPreviewCert(cert)}>
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

                                        <div className="h-32 w-full flex items-center justify-center bg-zinc-900 border-b border-zinc-800">
                                            {cert.type === 'pdf' ? (
                                                <FileText className="w-12 h-12 text-zinc-500" />
                                            ) : (
                                                <img
                                                    src={cert.url || (cert.file ? URL.createObjectURL(cert.file) : '')}
                                                    alt={cert.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            )}
                                        </div>
                                        <div className="p-2 truncate text-xs text-zinc-300 text-center">
                                            {cert.name}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end pt-4 border-t border-zinc-800 mt-6">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-2 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
                    >
                        {isLoading ? 'Saving...' : 'Save Trainer'}
                    </button>
                </div>
            </form>

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

export default TrainerForm;
