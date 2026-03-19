import React, { useState, useEffect } from 'react';
import { getTrainerProfile } from '../../../api/trainer-profile.api';
import AttendanceCard from '../../../components/ui/AttendanceCard';
import { Loader2, AlertCircle } from 'lucide-react';
import { isAxiosError } from 'axios';


const DashboardHome: React.FC = () => {
    const [gymId, setGymId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await getTrainerProfile();
                console.log("trainer data : ", data);

                if (data?.gymId) {

                    setGymId(data.gymId);
                    setError(null);
                } else {
                    setError("No gym assigned to this trainer");
                }
            } catch (error) {
                if (isAxiosError(error)) {
                    console.error("Error fetching trainer profile:", error);
                    setError(error?.message || "Failed to load trainer profile");
                } else {
                    setError("Failed to load trainer profile");
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, []);

    // Show loading state
    if (isLoading) {
        return (
            <div className="w-full h-full p-2">
                <div className="p-12 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col items-center justify-center gap-4">
                    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                    <p className="text-zinc-500 text-sm animate-pulse">Checking records...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full p-2 text-white space-y-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight">Trainer Dashboard</h1>
                <p className="text-zinc-400">Manage your clients and track your daily activities.</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {/* Show error if any */}
                {error && (
                    <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start gap-4">
                        <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="text-lg font-semibold text-red-500">Error</h3>
                            <p className="text-red-400/90">{error}</p>
                        </div>
                    </div>
                )}

                {/* Show attendance card only if gymId exists */}
                {gymId ? (
                    <AttendanceCard gymId={gymId} />
                ) : !error ? (
                    <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-2xl text-center">
                        <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">🏋️</span>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">No Gym Assigned</h3>
                        <p className="text-zinc-500 max-w-md mx-auto">
                            You haven't been assigned to any gym yet. Please contact the gym administrator.
                        </p>
                    </div>
                ) : null}

                {/* Coming soon section */}
                <div className="p-8 bg-zinc-900/50 border border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center">
                        <span className="text-2xl">💪</span>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold">More Trainer tools coming soon</h3>
                        <p className="text-zinc-500 max-w-md mx-auto">
                            Upcoming features include client progress tracking, automatic workout generation, and availability scheduling.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;