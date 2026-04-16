import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
    Plus, 
    Filter, 
    ChevronLeft, 
    ChevronRight, 
    Edit2, 
    Trash2, 
    Wallet, 
    TrendingUp, 
    Users, 
    X, 
    Loader2 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format, startOfMonth } from 'date-fns';
import DateInput from '../../../components/ui/DateInput';
import { getTrainerPayouts, addTrainerPayout, updateTrainerPayout, deleteTrainerPayout, type TrainerPayout } from '../../../api/trainer-payout.api';
import { getTrainers, type Trainer } from '../../../api/gym-trainers.api';

const TrainerPayoutsPage: React.FC = () => {
    const [payouts, setPayouts] = useState<TrainerPayout[]>([]);
    const [trainers, setTrainers] = useState<Trainer[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(10);

    // Filters
    const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [selectedTrainer, setSelectedTrainer] = useState('ALL');

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingPayout, setEditingPayout] = useState<TrainerPayout | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [form, setForm] = useState({
        trainerId: '',
        amount: '',
        notes: '',
        date: format(new Date(), 'yyyy-MM-dd')
    });

    const fetchPayouts = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getTrainerPayouts(
                currentPage,
                limit,
                selectedTrainer === 'ALL' ? undefined : selectedTrainer,
                startDate || undefined,
                endDate || undefined
            );
            setPayouts(data.data.payouts);
            setTotalCount(data.data.total);
        } catch {
            toast.error('Failed to fetch payouts');
        } finally {
            setLoading(false);
        }
    }, [currentPage, limit, startDate, endDate, selectedTrainer]);

    const fetchTrainers = useCallback(async () => {
        try {
            const data = await getTrainers(1, 100, '');
            setTrainers(data.trainers);
        } catch (error) {
            console.error('Failed to fetch trainers', error);
        }
    }, []);

    useEffect(() => {
        fetchPayouts();
        fetchTrainers();
    }, [fetchPayouts, fetchTrainers]);

    const totalPayoutAmount = useMemo(() => {
        return payouts.reduce((sum, p) => sum + p.amount, 0);
    }, [payouts]);

    const handleOpenModal = (payout?: TrainerPayout) => {
        if (payout) {
            setEditingPayout(payout);
            setForm({
                trainerId: payout.trainerId,
                amount: payout.amount.toString(),
                notes: payout.notes || '',
                date: format(new Date(payout.date), 'yyyy-MM-dd')
            });
        } else {
            setEditingPayout(null);
            setForm({
                trainerId: '',
                amount: '',
                notes: '',
                date: format(new Date(), 'yyyy-MM-dd')
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.trainerId || !form.amount || !form.date) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            setSubmitting(true);
            if (editingPayout) {
                await updateTrainerPayout(editingPayout.id, {
                    trainerId: form.trainerId,
                    amount: parseFloat(form.amount),
                    notes: form.notes,
                    date: form.date
                });
                toast.success('Payout updated successfully');
            } else {
                await addTrainerPayout({
                    trainerId: form.trainerId,
                    amount: parseFloat(form.amount),
                    notes: form.notes,
                    date: form.date
                });
                toast.success('Payout added successfully');
            }
            setShowModal(false);
            fetchPayouts();
        } catch {
            toast.error('Operation failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this payout record?')) return;
        try {
            await deleteTrainerPayout(id);
            toast.success('Payout deleted successfully');
            fetchPayouts();
        } catch {
            toast.error('Failed to delete payout');
        }
    };

    return (
        <div className="p-6 space-y-6 text-white min-h-full">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-white uppercase tracking-tight">Trainer Payouts</h1>
                    <p className="text-zinc-500 text-sm font-medium tracking-wide">Manage trainer compensations and pay history</p>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="flex items-center justify-center gap-2 bg-emerald-400 hover:bg-emerald-500 text-black px-4 py-2 rounded-lg font-bold transition-all shadow-lg active:scale-95 whitespace-nowrap text-sm"
                >
                    <Plus size={18} />
                    RECORD PAYOUT
                </button>
            </div>

            {/* Stats overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl space-y-3 shadow-xl">
                    <div className="w-10 h-10 rounded-xl bg-emerald-400/10 flex items-center justify-center">
                        <Wallet className="text-emerald-400" size={20} />
                    </div>
                    <div>
                        <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider">Filtered Total Payout</p>
                        <h3 className="text-2xl font-bold text-white mt-1 uppercase tracking-tight">₹{totalPayoutAmount.toLocaleString()}</h3>
                    </div>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl space-y-3 shadow-xl">
                    <div className="w-10 h-10 rounded-xl bg-blue-400/10 flex items-center justify-center">
                        <Users className="text-blue-400" size={20} />
                    </div>
                    <div>
                        <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider">Active Trainers</p>
                        <h3 className="text-2xl font-bold text-white mt-1 uppercase tracking-tight">{trainers.length}</h3>
                    </div>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl space-y-3 shadow-xl">
                    <div className="w-10 h-10 rounded-xl bg-purple-400/10 flex items-center justify-center">
                        <TrendingUp className="text-purple-400" size={20} />
                    </div>
                    <div>
                        <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider">Records in View</p>
                        <h3 className="text-2xl font-bold text-white mt-1 uppercase tracking-tight">{totalCount}</h3>
                    </div>
                </div>
            </div>

            {/* Filters section */}
            <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl space-y-4">
                <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
                    <Filter size={16} className="text-emerald-400" />
                    <h2 className="text-xs font-bold text-white uppercase tracking-widest">Filter Records</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Trainer</label>
                        <select 
                            value={selectedTrainer}
                            onChange={(e) => { setSelectedTrainer(e.target.value); setCurrentPage(1); }}
                            className="w-full bg-zinc-950 border border-zinc-800 text-white p-2 rounded-lg focus:outline-none focus:border-emerald-400 text-sm"
                        >
                            <option value="ALL">All Trainers</option>
                            {trainers.map(t => (
                                <option key={t.id} value={t.id}>{t.fullName}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Start Date</label>
                        <DateInput 
                            value={startDate}
                            onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
                            className="bg-zinc-950 border border-zinc-800 rounded-lg py-2 px-4 text-sm text-zinc-400 focus:outline-none focus:border-emerald-400 transition-colors w-full"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">End Date</label>
                        <DateInput 
                            value={endDate}
                            onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
                            className="bg-zinc-950 border border-zinc-800 rounded-lg py-2 px-4 text-sm text-zinc-400 focus:outline-none focus:border-emerald-400 transition-colors w-full"
                        />
                    </div>
                    <div className="flex items-end">
                        <button 
                            onClick={() => { 
                                setStartDate(format(startOfMonth(new Date()), 'yyyy-MM-dd')); 
                                setEndDate(format(new Date(), 'yyyy-MM-dd')); 
                                setSelectedTrainer('ALL'); 
                                setCurrentPage(1); 
                            }}
                            className="w-full h-[40px] text-zinc-500 hover:text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                            Reset Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* List Section */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-zinc-950/50 border-b border-zinc-800">
                                <th className="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Trainer Name</th>
                                <th className="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Amount</th>
                                <th className="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Date</th>
                                <th className="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Notes</th>
                                <th className="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest w-[100px]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50 text-white">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-10 text-center">
                                        <Loader2 className="animate-spin text-emerald-400 mx-auto w-8 h-8" />
                                        <p className="mt-4 text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Loading records...</p>
                                    </td>
                                </tr>
                            ) : payouts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-10 text-center text-zinc-500 italic text-sm">No payout records found matching your filters.</td>
                                </tr>
                            ) : (
                                payouts.map((p) => (
                                    <tr key={p.id} className="hover:bg-zinc-800/30 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-emerald-400/10 flex items-center justify-center text-emerald-400 font-bold text-xs">
                                                    {p.trainerName?.[0] || 'T'}
                                                </div>
                                                <span className="font-semibold text-sm">{p.trainerName || 'Unknown Trainer'}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-base font-bold text-emerald-400 tracking-tight">₹{p.amount.toLocaleString()}</span>
                                        </td>
                                        <td className="p-4 text-zinc-400 text-xs font-medium">
                                            {format(new Date(p.date), 'dd-MM-yyyy')}
                                        </td>
                                        <td className="p-4 text-zinc-500 text-xs max-w-xs truncate">
                                            {p.notes || '-'}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => handleOpenModal(p)}
                                                    className="w-7 h-7 rounded bg-emerald-400/10 text-emerald-400 flex items-center justify-center hover:bg-emerald-400 hover:text-black transition-all"
                                                >
                                                    <Edit2 size={12} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(p.id)}
                                                    className="w-7 h-7 rounded bg-red-400/10 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
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
                            Showing <span className="text-white">{(currentPage - 1) * limit + 1}</span> to <span className="text-white">{Math.min(currentPage * limit, totalCount)}</span> of <span className="text-white">{totalCount}</span>
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

            {/* Record Payout Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
                    <div 
                        className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-xl overflow-hidden shadow-2xl relative animate-in zoom-in duration-200"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="p-6 border-b border-zinc-800 bg-zinc-950/50 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-white uppercase tracking-tight">{editingPayout ? 'Edit Payout' : 'Record Payout'}</h2>
                                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">Transaction Details</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="bg-zinc-800 text-zinc-400 hover:text-white rounded-full p-1.5 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Select Trainer <span className="text-red-500">*</span></label>
                                    <select 
                                        required
                                        value={form.trainerId}
                                        onChange={e => setForm({ ...form, trainerId: e.target.value })}
                                        className="w-full bg-zinc-950 border border-zinc-800 text-white p-3 rounded-lg focus:outline-none focus:border-emerald-400 transition-all text-sm font-medium"
                                    >
                                        <option value="">Choose a trainer...</option>
                                        {trainers.map(t => (
                                            <option key={t.id} value={t.id}>{t.fullName}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Amount (₹) <span className="text-red-500">*</span></label>
                                        <input 
                                            required
                                            type="number"
                                            placeholder="0.00"
                                            value={form.amount}
                                            onChange={e => setForm({ ...form, amount: e.target.value })}
                                            className="w-full bg-zinc-950 border border-zinc-800 text-white p-3 rounded-lg focus:outline-none focus:border-emerald-400 transition-all text-sm font-medium"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Date <span className="text-red-500">*</span></label>
                                        <DateInput 
                                            required
                                            value={form.date}
                                            onChange={e => setForm({ ...form, date: e.target.value })}
                                            className="w-full bg-zinc-950 border border-zinc-800 text-white p-3 rounded-lg focus:outline-none focus:border-emerald-400 transition-all text-sm font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Notes</label>
                                    <textarea 
                                        placeholder="Add any internal transaction notes here..."
                                        rows={2}
                                        value={form.notes}
                                        onChange={e => setForm({ ...form, notes: e.target.value })}
                                        className="w-full bg-zinc-950 border border-zinc-800 text-white p-3 rounded-lg focus:outline-none focus:border-emerald-400 transition-all text-sm font-medium resize-none"
                                    />
                                </div>
                            </div>

                            <button 
                                disabled={submitting}
                                className="w-full bg-emerald-400 hover:bg-emerald-500 text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 disabled:opacity-50 text-sm"
                            >
                                {submitting ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                                {editingPayout ? 'UPDATE PAYOUT' : 'SAVE PAYOUT'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrainerPayoutsPage;
