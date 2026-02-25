import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, AlignLeft, Info } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getClientProfile, getGymProfileById, type GymProfile } from '../../../api/client-profile.api';

const GymDetailsPage: React.FC = () => {
    const [gymProfile, setGymProfile] = useState<GymProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGymDetails = async () => {
            try {
                // First get the client's gymId from their profile
                const clientProfile = await getClientProfile();
                if (clientProfile.gymId) {
                    const profileData = await getGymProfileById(clientProfile.gymId);
                    setGymProfile(profileData);
                } else {
                    toast.error("Could not determine your associated gym.");
                }
            } catch (error: any) {
                console.error("Failed to fetch gym details", error);
                toast.error(error.response?.data?.message || "Failed to load gym details");
            } finally {
                setLoading(false);
            }
        };

        fetchGymDetails();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center w-full h-[60vh]">
                <div className="w-8 h-8 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!gymProfile) {
        return (
            <div className="flex flex-col items-center justify-center w-full h-[60vh] text-zinc-400">
                <Info className="w-12 h-12 mb-4 opacity-50" />
                <p>No gym details available.</p>
            </div>
        );
    }

    return (
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Gym Details</h1>
                <p className="text-zinc-400 mt-1 text-sm sm:text-base">View your gym's official information and contact details.</p>
            </div>

            <div className="space-y-6 pb-10">
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                    {/* Banner */}
                    <div className="h-24 sm:h-32 bg-gradient-to-r from-emerald-900/30 to-zinc-900 relative">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-400/10 via-transparent to-transparent"></div>
                    </div>

                    <div className="px-4 sm:px-8 pb-6 sm:pb-8 relative">
                        {/* Gym Logo */}
                        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl bg-zinc-800 border-4 border-zinc-900 absolute -top-12 sm:-top-16 flex items-center justify-center overflow-hidden shadow-xl">
                            {gymProfile.logoUrl ? (
                                <img
                                    src={gymProfile.logoUrl}
                                    alt={gymProfile.gymName || "Gym Logo"}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-3xl font-bold text-zinc-600">🏢</span>
                            )}
                        </div>

                        <div className="ml-28 sm:ml-40 pt-2 sm:pt-4">
                            <div className="mb-6">
                                <h2 className="text-2xl sm:text-3xl font-bold text-white">{gymProfile.gymName || "Unnamed Gym"}</h2>
                                {gymProfile.caption && (
                                    <p className="text-emerald-400/90 font-medium text-sm sm:text-base mt-1">{gymProfile.caption}</p>
                                )}
                            </div>
                        </div>

                        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Email */}
                            <div className="group">
                                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">Email Address</label>
                                <div className="flex items-center gap-3 text-zinc-300 p-3 bg-zinc-950/50 rounded-lg border border-zinc-800/80">
                                    <Mail className="w-5 h-5 text-emerald-400/70" />
                                    <span className="truncate">{gymProfile.email || "N/A"}</span>
                                </div>
                            </div>

                            {/* Phone */}
                            <div className="group">
                                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">Contact Number</label>
                                <div className="flex items-center gap-3 text-zinc-300 p-3 bg-zinc-950/50 rounded-lg border border-zinc-800/80">
                                    <Phone className="w-5 h-5 text-emerald-400/70" />
                                    <span className="truncate">{gymProfile.phoneNumber || "N/A"}</span>
                                </div>
                            </div>

                            {/* Address */}
                            <div className="group md:col-span-2">
                                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">Address</label>
                                <div className="flex items-start gap-3 text-zinc-300 p-3 bg-zinc-950/50 rounded-lg border border-zinc-800/80">
                                    <MapPin className="w-5 h-5 text-emerald-400/70 mt-0.5 flex-shrink-0" />
                                    <span className="whitespace-pre-wrap">{gymProfile.address || "No address provided"}</span>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="group md:col-span-2">
                                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">Description</label>
                                <div className="flex items-start gap-3 text-zinc-300 p-3 bg-zinc-950/50 rounded-lg border border-zinc-800/80 min-h-[100px]">
                                    <AlignLeft className="w-5 h-5 text-emerald-400/70 mt-0.5 flex-shrink-0" />
                                    <p className="whitespace-pre-wrap leading-relaxed">{gymProfile.description || "No description provided"}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GymDetailsPage;
