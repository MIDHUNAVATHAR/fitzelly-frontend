import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import type { ClientDTO } from "../../../../api/gym-clients.api"


interface ClientFormProps {
    initialData?: Partial<ClientDTO>;
    onSubmit: (data: Partial<ClientDTO>) => void;
    isLoading?: boolean;
    title: string;
}

interface FormErrors {
    fullName?: string;
    email?: string;
    phoneNumber?: string;
}

const ClientForm: React.FC<ClientFormProps> = ({ initialData, onSubmit, isLoading, title }) => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState<Partial<ClientDTO>>(initialData || {});
    const [errors, setErrors] = useState<FormErrors>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.fullName?.trim()) {
            newErrors.fullName = 'Full name is required';
        }

        if (!formData.email?.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^\S+@\S+$/i.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!formData.phoneNumber?.trim()) {
            newErrors.phoneNumber = 'Phone number is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (validateForm()) {
            onSubmit(formData);
        }
    };

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

            <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Full Name</label>
                        <input
                            name="fullName"
                            value={formData.fullName || ''}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 bg-zinc-800 border rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none ${errors.fullName ? 'border-red-500' : 'border-zinc-700'
                                }`}
                        />
                        {errors.fullName && <span className="text-red-400 text-xs">{errors.fullName}</span>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Email</label>
                        <input
                            name="email"
                            type="email"
                            value={formData.email || ''}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 bg-zinc-800 border rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none ${errors.email ? 'border-red-500' : 'border-zinc-700'
                                }`}
                        />
                        {errors.email && <span className="text-red-400 text-xs">{errors.email}</span>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Phone Number</label>
                        <input
                            name="phoneNumber"
                            value={formData.phoneNumber || ''}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 bg-zinc-800 border rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none ${errors.phoneNumber ? 'border-red-500' : 'border-zinc-700'
                                }`}
                        />
                        {errors.phoneNumber && <span className="text-red-400 text-xs">{errors.phoneNumber}</span>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Date of Birth</label>
                        <input
                            name="dateOfBirth"
                            type="date"
                            value={formData.dateOfBirth || ''}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Emergency Contact</label>
                        <input
                            name="emergencyContact"
                            value={formData.emergencyContact || ''}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Contact Person</label>
                        <input
                            name="contactPerson"
                            value={formData.contactPerson || ''}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-2 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
                    >
                        {isLoading ? 'Saving...' : 'Save Client'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ClientForm;