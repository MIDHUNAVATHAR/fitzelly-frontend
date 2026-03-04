import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Calendar } from 'lucide-react';
import type { CreatePlanDTO, UpdatePlanDTO, Plan } from '../../../api/plan.api';

interface PlanFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreatePlanDTO | UpdatePlanDTO) => Promise<void>;
    initialData?: Plan | null;
}

const PlanFormModal: React.FC<PlanFormModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
    const isEditMode = !!initialData;
    const { register, handleSubmit, formState: { errors }, watch, reset, setValue } = useForm<CreatePlanDTO>();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const watchPlanType = watch('planType', isEditMode ? initialData.planType : 'CATEGORY_BASED');

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setValue('planName', initialData.planName);
                setValue('planType', initialData.planType);
                setValue('validity', initialData.validity);
                setValue('price', initialData.price);
                setValue('windowPeriod', initialData.windowPeriod || 0);
                setValue('description', initialData.description || '');
            } else {
                reset({
                    planName: '',
                    planType: 'CATEGORY_BASED',
                    validity: undefined,
                    price: undefined,
                    windowPeriod: 0,
                    description: ''
                }); // default value for new form
            }
        }
    }, [isOpen, initialData, setValue, reset]);

    const submitHandler = async (data: CreatePlanDTO) => {
        setIsSubmitting(true);
        try {
            // Ensure windowPeriod is 0 if CATEGORY_BASED
            if (data.planType === 'CATEGORY_BASED') {
                data.windowPeriod = 0;
            }
            await onSubmit(data);
            reset({
                planName: '',
                planType: 'CATEGORY_BASED',
                validity: undefined,
                price: undefined,
                windowPeriod: 0,
                description: ''
            });
            onClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={!isSubmitting ? onClose : undefined} />

            <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-zinc-800/50 flex-shrink-0">
                    <h2 className="text-xl font-semibold text-white">
                        {isEditMode ? 'Edit Plan' : 'Create New Plan'}
                    </h2>
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(submitHandler)} className="flex-1 overflow-y-auto p-6 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                        {/* Plan Name */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-zinc-300 mb-2">Plan Name</label>
                            <input
                                {...register('planName', { required: 'Plan name is required' })}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
                                placeholder="e.g. Premium Monthly Plan"
                            />
                            {errors.planName && <span className="text-red-400 text-sm mt-1">{errors.planName.message}</span>}
                        </div>

                        {/* Plan Type */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">Plan Type</label>
                            <select
                                {...register('planType', { required: 'Plan type is required' })}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors appearance-none"
                            >
                                <option value="CATEGORY_BASED">Category Based (Months)</option>
                                <option value="DAY_BASED">Day Based (Days)</option>
                            </select>
                        </div>

                        {/* Validity */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">Validity Value</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    {...register('validity', {
                                        required: 'Validity is required',
                                        valueAsNumber: true,
                                        min: { value: 1, message: 'Minimum validity is 1' }
                                    })}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                                    placeholder={watchPlanType === 'CATEGORY_BASED' ? 'Enter number of months' : 'Enter number of days'}
                                />
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                            </div>
                            {errors.validity && <span className="text-red-400 text-sm mt-1 block">{errors.validity.message}</span>}
                            <p className="text-emerald-400/80 text-xs mt-2 font-medium">
                                {watchPlanType === 'CATEGORY_BASED' ? "Validity will be considered in Months" : "Validity will be considered in Days"}
                            </p>
                        </div>

                        {/* Plan Fee */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">Plan Fee</label>
                            <input
                                type="number"
                                {...register('price', {
                                    required: 'Plan fee is required',
                                    valueAsNumber: true,
                                    min: { value: 0, message: 'Minimum fee cannot be negative' }
                                })}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                                placeholder="Enter plan fee amount"
                            />
                            {errors.price && <span className="text-red-400 text-sm mt-1">{errors.price.message}</span>}
                        </div>

                        {/* Window Period (Only for DAY_BASED) */}
                        {watchPlanType === 'DAY_BASED' && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <label className="block text-sm font-medium text-zinc-300 mb-2">Window Period (Days)</label>
                                <input
                                    type="number"
                                    {...register('windowPeriod', {
                                        required: 'Window period is required',
                                        valueAsNumber: true,
                                        min: { value: 0, message: 'Minimum window period is 0' }
                                    })}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                                    placeholder="Enter window period in days"
                                />
                                {errors.windowPeriod && <span className="text-red-400 text-sm mt-1">{errors.windowPeriod.message}</span>}
                                <p className="text-zinc-500 text-xs mt-2 font-medium">
                                    Extra days allowed for clients to renew their plan.
                                </p>
                            </div>
                        )}

                        {/* Description */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-zinc-300 mb-2">Description <span className="text-zinc-500 text-xs font-normal">(Optional)</span></label>
                            <textarea
                                {...register('description')}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                                placeholder="Add any specific details here..."
                                rows={2}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-zinc-800/50 mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-2.5 rounded-lg border border-zinc-700 text-zinc-300 font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                isEditMode ? 'Update Plan' : 'Create Plan'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PlanFormModal;
