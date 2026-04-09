import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  Clock, 
  IndianRupee, 
  TrendingUp, 
  Building2,
  ArrowRight
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area 
} from 'recharts';
import { getSuperAdminDashboard } from '../../../api/analytics.api';
import type { SuperAdminDashboardMetrics } from '../../../api/analytics.api';
import toast from 'react-hot-toast';

const DashboardHome: React.FC = () => {
    const [data, setData] = useState<SuperAdminDashboardMetrics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const result = await getSuperAdminDashboard();
                setData(result);
            } catch (error) {
                toast.error("Failed to fetch dashboard data");
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    if (!data) return null;

    const stats = [
        { label: 'Total Gyms', value: data.totalGyms, icon: Building2, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { label: 'Active Gyms', value: data.activeGyms, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
        { label: 'Pending Approvals', value: data.pendingGyms, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-500/10' },
        { label: 'Total Revenue', value: `₹${data.totalRevenue.toLocaleString()}`, icon: IndianRupee, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500 p-4">
            {/* Header */}
            <div>
                <motion.h1 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl font-bold text-white tracking-tight"
                >
                    Platform Overview
                </motion.h1>
                <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-zinc-400 mt-1"
                >
                    Real-time performance metrics and platform growth tracking.
                </motion.p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl backdrop-blur-sm"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`${stat.bg} p-3 rounded-xl`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Live</span>
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
                        <p className="text-zinc-400 text-sm font-medium">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Chart */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="lg:col-span-2 bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl backdrop-blur-sm"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-white">Revenue Growth</h3>
                            <p className="text-zinc-400 text-sm">Monthly platform revenue trend</p>
                        </div>
                        <div className="bg-orange-500/10 text-orange-500 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            +12.5% Growth
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.revenueTrend}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                                <XAxis 
                                    dataKey="month" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#71717a', fontSize: 10 }}
                                    dy={10}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#71717a', fontSize: 10 }}
                                />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
                                    itemStyle={{ color: '#f97316' }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="revenue" 
                                    stroke="#f97316" 
                                    strokeWidth={3}
                                    fillOpacity={1} 
                                    fill="url(#colorRevenue)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Recent Registrations */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl backdrop-blur-sm"
                >
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold text-white">Recent Gyms</h3>
                        <button className="text-orange-500 text-xs font-bold hover:underline flex items-center gap-1">
                            View All <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="space-y-6">
                        {data.recentGyms.length > 0 ? (
                            data.recentGyms.map((gym) => (
                                <div key={gym.id} className="flex items-center justify-between group cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 font-bold border border-orange-500/20 group-hover:scale-110 transition-transform">
                                            {gym.name[0]}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-white leading-none group-hover:text-orange-500 transition-colors">{gym.name}</h4>
                                            <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-tighter">
                                                Joined {new Date(gym.registrationDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`text-[10px] uppercase tracking-widest font-black px-2 py-1 rounded-md ${
                                        gym.status === 'Approved' ? 'bg-green-500/10 text-green-500' :
                                        gym.status === 'Pending' ? 'bg-orange-500/10 text-orange-500' :
                                        'bg-red-500/10 text-red-500'
                                    }`}>
                                        {gym.status}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-zinc-500 text-sm text-center py-4 italic">No gym registrations found</p>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default DashboardHome;