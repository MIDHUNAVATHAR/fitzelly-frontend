import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, RefreshCcw, HandCoins } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getPayments } from '../../../api/membership.api';
import Pagination from '../../../components/ui/Pagination';

interface PaymentCollection {
    id: string;
    membershipId: string;
    clientId: string;
    clientName: string;
    amount: number;
    paymentDate: string;
    note: string | null;
}

const PaymentCollectionPage: React.FC = () => {
    const [payments, setPayments] = useState<PaymentCollection[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Initial dates setup: 1st of month to today/now
    const initialStartDate = new Date();
    initialStartDate.setDate(1);
    
    const [startDate, setStartDate] = useState(initialStartDate.toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);

    const fetchData = useCallback(async (page: number, currentLimit: number, start: string, end: string) => {
        setIsLoading(true);
        try {
            const data = await getPayments(page, currentLimit, start, end);
            setTotalItems(data.total || 0);
            setTotalAmount(data.totalAmount || 0);
            setPayments(data.payments || []);
        } catch (error: unknown) {
            toast.error((error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to load payments');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData(currentPage, limit, startDate, endDate);
    }, [currentPage, limit, startDate, endDate, fetchData]);

    const handleResetFilters = () => {
        const resetStart = new Date();
        resetStart.setDate(1);
        setStartDate(resetStart.toISOString().split('T')[0]);
        setEndDate(new Date().toISOString().split('T')[0]);
        setCurrentPage(1);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold text-white">Membership Collection</h1>
                    {totalAmount > 0 && (
                        <p className="text-emerald-400 font-medium bg-emerald-400/10 px-3 py-1 rounded-full w-fit mt-1">
                            Total Collected: ₹{totalAmount.toLocaleString()}
                        </p>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="w-full sm:w-auto relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => {
                            setStartDate(e.target.value);
                            setCurrentPage(1);
                        }}
                        required
                        className="w-full sm:w-48 bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                    />
                </div>
                <div className="w-full sm:w-auto relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => {
                            setEndDate(e.target.value);
                            setCurrentPage(1);
                        }}
                        required
                        className="w-full sm:w-48 bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                    />
                </div>
                <button
                    onClick={handleResetFilters}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-colors font-medium sm:w-auto w-full"
                >
                    <RefreshCcw className="w-4 h-4" />
                    Reset Filters
                </button>
            </div>

            {/* Content Table */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : payments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-zinc-900 border border-zinc-800 rounded-xl text-center px-4">
                    <HandCoins className="w-12 h-12 text-zinc-600 mb-4" />
                    <h3 className="text-lg font-medium text-white mb-1">No collections found</h3>
                    <p className="text-zinc-400 max-w-sm">
                        No payments were received in the selected date range.
                    </p>
                </div>
            ) : (
                <>
                    <div className="hidden md:block bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-zinc-800 bg-zinc-900/50">
                                    <th className="p-4 text-sm font-semibold text-zinc-400 tracking-wider">Client ID</th>
                                    <th className="p-4 text-sm font-semibold text-zinc-400 tracking-wider">Name</th>
                                    <th className="p-4 text-sm font-semibold text-zinc-400 tracking-wider">Payment Date</th>
                                    <th className="p-4 text-sm font-semibold text-zinc-400 tracking-wider">Amount</th>
                                    <th className="p-4 text-sm font-semibold text-zinc-400 tracking-wider">Note</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/50">
                                {payments.map((p) => (
                                    <tr key={p.id} className="hover:bg-zinc-800/20 transition-colors">
                                        <td className="p-4 text-sm text-zinc-400">
                                            {p.clientId}
                                        </td>
                                        <td className="p-4 text-sm text-white font-medium">
                                            {p.clientName}
                                        </td>
                                        <td className="p-4 text-sm text-zinc-300">
                                            {formatDate(p.paymentDate)}
                                        </td>
                                        <td className="p-4 text-sm font-medium text-emerald-400">
                                            ₹{p.amount}
                                        </td>
                                        <td className="p-4 text-sm text-zinc-400">
                                            {p.note || '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile View */}
                    <div className="md:hidden flex flex-col gap-4 mt-4">
                        {payments.map((p) => (
                            <div key={p.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-sm">
                                <div className="flex justify-between items-start mb-3 border-b border-zinc-800 pb-3">
                                    <div>
                                        <div className="font-medium text-white">{p.clientName}</div>
                                        <div className="text-xs text-zinc-500 mt-1">ID: {p.clientId}</div>
                                    </div>
                                    <div className="font-medium text-emerald-400">₹{p.amount}</div>
                                </div>
                                <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                                    <div>
                                        <span className="text-zinc-500 block text-xs">Date</span>
                                        <span className="text-zinc-300">{formatDate(p.paymentDate)}</span>
                                    </div>
                                    <div>
                                        <span className="text-zinc-500 block text-xs">Note</span>
                                        <span className="text-zinc-400">{p.note || '-'}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end mt-4">
                        <div className="w-full">
                            <Pagination
                                currentPage={currentPage}
                                totalItems={totalItems}
                                limit={limit}
                                onPageChange={setCurrentPage}
                                onLimitChange={(newLimit) => {
                                    setLimit(newLimit);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default PaymentCollectionPage;
