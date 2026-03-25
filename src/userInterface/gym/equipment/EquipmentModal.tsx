import React, { useState, useEffect, useRef } from "react";
import { X, Upload, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "react-hot-toast";
import { addEquipment, updateEquipment } from "../../../api/equipment.api";
import type { Equipment } from "../../../api/equipment.api";
import { getPlans } from "../../../api/plan.api";
import type { Plan } from "../../../api/plan.api";
import ImageCropperModal from "../../../components/ui/ImageCropperModal";
import { useImageCropper } from "../../../hooks/useImageCropper";

interface EquipmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    equipment?: Equipment | null;
    onSave: () => void;
}

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const EquipmentModal: React.FC<EquipmentModalProps> = ({ isOpen, onClose, equipment, onSave }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);
    const [plans, setPlans] = useState<Plan[]>([]);

    // Image handling
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(equipment?.image || null);

    const handleCroppedImage = async (croppedImageBlob: Blob) => {
        const fileName = `equipment-${Date.now()}.jpg`;
        const file = new File([croppedImageBlob], fileName, { type: "image/jpeg" });
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
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
        aspectRatio: 4 / 3
    });

    const [form, setForm] = useState({
        name: equipment?.name || "",
        description: equipment?.description || "",
        availableDays: equipment?.availableDays || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        availableFrom: equipment?.availableFrom || "06:00",
        availableTo: equipment?.availableTo || "22:00",
        allowedPlans: equipment?.allowedPlans || [],
        capacity: equipment?.capacity ?? 1,
        slotIntervalMinutes: equipment?.slotIntervalMinutes ?? 30,
        isActive: equipment ? equipment.isActive : true,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        getPlans(1, 100, '').then(fetchedPlans => {
            setPlans(fetchedPlans.plans);
            if (!equipment) {
                setForm(prev => ({
                    ...prev,
                    allowedPlans: fetchedPlans.plans.map(p => p.id)
                }));
            }
        }).catch(() => toast.error("Failed to load plans"));
    }, [equipment]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            if (!file.type.startsWith('image/')) {
                toast.error("Please select an image file");
                return;
            }
            await handleFileSelect(file);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const toggleDay = (day: string) => {
        setForm(prev => {
            if (prev.availableDays.includes(day)) {
                return { ...prev, availableDays: prev.availableDays.filter(d => d !== day) };
            }
            return { ...prev, availableDays: [...prev.availableDays, day] };
        });
    };

    const togglePlan = (planId: string) => {
        setForm(prev => {
            if (prev.allowedPlans.includes(planId)) {
                return { ...prev, allowedPlans: prev.allowedPlans.filter(p => p !== planId) };
            }
            return { ...prev, allowedPlans: [...prev.allowedPlans, planId] };
        });
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!form.name.trim()) newErrors.name = "Name is required";
        if (form.availableFrom >= form.availableTo) {
            newErrors.time = "Available From must be before Available To";
        }
        if (form.capacity < 1) newErrors.capacity = "Capacity must be at least 1";
        if (form.slotIntervalMinutes < 5) newErrors.slotIntervalMinutes = "Minimum slot is 5 min";
        if (form.availableDays.length === 0) newErrors.availableDays = "Select at least one day";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', form.name);
            formData.append('description', form.description);
            formData.append('availableDays', JSON.stringify(form.availableDays));
            formData.append('availableFrom', form.availableFrom);
            formData.append('availableTo', form.availableTo);
            formData.append('allowedPlans', JSON.stringify(form.allowedPlans));
            formData.append('capacity', String(form.capacity));
            formData.append('slotIntervalMinutes', String(form.slotIntervalMinutes));
            formData.append('isActive', String(form.isActive));

            if (imageFile) {
                formData.append('image', imageFile);
            }

            if (equipment?.id) {
                await updateEquipment(equipment.id, formData);
                toast.success("Equipment updated");
            } else {
                await addEquipment(formData);
                toast.success("Equipment added");
            }
            onSave();
        } catch {
            toast.error(equipment ? "Failed to update equipment" : "Failed to add equipment");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-3xl shadow-xl flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b border-zinc-800">
                    <h2 className="text-xl font-bold text-white">
                        {equipment ? "Edit Equipment" : "Add Equipment"}
                    </h2>
                    <button onClick={onClose} className="text-zinc-400 hover:text-white transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar">
                    <form id="equipment-form" onSubmit={handleSubmit} className="space-y-6">
                        {/* Image Upload */}
                        <div className="flex flex-col items-center sm:items-start">
                            <label className="block text-sm font-medium text-zinc-300 mb-2">Image</label>
                            <div className="flex items-end gap-4">
                                <div className="w-24 h-24 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <ImageIcon className="w-10 h-10 text-zinc-600" />
                                    )}
                                </div>
                                <div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={handleFileChange}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-sm transition"
                                    >
                                        <Upload className="w-4 h-4" /> Upload
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Basic Details */}
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-1">Equipment Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    className="w-full bg-zinc-800 text-white rounded-lg p-3 border border-zinc-700 focus:border-emerald-500 focus:outline-none"
                                    placeholder="e.g. Squat Rack"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                />
                                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-1">Description</label>
                            <textarea
                                className="w-full bg-zinc-800 text-white rounded-lg p-3 border border-zinc-700 focus:border-emerald-500 focus:outline-none min-h-[80px]"
                                placeholder="Details about this equipment..."
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                            />
                        </div>

                        {/* Availability */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">Available Days <span className="text-red-500">*</span></label>
                            <div className="flex flex-wrap gap-2">
                                {DAYS_OF_WEEK.map(day => (
                                    <button
                                        key={day}
                                        type="button"
                                        onClick={() => toggleDay(day)}
                                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors border ${form.availableDays.includes(day)
                                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                                            : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700'
                                            }`}
                                    >
                                        {day.substring(0, 3)}
                                    </button>
                                ))}
                            </div>
                            {errors.availableDays && <p className="text-red-400 text-xs mt-1">{errors.availableDays}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-1">Available From</label>
                                <input
                                    type="time"
                                    className="w-full bg-zinc-800 text-white rounded-lg p-3 border border-zinc-700 focus:border-emerald-500 focus:outline-none"
                                    value={form.availableFrom}
                                    onChange={e => setForm({ ...form, availableFrom: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-1">Available To</label>
                                <input
                                    type="time"
                                    className="w-full bg-zinc-800 text-white rounded-lg p-3 border border-zinc-700 focus:border-emerald-500 focus:outline-none"
                                    value={form.availableTo}
                                    onChange={e => setForm({ ...form, availableTo: e.target.value })}
                                />
                            </div>
                            {errors.time && <p className="col-span-full text-red-400 text-xs">{errors.time}</p>}
                        </div>

                        {/* Config Rules */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-zinc-800 pt-6">
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-1">Slot Interval (mins)</label>
                                <input
                                    type="number"
                                    className="w-full bg-zinc-800 text-white rounded-lg p-3 border border-zinc-700 focus:border-emerald-500 focus:outline-none"
                                    value={form.slotIntervalMinutes}
                                    onChange={e => setForm({ ...form, slotIntervalMinutes: parseInt(e.target.value) || 0 })}
                                />
                                {errors.slotIntervalMinutes && <p className="text-red-400 text-xs mt-1">{errors.slotIntervalMinutes}</p>}
                            </div>
 
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-1">Capacity (simultaneous)</label>
                                <input
                                    type="number"
                                    className="w-full bg-zinc-800 text-white rounded-lg p-3 border border-zinc-700 focus:border-emerald-500 focus:outline-none"
                                    value={form.capacity}
                                    onChange={e => setForm({ ...form, capacity: parseInt(e.target.value) || 0 })}
                                />
                                {errors.capacity && <p className="text-red-400 text-xs mt-1">{errors.capacity}</p>}
                            </div>
                        </div>

                        {/* Allowed Plans */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">Allowed Memberships</label>
                            {plans.length > 0 ? (
                                <div className="max-h-32 overflow-y-auto custom-scrollbar flex flex-wrap gap-2 border border-zinc-800 rounded-lg p-3 bg-zinc-900/50">
                                    {plans.map(plan => (
                                        <button
                                            key={plan.id}
                                            type="button"
                                            onClick={() => togglePlan(plan.id)}
                                            className={`px-3 py-1.5 rounded-lg text-sm transition-colors border ${form.allowedPlans.includes(plan.id)
                                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                                                : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700'
                                                }`}
                                        >
                                            {plan.planName}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-zinc-500 bg-zinc-800/50 p-3 rounded text-center">No plans created yet.</p>
                            )}
                        </div>

                        {/* Active Toggle */}
                        <div className="flex items-center gap-3 py-2">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={form.isActive}
                                    onChange={e => setForm({ ...form, isActive: e.target.checked })}
                                />
                                <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                            </label>
                            <span className="text-sm font-medium text-zinc-300">Active</span>
                        </div>
                    </form>
                </div>

                <div className="p-6 border-t border-zinc-800 flex justify-end gap-3 mt-auto">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2 rounded-lg font-medium text-white hover:bg-zinc-800 transition"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="equipment-form"
                        disabled={loading}
                        className="px-6 py-2 rounded-lg font-bold bg-emerald-500 hover:bg-emerald-600 text-white transition disabled:opacity-50 flex flex-center gap-2"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Configuration"}
                    </button>
                </div>
            </div>

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
                    title="Adjust Equipment Image"
                    aspectRatio={4 / 3}
                />
            )}
        </div>
    );
};

export default EquipmentModal;
