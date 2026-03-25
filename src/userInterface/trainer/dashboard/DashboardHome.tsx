import React, { useState, useEffect } from 'react';
import {
    Users,
    Wallet,
    Calendar,
    Loader2,
    AlertCircle,
    ArrowUpRight,
    TrendingUp,
    Activity as ActivityIcon,
    UserPlus,
    Clock
} from 'lucide-react';
import { getTrainerProfile } from '../../../api/trainer-profile.api';
import { getAssignedClients } from '../../../api/trainer-clients.api';
import { getTrainerEarnings } from '../../../api/trainer-payout.api';
import AttendanceCard from '../../../components/ui/AttendanceCard';
import { getYearlyAttendanceCount } from '../../../api/attendance.api';
import { isAxiosError } from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const DashboardHome: React.FC = () => {
    const navigate = useNavigate();
    const [gymId, setGymId] = useState<string | null>(null);
    const [trainerName, setTrainerName] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [recentClients, setRecentClients] = useState<any[]>([]);
    const [stats, setStats] = useState({
        clientCount: 0,
        totalEarnings: 0,
        recentPayouts: 0,
        sessionCount: 0
    });
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setIsLoading(true);
                const profile = await getTrainerProfile();
                setTrainerName(profile.fullName || '');

                if (profile?.gymId) {
                    setGymId(profile.gymId);

                    // Fetch other stats in parallel with safer error handling
                    const currentYear = new Date().getFullYear();
                    const [clientsRes, earningsRes, sessionsRes] = await Promise.allSettled([
                        getAssignedClients(1, 5, ''),
                        getTrainerEarnings(1, 100),
                        getYearlyAttendanceCount(currentYear)
                    ]);

                    let cCount = 0;
                    let tEarnings = 0;
                    let pCount = 0;
                    let rClients: any[] = [];
                    let sCount = 0;

                    if (clientsRes.status === 'fulfilled') {
                        cCount = clientsRes.value.totalItems || 0;
                        rClients = clientsRes.value.data.clients || [];
                        setRecentClients(rClients);
                    }

                    if (earningsRes.status === 'fulfilled') {
                        const payouts = earningsRes.value?.data?.payouts || [];
                        tEarnings = payouts.reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0);
                        pCount = payouts.length;
                    }

                    if (sessionsRes.status === 'fulfilled') {
                        sCount = sessionsRes.value.data || 0;
                    }

                    setStats({
                        clientCount: cCount,
                        totalEarnings: tEarnings,
                        recentPayouts: pCount,
                        sessionCount: sCount
                    });

                    setError(null);
                } else {
                    setError("No gym assigned to this trainer");
                }
            } catch (error) {
                if (isAxiosError(error)) {
                    setError(error?.message || "Failed to load dashboard data");
                } else {
                    setError("An unexpected error occurred");
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (isLoading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
                <p className="mt-4 text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Preparing your dashboard...</p>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8 text-white min-h-full">
            {/* Greeting Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent uppercase">
                        Trainer Dashboard
                    </h1>
                    <p className="text-zinc-500 text-sm font-medium tracking-wide">
                        Welcome back, <span className="text-emerald-400 font-bold">{trainerName}</span>. Manage your fitness empire.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center gap-2 shadow-xl">
                        <Clock size={14} className="text-zinc-500" />
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{format(new Date(), 'EEEE, do MMMM')}</span>
                    </div>
                    <div className="px-3 py-1 bg-emerald-400/10 border border-emerald-400/20 rounded-full flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Active</span>
                    </div>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="p-4 bg-red-400/10 border border-red-400/20 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                    <AlertCircle className="text-red-400" size={20} />
                    <p className="text-red-400 text-sm font-medium">{error}</p>
                </div>
            )}

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                {/* Left Side: Stats and Attendance (3 cols) */}
                <div className="xl:col-span-3 space-y-8">
                    {/* Stats Tiles */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Total Clients Card */}
                        <Link to="/trainer/clients" className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-4 shadow-xl hover:border-emerald-400/50 transition-all group relative overflow-hidden">
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-400/5 rounded-full blur-2xl group-hover:bg-emerald-400/10 transition-all duration-500" />
                            <div className="flex items-center justify-between relative z-10">
                                <div className="w-12 h-12 rounded-xl bg-emerald-400/10 flex items-center justify-center">
                                    <Users className="text-emerald-400" size={24} />
                                </div>
                                <ArrowUpRight className="text-zinc-700 group-hover:text-emerald-400 transition-colors" size={20} />
                            </div>
                            <div className="relative z-10">
                                <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Assigned Clients</p>
                                <h3 className="text-5xl font-black text-white mt-1 uppercase tracking-tight">{stats.clientCount}</h3>
                                <p className="text-[10px] text-zinc-500 font-medium mt-2 flex items-center gap-1 uppercase tracking-tight">
                                    <TrendingUp size={12} className="text-emerald-400" /> High Performance
                                </p>
                            </div>
                        </Link>

                        {/* Total Earnings Card */}
                        <Link to="/trainer/earnings" className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-4 shadow-xl hover:border-blue-400/50 transition-all group relative overflow-hidden">
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-400/5 rounded-full blur-2xl group-hover:bg-blue-400/10 transition-all duration-500" />
                            <div className="flex items-center justify-between relative z-10">
                                <div className="w-12 h-12 rounded-xl bg-blue-400/10 flex items-center justify-center">
                                    <Wallet className="text-blue-400" size={24} />
                                </div>
                                <ArrowUpRight className="text-zinc-700 group-hover:text-blue-400 transition-colors" size={20} />
                            </div>
                            <div className="relative z-10">
                                <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Total Earnings</p>
                                <h3 className="text-5xl font-black text-white mt-1 uppercase tracking-tight">₹{stats.totalEarnings.toLocaleString()}</h3>
                                <p className="text-[10px] text-zinc-500 font-medium mt-2 flex items-center gap-1 uppercase tracking-tight">
                                    <ActivityIcon size={12} className="text-blue-400" /> {stats.recentPayouts} Transactions
                                </p>
                            </div>
                        </Link>

                        {/* Total Sessions Card */}
                        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-4 shadow-xl relative overflow-hidden group">
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-400/5 rounded-full blur-2xl transition-all duration-500 group-hover:bg-purple-400/10" />
                            <div className="flex items-center justify-between relative z-10">
                                <div className="w-12 h-12 rounded-xl bg-purple-400/10 flex items-center justify-center">
                                    <Calendar className="text-purple-400" size={24} />
                                </div>
                                <div className="flex flex-col items-end">
                                    <ActivityIcon className="text-zinc-700 group-hover:text-purple-400 transition-colors" size={20} />
                                    <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-tighter mt-1">Sessions</span>
                                </div>
                            </div>
                            <div className="relative z-10">
                                <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Total Sessions (Year)</p>
                                <h3 className="text-5xl font-black text-white mt-1 uppercase tracking-tight">{stats.sessionCount}</h3>
                                <div className="mt-3 flex items-center gap-2">
                                     <div className="flex-1 bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                                        <div 
                                            className="bg-purple-400 h-full shadow-[0_0_8px_rgba(192,132,252,0.5)] transition-all duration-1000" 
                                            style={{ width: `${Math.min((stats.sessionCount / 300) * 100, 100)}%` }}
                                        />
                                    </div>
                                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-tighter">Goal 300</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Performance Section: Recent Clients */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/20">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-orange-400/10 flex items-center justify-center">
                                    <UserPlus className="text-orange-400" size={20} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">Recently Assigned Clients</h3>
                                    <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-tight">Your newest athletes</p>
                                </div>
                            </div>
                            <Link to="/trainer/clients" className="text-xs font-bold text-zinc-400 hover:text-emerald-400 transition-colors flex items-center gap-1 uppercase tracking-widest">
                                View All <ArrowUpRight size={14} />
                            </Link>
                        </div>
                        <div className="p-0 overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-zinc-950/40 border-b border-zinc-800">
                                        <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Client Name</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Assigned Date</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Status</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800/50">
                                    {recentClients.length > 0 ? (
                                        recentClients.map((client) => (
                                            <tr key={client.id} className="hover:bg-zinc-800/30 transition-all group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-500 uppercase">
                                                            {client.fullName?.[0] || 'U'}
                                                        </div>
                                                        <span className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">{client.fullName}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-xs text-zinc-400 font-medium">Recently</td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-0.5 bg-emerald-400/10 text-emerald-400 text-[10px] font-bold rounded-full uppercase tracking-tighter">Active</span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => navigate(`/trainer/clients/${client.id}`)}
                                                        className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
                                                    >
                                                        <ArrowUpRight size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-10 text-center text-zinc-600 italic text-sm font-medium">
                                                No clients assigned yet. When they appear, they'll show up here.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Side: Quick Attendance Scanner & Tips (1 col) */}
                <div className="space-y-8">
                    {/* Attendance Mini View */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden group">
                        <div className="p-4 border-b border-zinc-800 bg-zinc-950/20 flex items-center justify-between">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Daily Attendance</span>
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        </div>
                        <div className="p-4">
                            {gymId ? (
                                <AttendanceCard gymId={gymId} />
                            ) : (
                                <div className="h-40 bg-zinc-950/30 border border-zinc-800/50 border-dashed rounded-xl flex flex-col items-center justify-center p-6 text-center">
                                    <AlertCircle className="text-zinc-700 mb-2" size={24} />
                                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-tighter italic">No Gym Linked</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Support / Quick Links */}
                    <div className="bg-gradient-to-br from-emerald-400/5 to-transparent border border-zinc-800 p-6 rounded-2xl shadow-xl space-y-4">
                        <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                            <TrendingUp className="text-emerald-400" size={14} /> Quick Performance
                        </h3>
                        <div className="space-y-2">
                            <button className="w-full text-left p-3 rounded-xl bg-zinc-950/40 border border-zinc-800 hover:border-emerald-400/30 transition-all text-xs font-bold text-zinc-400 hover:text-white uppercase tracking-widest"
                                onClick={() => navigate('/trainer/profile')}
                            >
                                Edit Profile
                            </button>
                            <button className="w-full text-left p-3 rounded-xl bg-zinc-950/40 border border-zinc-800 hover:border-emerald-400/30 transition-all text-xs font-bold text-zinc-400 hover:text-white uppercase tracking-widest"
                                onClick={() => navigate('/trainer/clients')}
                            >
                                Manage Workouts
                            </button>
                        </div>
                    </div>

                    {/* Motivation Block */}
                    <div className="relative rounded-2xl overflow-hidden group">
                        <img
                            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=400"
                            alt="Fitness"
                            className="w-full h-48 object-cover brightness-[0.3] group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 p-6 flex flex-col justify-end">
                            <h3 className="text-sm font-black text-white uppercase italic tracking-tighter">"Results start when you do."</h3>
                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">Consistency is the key</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;