import React, { useState, useEffect } from 'react';
import { Search, Edit3, Trash2, ChevronRight, Activity, ShieldCheck, Plus, Info, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getMemberships, deleteMembership } from '../../../api/membership.api';
import type { Membership } from '../../../api/membership.api';
import Pagination from '../../../components/ui/Pagination';
import { Link, useNavigate } from 'react-router-dom';
import DeleteConfirmModal from '../plans/DeleteConfirmModal';
import EditMembershipModal from './EditMembershipModal';
import AddMembershipModal from './AddMembershipModal';
import { getTrainers } from '../../../api/gym-trainers.api';
import type { Trainer } from '../../../api/gym-trainers.api';

const MembershipListPage: React.FC = () => {
    const [memberships, setMemberships] = useState<Membership[]>([]);
    const [trainers, setTrainers] = useState<Trainer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'EXPIRED'>('ACTIVE');
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    // Modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedMembership, setSelectedMembership] = useState<Membership | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [renewClientId, setRenewClientId] = useState<string | null>(null);

    const navigate = useNavigate();

    const fetchData = React.useCallback(async (page: number, currentLimit: number, q: string, status: string, append: boolean = false) => {
        setIsLoading(true);
        try {
            const [membershipsData, trainersData] = await Promise.all([
                getMemberships(page, currentLimit, q, status),
                getTrainers(1, 100, '') // fetching trainers list for modal
            ]);
            setTotalItems(membershipsData.total || 0);
            setMemberships(prev => append ? [...prev, ...membershipsData.memberships] : membershipsData.memberships);
            setTrainers(trainersData?.trainers || trainersData || []);
        } catch (error: unknown) {
            toast.error((error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to load data');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        setCurrentPage(1);
        fetchData(1, limit, searchTerm, statusFilter, false);
    }, [searchTerm, limit, statusFilter, fetchData]);

    // Format Date
    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const PaymentStatusBadge = ({ status }: { status?: string }) => {
        if (status === 'PAID') {
            return (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">
                    <ShieldCheck className="w-3 h-3" /> PAID
                </div>
            );
        }
        if (status === 'PARTIAL') {
            return (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-400/10 text-amber-400 border border-amber-400/20">
                    <Clock className="w-3 h-3" /> PARTIAL
                </div>
            );
        }
        return (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-400/10 text-red-400 border border-red-400/20">
                <Info className="w-3 h-3" /> UNPAID
            </div>
        );
    };

    // Actions
    const handleEditClick = (m: Membership) => {
        setSelectedMembership(m);
        setIsEditModalOpen(true);
    };

    const handleDeleteClick = (m: Membership) => {
        setSelectedMembership(m);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedMembership) return;
        setIsDeleting(true);
        try {
            await deleteMembership(selectedMembership.id);
            toast.success('Membership deleted successfully');
            setIsDeleteModalOpen(false);
            fetchData(currentPage, limit, searchTerm, statusFilter, false);
        } catch (error: unknown) {
            toast.error((error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to delete membership');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleRowClick = (id: string, e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('button')) return;
        if ((e.target as HTMLElement).closest('a')) return;
        navigate(`/gym/memberships/${id}`);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
            {/* Header & Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-white">Memberships</h1>
                <button
                    onClick={() => {
                        setRenewClientId(null);
                        setIsAddModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors font-semibold shadow-lg shadow-emerald-500/20 whitespace-nowrap"
                >
                    <Plus className="w-5 h-5" />
                    Add Membership
                </button>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Search by client or plan name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'ACTIVE' | 'EXPIRED')}
                    className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors w-full sm:w-48 appearance-none cursor-pointer"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center' }}
                >
                    <option value="ACTIVE">Active</option>
                    <option value="EXPIRED">Expired</option>
                    <option value="ALL">All Memberships</option>
                </select>
            </div>

            {/* Content List */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : memberships.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-zinc-900 border border-zinc-800 rounded-xl text-center px-4">
                    <ShieldCheck className="w-12 h-12 text-zinc-600 mb-4" />
                    <h3 className="text-lg font-medium text-white mb-1">No memberships found</h3>
                    <p className="text-zinc-400 max-w-sm">
                        {searchTerm ? "No memberships match your search." : `No ${statusFilter.toLowerCase()} memberships currently.`}
                    </p>
                </div>
            ) : (
                <>
                    {/* Desktop View */}
                    <div className="hidden md:block bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-zinc-800 bg-zinc-900/50">
                                    <th className="p-4 text-xs sm:text-sm font-semibold text-zinc-400 uppercase tracking-wider">Client Name</th>
                                    <th className="p-4 text-xs sm:text-sm font-semibold text-zinc-400 uppercase tracking-wider">Plan Name</th>
                                    <th className="p-4 text-xs sm:text-sm font-semibold text-zinc-400 uppercase tracking-wider">Status</th>
                                    <th className="p-4 text-xs sm:text-sm font-semibold text-zinc-400 uppercase tracking-wider">Start Date</th>
                                    <th className="p-4 text-xs sm:text-sm font-semibold text-zinc-400 uppercase tracking-wider">Expiry Date</th>
                                    <th className="p-4 text-xs sm:text-sm font-semibold text-zinc-400 uppercase tracking-wider">Days Left</th>
                                    <th className="p-4 text-xs sm:text-sm font-semibold text-zinc-400 uppercase tracking-wider">Payment</th>
                                    <th className="p-4 text-xs sm:text-sm font-semibold text-zinc-400 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/50">
                                {memberships.map((m) => (
                                    <tr
                                        key={m.id}
                                        className="hover:bg-zinc-800/20 transition-colors group cursor-pointer"
                                        onClick={(e) => handleRowClick(m.id, e)}
                                    >
                                        <td className="p-4">
                                            <div className="font-medium text-white flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-emerald-400/10 text-emerald-400 flex items-center justify-center font-bold text-xs uppercase">
                                                    {m.clientName.charAt(0)}
                                                </div>
                                                {m.clientName}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-zinc-300 font-medium">{m.planName}</div>
                                            <div className="text-xs text-zinc-500 mt-0.5">{m.planType === 'DAY_BASED' ? 'Day Plan' : 'Category Plan'}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${m.status === 'ACTIVE'
                                                    ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20'
                                                    : 'bg-red-400/10 text-red-400 border border-red-400/20'
                                                    }`}>
                                                    {m.status === 'ACTIVE' ? <Activity className="w-3 h-3" /> : <div className="w-1.5 h-1.5 rounded-full bg-red-400" />}
                                                    {m.status}
                                                </div>
                                                {m.status === 'EXPIRED' && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setRenewClientId(m.clientId);
                                                            setIsAddModalOpen(true);
                                                        }}
                                                        className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 text-xs transition-colors"
                                                    >
                                                        Renew
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-zinc-300 text-sm">{formatDate(m.startDate)}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-zinc-300 text-sm whitespace-nowrap">{formatDate(m.expiryDate)}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-medium text-emerald-400 text-sm">
                                                {m.daysLeft !== null && m.daysLeft !== undefined ? m.daysLeft : 'N/A'}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <PaymentStatusBadge status={m.paymentStatus} />
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEditClick(m)}
                                                    className="p-2 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors"
                                                    title="Edit Membership"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(m)}
                                                    className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                                    title="Delete Membership"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <Link
                                                    to={`/gym/memberships/${m.id}`}
                                                    className="p-2 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors"
                                                    title="View Membership"
                                                >
                                                    <ChevronRight className="w-4 h-4" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile View */}
                    <div className="md:hidden flex flex-col gap-4 mt-4">
                        {memberships.map((m) => (
                            <div
                                key={m.id}
                                className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-emerald-500/50 transition-colors cursor-pointer shadow-sm"
                                onClick={(e) => handleRowClick(m.id, e)}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="font-medium text-white flex items-center gap-2">
                                        <div className="w-10 h-10 rounded-full bg-emerald-400/10 text-emerald-400 flex items-center justify-center font-bold text-sm uppercase shrink-0">
                                            {m.clientName.charAt(0)}
                                        </div>
                                        <div>
                                            {m.clientName}
                                            <div className="text-xs text-zinc-500 font-normal">{m.planName}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={`inline-flex shrink-0 items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${m.status === 'ACTIVE'
                                            ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20'
                                            : 'bg-red-400/10 text-red-400 border border-red-400/20'
                                            }`}>
                                            {m.status === 'ACTIVE' ? <Activity className="w-3 h-3" /> : <div className="w-1.5 h-1.5 rounded-full bg-red-400" />}
                                            {m.status}
                                        </div>
                                        {m.status === 'EXPIRED' && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setRenewClientId(m.clientId);
                                                    setIsAddModalOpen(true);
                                                }}
                                                className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 text-xs transition-colors"
                                            >
                                                Renew
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-3 text-sm">
                                    <div>
                                        <span className="text-zinc-500 block text-xs">Start Date</span>
                                        <span className="text-zinc-300">{formatDate(m.startDate)}</span>
                                    </div>
                                    <div>
                                        <span className="text-zinc-500 block text-xs">Expiry Date</span>
                                        <span className="text-zinc-300">{formatDate(m.expiryDate)}</span>
                                    </div>
                                    <div>
                                        <span className="text-zinc-500 block text-xs">Days Left</span>
                                        <span className="font-medium text-emerald-400">{m.daysLeft !== null && m.daysLeft !== undefined ? m.daysLeft : 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span className="text-zinc-500 block text-xs mb-1">Payment</span>
                                        <PaymentStatusBadge status={m.paymentStatus} />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800/50 mt-2">
                                    <button
                                        onClick={() => handleEditClick(m)}
                                        className="p-2 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors"
                                        title="Edit Membership"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(m)}
                                        className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                        title="Delete Membership"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <Link
                                        to={`/gym/memberships/${m.id}`}
                                        className="p-2 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors"
                                        title="View Membership"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-end mt-4">
                        <div className="w-full">
                            <Pagination
                                currentPage={currentPage}
                                totalItems={totalItems}
                                limit={limit}
                                onPageChange={(page) => {
                                    setCurrentPage(page);
                                    fetchData(page, limit, searchTerm, statusFilter, false);
                                }}
                                onLimitChange={(newLimit) => {
                                    setLimit(newLimit);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                    </div>
                </>
            )}

            {/* Edit Modal */}
            {selectedMembership && (
                <EditMembershipModal
                    isOpen={isEditModalOpen}
                    membership={selectedMembership}
                    trainers={trainers}
                    onClose={() => setIsEditModalOpen(false)}
                    onSuccess={() => {
                        setIsEditModalOpen(false);
                        fetchData(currentPage, limit, searchTerm, statusFilter, false);
                    }}
                />
            )}

            {/* Add Modal */}
            <AddMembershipModal
                isOpen={isAddModalOpen}
                initialClientId={renewClientId || undefined}
                onClose={() => {
                    setIsAddModalOpen(false);
                    setRenewClientId(null);
                }}
                onSuccess={() => {
                    setIsAddModalOpen(false);
                    setRenewClientId(null);
                    fetchData(currentPage, limit, searchTerm, statusFilter, false);
                }}
            />

            {/* Delete Modal */}
            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                itemName={`Membership for ${selectedMembership?.clientName}`}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                isDeleting={isDeleting}
            />
        </div>
    );
};

export default MembershipListPage;
