import React, { useState, useEffect, useMemo } from 'react';
import { 
    Wallet, 
    TrendingUp, 
    Loader2,
    Calendar,
    ChevronLeft,
    ChevronRight,
    ArrowUpRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { getTrainerEarnings, type TrainerPayout } from '../../../api/trainer-payout.api';

const MyEarningsPage: React.FC = () => {
    const [earnings, setEarnings] = useState<TrainerPayout[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(10);

    useEffect(() => {
        fetchEarnings();
    }, [currentPage, limit]);

    const fetchEarnings = async () => {
        try {
            setLoading(true);
            const response = await getTrainerEarnings(currentPage, limit);
            setEarnings(response.data.payouts);
            setTotalCount(response.data.total);
        } catch (error) {
            toast.error('Failed to fetch earnings history');
        } finally {
            setLoading(false);
        }
    };

    const totalLifetimeEarnings = useMemo(() => {
        // This is based on the visible list
        return earnings.reduce((sum, p) => sum + p.amount, 0);
    }, [earnings]);

    return (
        <div className="p-6 space-y-6 text-white min-h-full">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-white uppercase tracking-tight">My Earnings</h1>
                    <p className="text-zinc-500 text-sm font-medium tracking-wide">View your complete payment history and total compensation</p>
                </div>
            </div>

            {/* Stats overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl space-y-3 shadow-xl relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-400/5 rounded-full blur-2xl group-hover:bg-emerald-400/10 transition-all duration-500" />
                    <div className="w-10 h-10 rounded-xl bg-emerald-400/10 flex items-center justify-center relative z-10">
                        <Wallet className="text-emerald-400" size={20} />
                    </div>
                    <div className="relative z-10">
                        <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider">Total Earnings (This View)</p>
                        <h3 className="text-2xl font-bold text-white mt-1 uppercase tracking-tight">₹{totalLifetimeEarnings.toLocaleString()}</h3>
                    </div>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl space-y-3 shadow-xl relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-400/5 rounded-full blur-2xl group-hover:bg-blue-400/10 transition-all duration-500" />
                    <div className="w-10 h-10 rounded-xl bg-blue-400/10 flex items-center justify-center relative z-10">
                        <TrendingUp className="text-blue-400" size={20} />
                    </div>
                    <div className="relative z-10">
                        <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider">Total Payment Records</p>
                        <h3 className="text-2xl font-bold text-white mt-1 uppercase tracking-tight">{totalCount}</h3>
                    </div>
                </div>
            </div>

            {/* List Section */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
                <div className="p-4 border-b border-zinc-800 bg-zinc-950/30">
                    <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-emerald-400" />
                        <span className="text-[10px] font-bold text-white uppercase tracking-widest">Transaction History</span>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-zinc-950/50 border-b border-zinc-800">
                                <th className="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Date</th>
                                <th className="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Amount</th>
                                <th className="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Notes / Description</th>
                                <th className="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest w-[60px]">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50 text-white">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="p-10 text-center">
                                        <Loader2 className="animate-spin text-emerald-400 mx-auto w-8 h-8" />
                                        <p className="mt-4 text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Fetching your history...</p>
                                    </td>
                                </tr>
                            ) : earnings.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-10 text-center text-zinc-500 italic text-sm">No payment records found yet.</td>
                                </tr>
                            ) : (
                                earnings.map((p) => (
                                    <tr key={p.id} className="hover:bg-zinc-800/30 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-white">{format(new Date(p.date), 'dd-MM-yyyy')}</span>
                                                <span className="text-[10px] text-zinc-500 uppercase tracking-tight">{format(new Date(p.date), 'EEEE')}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <span className="text-base font-bold text-emerald-400 tracking-tight">₹{p.amount.toLocaleString()}</span>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-zinc-400 text-xs line-clamp-1 max-w-sm">
                                                {p.notes || 'No description provided'}
                                            </p>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="w-6 h-6 rounded-full bg-emerald-400/10 flex items-center justify-center text-emerald-400 mx-auto">
                                                <ArrowUpRight size={12} />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination and Row Limit UI */}
                <div className="p-4 bg-zinc-950/50 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Rows per page:</p>
                        <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden p-1">
                            {[10, 50, 100].map((r) => (
                                <button
                                    key={r}
                                    onClick={() => { setLimit(r); setCurrentPage(1); }}
                                    className={`px-3 py-1 text-[10px] font-bold rounded transition-all ${limit === r ? 'bg-emerald-400 text-black' : 'text-zinc-500 hover:text-white'}`}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest">
                            Showing <span className="text-white">{totalCount === 0 ? 0 : (currentPage - 1) * limit + 1}</span> to <span className="text-white">{Math.min(currentPage * limit, totalCount)}</span> of <span className="text-white">{totalCount}</span>
                        </span>
                        <div className="flex items-center gap-2">
                            <button 
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => prev - 1)}
                                className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white disabled:opacity-30 transition-all hover:bg-zinc-800"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button 
                                disabled={currentPage * limit >= totalCount}
                                onClick={() => setCurrentPage(prev => prev + 1)}
                                className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white disabled:opacity-30 transition-all hover:bg-zinc-800"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyEarningsPage;
