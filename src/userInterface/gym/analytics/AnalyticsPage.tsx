import React, { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Activity, Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getGymAnalytics, type GymAnalyticsData } from '../../../api/analytics.api';

const COLORS = ['#34d399', '#f87171', '#60a5fa', '#fbbf24', '#a78bfa'];

const GymAnalyticsPage: React.FC = () => {
    const [analytics, setAnalytics] = useState<GymAnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const data = await getGymAnalytics();
                setAnalytics(data);
            } catch (error: any) {
                toast.error(error.response?.data?.message || 'Failed to load analytics.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!analytics) return null;

    const { monthlyRevenue, planRevenue, paymentStatus, retention } = analytics;

    // Formatting for charts
    const formatCurrency = (value: number) => `₹${value.toLocaleString()}`;

    // Custom Tooltips
    const RevenueTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-zinc-800 border border-zinc-700 p-3 rounded-lg shadow-xl">
                    <p className="text-zinc-400 text-sm mb-1">{label}</p>
                    <p className="text-emerald-400 font-bold text-lg">{formatCurrency(payload[0].value)}</p>
                </div>
            );
        }
        return null;
    };

    const PieTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-zinc-800 border border-zinc-700 p-3 rounded-lg shadow-xl">
                    <p className="text-white font-medium mb-1">{payload[0].name}</p>
                    <p className="text-emerald-400 font-bold">{formatCurrency(payload[0].value)}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Gym Analytics</h1>
                    <p className="text-zinc-400 text-sm mt-1">Key metrics, revenue growth, and retention insights</p>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors"></div>
                    <div className="flex items-center justify-between mb-4">
                        <Users className="w-6 h-6 text-emerald-400" />
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-emerald-400/10 text-emerald-400">Total</span>
                    </div>
                    <p className="text-zinc-400 text-sm mb-1">Total Clients</p>
                    <h3 className="text-3xl font-bold text-white">{retention.totalClients}</h3>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors"></div>
                    <div className="flex items-center justify-between mb-4">
                        <Activity className="w-6 h-6 text-blue-400" />
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-400/10 text-blue-400">Active</span>
                    </div>
                    <p className="text-zinc-400 text-sm mb-1">Active Memberships</p>
                    <h3 className="text-3xl font-bold text-white">{retention.activeClients}</h3>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-colors"></div>
                    <div className="flex items-center justify-between mb-4">
                        <Wallet className="w-6 h-6 text-amber-400" />
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-amber-400/10 text-amber-400">Collected</span>
                    </div>
                    <p className="text-zinc-400 text-sm mb-1">Paid Revenue (All time)</p>
                    <h3 className="text-3xl font-bold text-white">
                        {formatCurrency(paymentStatus.find(s => s.status === 'Paid')?.value || 0)}
                    </h3>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition-colors"></div>
                    <div className="flex items-center justify-between mb-4">
                        <TrendingDown className="w-6 h-6 text-red-400" />
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-red-400/10 text-red-400">Pending</span>
                    </div>
                    <p className="text-zinc-400 text-sm mb-1">Pending Revenue</p>
                    <h3 className="text-3xl font-bold text-white">
                        {formatCurrency(paymentStatus.find(s => s.status === 'Pending')?.value || 0)}
                    </h3>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Graph: Monthly Revenue */}
                <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-emerald-400" />
                            Revenue Growth (Last 6 Months)
                        </h2>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlyRevenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                                <XAxis dataKey="month" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value / 1000}k`} />
                                <Tooltip content={<RevenueTooltip />} />
                                <Area type="monotone" dataKey="revenue" stroke="#34d399" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Sub Graph: Paid vs Pending */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col">
                    <h2 className="text-lg font-bold text-white mb-6">Payment Status Overview</h2>
                    <div className="flex-1 h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={paymentStatus}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {paymentStatus.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.status === 'Paid' ? '#34d399' : '#f87171'} />
                                    ))}
                                </Pie>
                                <Tooltip content={<PieTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-6 mt-4">
                        {paymentStatus.map((entry) => (
                            <div key={entry.status} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.status === 'Paid' ? '#34d399' : '#f87171' }}></div>
                                <span className="text-sm text-zinc-400">{entry.status}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sub Graph: Plan Wise Revenue */}
                <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    <h2 className="text-lg font-bold text-white mb-6">Top Plans by Revenue</h2>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={planRevenue} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#27272a" />
                                <XAxis type="number" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis dataKey="name" type="category" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} width={100} />
                                <Tooltip content={<PieTooltip />} cursor={{ fill: '#27272a', opacity: 0.4 }} />
                                <Bar dataKey="value" fill="#60a5fa" radius={[0, 4, 4, 0]}>
                                    {planRevenue.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Retention Stats visual wrapper */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    <h2 className="text-lg font-bold text-white mb-6">Client Retention</h2>
                    
                    <div className="flex flex-col items-center justify-center py-6">
                        <div className="relative w-48 h-48 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle 
                                    cx="96" 
                                    cy="96" 
                                    r="80" 
                                    stroke="currentColor" 
                                    strokeWidth="16" 
                                    fill="transparent" 
                                    className="text-zinc-800"
                                />
                                <circle 
                                    cx="96" 
                                    cy="96" 
                                    r="80" 
                                    stroke="currentColor" 
                                    strokeWidth="16" 
                                    fill="transparent" 
                                    strokeDasharray={502.65} 
                                    strokeDashoffset={retention.totalClients > 0 ? 502.65 - (502.65 * (retention.activeClients / retention.totalClients)) : 502.65}
                                    className="text-emerald-400 transition-all duration-1000 ease-out"
                                />
                            </svg>
                            <div className="absolute flex flex-col items-center justify-center">
                                <span className="text-4xl font-bold text-white">
                                    {retention.totalClients > 0 ? Math.round((retention.activeClients / retention.totalClients) * 100) : 0}%
                                </span>
                                <span className="text-xs text-zinc-400 mt-1 uppercase tracking-wider font-medium">Retention</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="bg-zinc-800/50 p-4 rounded-xl text-center">
                            <p className="text-zinc-400 text-xs uppercase tracking-wider mb-1">Active</p>
                            <p className="text-xl font-bold text-emerald-400">{retention.activeClients}</p>
                        </div>
                        <div className="bg-zinc-800/50 p-4 rounded-xl text-center">
                            <p className="text-zinc-400 text-xs uppercase tracking-wider mb-1">Inactive</p>
                            <p className="text-xl font-bold text-zinc-500">{retention.inactiveClients}</p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default GymAnalyticsPage;
