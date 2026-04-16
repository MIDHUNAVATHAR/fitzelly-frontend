import React, { useState, useEffect } from 'react';
import { getClientProfile } from '../../../api/client-profile.api';
import AttendanceCard from '../../../components/ui/AttendanceCard';
import { Loader2 } from 'lucide-react';
import TodayWorkoutDashboard from './TodayWorkoutDashboard';

const DashboardHome: React.FC = () => {
    const [gymId, setGymId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await getClientProfile();
                if (data.profile.gymId) {
                    setGymId(data.profile.gymId);
                }
            } catch (error) {
                console.error("Error fetching client profile:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, []);

    return (
        <div className="w-full h-full p-2 text-white space-y-8">
            <div className="flex flex-col gap-1">
                <h1 className="text-4xl font-black tracking-tight text-white mb-1">My Dashboard</h1>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-zinc-500 font-bold text-xs uppercase tracking-[0.2em]">Active Status • Healthy</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-10">
                {isLoading ? (
                    <div className="p-12 bg-zinc-900 border border-zinc-800 rounded-[3rem] flex flex-col items-center justify-center gap-4">
                        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                        <p className="text-zinc-500 font-bold text-sm uppercase tracking-widest">Hydrating Dashboard...</p>
                    </div>
                ) : (
                    <>
                        {gymId && <AttendanceCard gymId={gymId} />}
                        <TodayWorkoutDashboard />
                    </>
                )}
            </div>
        </div>
    );
};

export default DashboardHome;
