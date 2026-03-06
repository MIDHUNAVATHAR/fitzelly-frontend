
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

const PlanFormModal: React.FC<PlanFormModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialData
}) => {

    const isEditMode = !!initialData;

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        reset,
        setValue
    } = useForm<CreatePlanDTO>();

    const [isSubmitting, setIsSubmitting] = useState(false);

    const watchPlanType = watch('planType');

    useEffect(() => {

        if (!isOpen) {
            reset({
                planName: '',
                planType: undefined,
                validity: undefined,
                price: undefined,
                windowPeriod: 0,
                description: ''
            });
            return;
        }

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
                planType: undefined,
                validity: undefined,
                price: undefined,
                windowPeriod: 0,
                description: ''
            });

        }

    }, [isOpen, initialData, setValue, reset]);

    const submitHandler = async (data: CreatePlanDTO) => {

        setIsSubmitting(true);

        try {

            if (data.planType === 'CATEGORY_BASED') {
                data.windowPeriod = 0;
            }

            await onSubmit(data);

            reset();

            onClose();

        } finally {

            setIsSubmitting(false);

        }

    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={!isSubmitting ? onClose : undefined}
            />

            <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-zinc-800">

                    <h2 className="text-xl font-semibold text-white">
                        {isEditMode ? 'Edit Plan' : 'Create New Plan'}
                    </h2>

                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg"
                    >
                        <X className="w-5 h-5" />
                    </button>

                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit(submitHandler)}
                    className="flex-1 overflow-y-auto p-6 space-y-5"
                >

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                        {/* Plan Name */}
                        <div className="md:col-span-2">

                            <label className="block text-sm text-zinc-300 mb-2">
                                Plan Name
                            </label>

                            <input
                                {...register('planName', {
                                    required: 'Plan name is required'
                                })}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white"
                                placeholder="e.g. Premium Monthly Plan"
                            />

                            {errors.planName && (
                                <span className="text-red-400 text-sm">
                                    {errors.planName.message}
                                </span>
                            )}

                        </div>

                        {/* Plan Type */}
                        <div>

                            <label className="block text-sm text-zinc-300 mb-2">
                                Plan Type
                            </label>

                            <select
                                {...register('planType', {
                                    required: 'Plan type is required'
                                })}
                                defaultValue=""
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white"
                            >

                                {!isEditMode && (
                                    <option value="" disabled>
                                        Choose Plan Type
                                    </option>
                                )}

                                <option value="CATEGORY_BASED">
                                    Category Based (Months)
                                </option>

                                <option value="DAY_BASED">
                                    Day Based (Days)
                                </option>

                            </select>

                            {errors.planType && (
                                <span className="text-red-400 text-sm">
                                    {errors.planType.message}
                                </span>
                            )}

                        </div>

                        {/* Validity */}
                        <div>

                            <label className="block text-sm text-zinc-300 mb-2">
                                Validity
                            </label>

                            <div className="relative">

                                <input
                                    type="number"
                                    {...register('validity', {
                                        required: 'Validity is required',
                                        valueAsNumber: true,
                                        min: { value: 1, message: 'Minimum validity is 1' }
                                    })}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-3 text-white"
                                    placeholder={
                                        watchPlanType === 'CATEGORY_BASED'
                                            ? 'Months'
                                            : 'Days'
                                    }
                                />

                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />

                            </div>

                            {watchPlanType && (
                                <p className="text-xs text-amber-400/90 mt-1.5 font-medium">
                                    * Validity is considered as {watchPlanType === 'CATEGORY_BASED' ? 'months' : 'days'}
                                </p>
                            )}

                            {errors.validity && (
                                <span className="text-red-400 text-sm">
                                    {errors.validity.message}
                                </span>
                            )}

                        </div>

                        {/* Price */}
                        <div>

                            <label className="block text-sm text-zinc-300 mb-2">
                                Plan Fee
                            </label>

                            <input
                                type="number"
                                {...register('price', {
                                    required: 'Plan fee is required',
                                    valueAsNumber: true,
                                    min: { value: 0, message: 'Price cannot be negative' }
                                })}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white"
                                placeholder="Enter price"
                            />

                            {errors.price && (
                                <span className="text-red-400 text-sm">
                                    {errors.price.message}
                                </span>
                            )}

                        </div>

                        {/* Window Period */}
                        {watchPlanType === 'DAY_BASED' && (

                            <div>

                                <label className="block text-sm text-zinc-300 mb-2">
                                    Window Period (Days)
                                </label>

                                <input
                                    type="number"
                                    {...register('windowPeriod', {
                                        required: 'Window period is required',
                                        valueAsNumber: true,
                                        min: { value: 0, message: 'Minimum is 0' }
                                    })}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white"
                                />

                                <p className="text-xs text-amber-400/90 mt-1.5 font-medium">
                                    * Window period is in days
                                </p>

                                {errors.windowPeriod && (
                                    <span className="text-red-400 text-sm">
                                        {errors.windowPeriod.message}
                                    </span>
                                )}

                            </div>

                        )}

                        {/* Description */}
                        <div className="md:col-span-2">

                            <label className="block text-sm text-zinc-300 mb-2">
                                Description (Optional)
                            </label>

                            <textarea
                                {...register('description')}
                                rows={2}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white resize-none"
                            />

                        </div>

                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-zinc-800">

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="flex-1 border border-zinc-700 text-zinc-300 rounded-lg py-2"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg py-2"
                        >
                            {isSubmitting
                                ? 'Saving...'
                                : isEditMode
                                    ? 'Update Plan'
                                    : 'Create Plan'}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
};

export default PlanFormModal;