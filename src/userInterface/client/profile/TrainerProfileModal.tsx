import React, { useEffect, useState } from 'react';
import { X, User, Phone, Mail, Award, CalendarDays, MapPin, Loader2 } from 'lucide-react';
import { getClientAssignedTrainer } from '../../../api/client-profile.api';
import { toast } from 'react-hot-toast';

interface TrainerProfileModalProps {
    trainerId: string;
    onClose: () => void;
}

const TrainerProfileModal: React.FC<TrainerProfileModalProps> = ({ trainerId, onClose }) => {
    const [trainer, setTrainer] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrainer = async () => {
            try {
                const data = await getClientAssignedTrainer(trainerId);
                setTrainer(data);
            } catch (error) {
                console.error("Failed to fetch trainer", error);
                toast.error("Failed to load trainer profile.");
            } finally {
                setLoading(false);
            }
        };
        fetchTrainer();
    }, [trainerId]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-xl flex flex-col max-h-[90vh] shadow-2xl relative">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-zinc-800 bg-zinc-950/50">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <User className="text-emerald-400 w-5 h-5" />
                        Trainer Profile
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-zinc-500 hover:text-white hover:bg-zinc-800 p-2 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mb-4" />
                            <p className="text-zinc-500 text-sm">Loading profile details...</p>
                        </div>
                    ) : trainer ? (
                        <div className="space-y-6">
                            {/* Profile Header section */}
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-zinc-800 flex-shrink-0 bg-zinc-800 relative group">
                                    {trainer.profileUrl ? (
                                        <img
                                            src={trainer.profileUrl}
                                            alt={trainer.fullName}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                                            <span className="text-3xl text-zinc-600">👤</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 text-center sm:text-left">
                                    <h3 className="text-2xl font-bold text-white mb-2">{trainer.fullName}</h3>
                                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-4">
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 rounded-full text-sm font-medium">
                                            <Award className="w-4 h-4" />
                                            {trainer.specialization || "General Fitness"}
                                        </div>
                                        {trainer.joinedDate && (
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-full text-sm font-medium">
                                                <CalendarDays className="w-4 h-4 text-zinc-400" />
                                                Member since: {new Date(trainer.joinedDate).toLocaleDateString('en-GB')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <hr className="border-zinc-800/60" />

                            {/* Info Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                {/* Phone Number */}
                                <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50 flex flex-col gap-1">
                                    <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Contact Phone</span>
                                    <div className="flex items-center gap-2 text-zinc-300">
                                        <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                        <span className="text-sm">{trainer.phoneNumber || "Not available"}</span>
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50 flex flex-col gap-1">
                                    <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Email Address</span>
                                    <div className="flex items-center gap-2 text-zinc-300">
                                        <Mail className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                        <span className="text-sm truncate" title={trainer.email}>{trainer.email || "Not available"}</span>
                                    </div>
                                </div>

                                {/* Address */}
                                {trainer.address && (
                                    <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50 flex flex-col gap-1 sm:col-span-2">
                                        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Address</span>
                                        <div className="flex items-start gap-2 text-zinc-300">
                                            <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                                            <span className="text-sm leading-relaxed">{trainer.address}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Qualification */}
                                {trainer.qualification && (
                                    <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50 flex flex-col gap-1 sm:col-span-2">
                                        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Qualification</span>
                                        <div className="flex items-start gap-2 text-zinc-300">
                                            <Award className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                                            <span className="text-sm leading-relaxed">{trainer.qualification}</span>
                                        </div>
                                    </div>
                                )}

                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-zinc-500 text-sm">Trainer information could not be found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TrainerProfileModal;
