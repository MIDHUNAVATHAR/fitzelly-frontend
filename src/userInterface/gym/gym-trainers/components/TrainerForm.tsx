import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import type { Trainer } from "../../../../api/gym-trainers.api";

interface TrainerFormProps {
    initialData?: Partial<Trainer>;
    onSubmit: (data: Partial<Trainer>) => void;
    isLoading?: boolean;
    title: string;
}

const TrainerForm: React.FC<TrainerFormProps> = ({ initialData, onSubmit, isLoading, title }) => {
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors } } = useForm<Partial<Trainer>>({
        defaultValues: {
            ...initialData,
            dateOfBirth: initialData?.dateOfBirth
                ? new Date(initialData.dateOfBirth).toISOString().split('T')[0]
                : undefined
        },
    });

    return (
        <div className="w-full p-6 bg-zinc-900 border border-zinc-800 rounded-xl">
            <div className="flex items-center mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="mr-4 p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-bold text-white">{title}</h2>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                        <input
                            type="date"
                            {...register('dateOfBirth')}
                            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                    </div>

                </div>

                {/* Submit */}
                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-2 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
                    >
                        {isLoading ? 'Saving...' : 'Save Trainer'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TrainerForm;
