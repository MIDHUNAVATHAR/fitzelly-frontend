import React, { useState, useEffect } from 'react';
import { 
    Wallet,
    Cake,
    AlertCircle,
    UserCheck,
    Clock,
    TrendingUp,
    UserMinus
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getGymDashboard, type DashboardData } from '../../api/analytics.api';
import { format } from 'date-fns';

const DashboardHome: React.FC = () => {
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const result = await getGymDashboard();
                setData(result);
            } catch {
                toast.error('Failed to load dashboard data.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!data) return null;

    const formatCurrency = (val: number) => `₹${val.toLocaleString()}`;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
                    <p className="text-zinc-400 text-sm mt-1">Live updates and upcoming priorities</p>
                </div>
            </div>

            {/* Top Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-4">
                        <UserCheck className="w-6 h-6 text-emerald-400" />
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-emerald-400/10 text-emerald-400">Today</span>
                    </div>
                    <p className="text-zinc-400 text-sm mb-1">Total Check-ins</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold text-white">{data.todayCheckins.client + data.todayCheckins.trainer}</h3>
                        <span className="text-xs text-zinc-500">({data.todayCheckins.client} C, {data.todayCheckins.trainer} T)</span>
                    </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl group">
                    <div className="flex items-center justify-between mb-4">
                        <Wallet className="w-6 h-6 text-blue-400" />
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-400/10 text-blue-400">Month</span>
                    </div>
                    <p className="text-zinc-400 text-sm mb-1">Monthly Revenue</p>
                    <h3 className="text-3xl font-bold text-white">{formatCurrency(data.monthRevenue)}</h3>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl group">
                    <div className="flex items-center justify-between mb-4">
                        <TrendingUp className="w-6 h-6 text-amber-400" />
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-amber-400/10 text-amber-400">New</span>
                    </div>
                    <p className="text-zinc-400 text-sm mb-1">Monthly Joinees</p>
                    <h3 className="text-3xl font-bold text-white">{data.monthJoinees}</h3>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl group">
                    <div className="flex items-center justify-between mb-4">
                        <AlertCircle className="w-6 h-6 text-red-500" />
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-red-400/10 text-red-400">Alert</span>
                    </div>
                    <p className="text-zinc-400 text-sm mb-1">Inactive (7+ days)</p>
                    <h3 className="text-3xl font-bold text-white">{data.inactiveClients.length}</h3>
                </div>
            </div>

            {/* Bottom Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Membership Expiries */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl lg:col-span-1">
                    <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Clock className="w-5 h-5 text-amber-400" />
                            Expiring Soon
                        </h2>
                    </div>
                    <div className="p-2">
                        {data.expiries.length > 0 ? (
                            data.expiries.map((exp, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 hover:bg-zinc-800/50 rounded-lg transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-amber-400 font-bold">
                                            {exp.name.slice(0, 1)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-white">{exp.name}</p>
                                            <p className="text-xs text-zinc-500">Expires {format(new Date(exp.expiryDate), 'MMM dd')}</p>
                                        </div>
                                    </div>
                                    <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                                        exp.daysRemaining <= 1 ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'
                                    }`}>
                                        {exp.daysRemaining === 0 ? 'Today' : `${exp.daysRemaining} days`}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-zinc-600">No upcoming expiries</div>
                        )}
                    </div>
                </div>

                {/* Today's Birthdays */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl lg:col-span-1">
                    <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Cake className="w-5 h-5 text-pink-400" />
                            Celebrations
                        </h2>
                    </div>
                    <div className="p-2">
                        {data.birthdays.length > 0 ? (
                            data.birthdays.map((b, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 hover:bg-zinc-800/50 rounded-lg transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-400">
                                            <Cake className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-white">{b.name}</p>
                                            <p className="text-xs text-zinc-500">{b.role}</p>
                                        </div>
                                    </div>
                                    <div className="text-xs font-medium text-zinc-400 group-hover:text-white transition-colors">
                                        IT'S TODAY! 🎈
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-zinc-600">No birthdays today</div>
                        )}
                    </div>
                </div>

                {/* Inactive Clients (7+ days) */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl lg:col-span-1">
                    <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <UserMinus className="w-5 h-5 text-red-400" />
                            Inactive Clients
                        </h2>
                    </div>
                    <div className="p-2">
                        {data.inactiveClients.length > 0 ? (
                            data.inactiveClients.map((client, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 hover:bg-zinc-800/50 rounded-lg transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                                            {client.name.slice(0, 1)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-white">{client.name}</p>
                                            <p className="text-xs text-zinc-500">
                                                {client.lastCheckIn ? `Last seen: ${format(new Date(client.lastCheckIn), 'MMM dd')}` : 'Never checked in'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-xs font-semibold text-zinc-500">
                                        {client.daysSinceLastSeen}d+
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-zinc-600">All clients active!</div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DashboardHome;