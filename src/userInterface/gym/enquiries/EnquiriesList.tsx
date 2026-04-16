import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { getEnquiries, addEnquiry, updateEnquiry, deleteEnquiry } from '../../../api/enquiry.api';
import type { Enquiry } from '../../../api/enquiry.api';
import { toast } from 'react-hot-toast';
import ReusableTable from '../../../components/ui/ReusableTable';
import type { Column } from '../../../components/ui/ReusableTable';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import EnquiryModal from './EnquiryModal';
import DateInput from '../../../components/ui/DateInput';
import Pagination from '../../../components/ui/Pagination';

const EnquiriesList: React.FC = () => {
    // List state
    const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState('');

    // Filter state
    const [startDate, setStartDate] = useState<string>(() => {
        const d = new Date();
        d.setDate(1); // Start of current month
        return d.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState<string>(() => {
        const d = new Date();
        return d.toISOString().split('T')[0];
    });

    // Modal state
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);

    const loadEnquiries = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getEnquiries(page, limit, search, startDate, endDate);
            setEnquiries(response.data.enquiries);
            setTotal(response.data.total);
        } catch (error) {
            console.error('Error fetching enquiries:', error);
            toast.error('Failed to load enquiries');
        } finally {
            setLoading(false);
        }
    }, [page, limit, search, startDate, endDate]);

    useEffect(() => {
        loadEnquiries();
    }, [loadEnquiries]);

    const handleAdd = async (data: Partial<Enquiry>) => {
        if (!data.fullName || !data.phoneNumber) {
            toast.error('Full name and phone number are required');
            return;
        }

        try {
            await addEnquiry({
                fullName: data.fullName,
                phoneNumber: data.phoneNumber,
                email: data.email || undefined
            });
            toast.success('Enquiry added successfully');
            loadEnquiries();
        } catch (error) {
            toast.error('Failed to add enquiry');
            throw error;
        }
    };

    const handleEdit = async (data: Partial<Enquiry>) => {
        if (!selectedEnquiry) return;
        try {
            await updateEnquiry(selectedEnquiry.id, {
                fullName: data.fullName,
                phoneNumber: data.phoneNumber,
                email: data.email || undefined,
                status: data.status
            });
            toast.success('Enquiry updated successfully');
            loadEnquiries();
        } catch (error) {
            toast.error('Failed to update enquiry');
            throw error;
        }
    };

    const handleDelete = async () => {
        if (!selectedEnquiry) return;
        try {
            await deleteEnquiry(selectedEnquiry.id);
            toast.success('Enquiry deleted successfully');
            setIsDeleteModalOpen(false);
            loadEnquiries();
        } catch {
            toast.error('Failed to delete enquiry');
        }
    };

    const columns: Column<Enquiry>[] = [
        { header: 'Full Name', accessor: 'fullName' },
        { header: 'Phone', accessor: 'phoneNumber' },
        { header: 'Email', accessor: (row) => row.email || 'N/A' },
        {
            header: 'Status',
            accessor: (row) => (
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${row.status === 'CONVERTED' ? 'bg-emerald-500/10 text-emerald-500' :
                        row.status === 'CONTACTED' ? 'bg-blue-500/10 text-blue-500' :
                            'bg-amber-500/10 text-amber-500'
                    }`}>
                    {row.status}
                </span>
            )
        },
        {
            header: 'Date',
            accessor: (row) => new Date(row.date).toLocaleDateString('en-GB')
        },
        {
            header: 'Actions',
            accessor: (row) => (
                <div className="flex gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEnquiry(row);
                            setIsEditModalOpen(true);
                        }}
                        className="p-1.5 bg-zinc-800 rounded hover:bg-zinc-700 text-blue-400 transition"
                        title="Edit"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEnquiry(row);
                            setIsDeleteModalOpen(true);
                        }}
                        className="p-1.5 bg-zinc-800 rounded hover:bg-zinc-700 text-red-400 transition"
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Enquiries Management</h1>
                    <p className="text-zinc-400 text-sm mt-1">Manage and track your gym's prospective clients.</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-all font-bold shadow-lg shadow-emerald-500/20 active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    Add Enquiry
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
                <div className="md:col-span-2 relative group">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search enquiries by name, phone or email..."
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-11 pr-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all shadow-xl"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="block text-[10px] uppercase tracking-wider font-bold text-zinc-500 mb-1 ml-1">From</label>
                        <DateInput 
                            value={startDate} 
                            onChange={(e) => setStartDate(e.target.value)} 
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all shadow-xl"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-[10px] uppercase tracking-wider font-bold text-zinc-500 mb-1 ml-1">To</label>
                        <DateInput 
                            value={endDate} 
                            onChange={(e) => setEndDate(e.target.value)} 
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all shadow-xl"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
                <ReusableTable
                    columns={columns}
                    data={enquiries}
                    isLoading={loading}
                    onRowClick={(row) => {
                        setSelectedEnquiry(row);
                        setIsEditModalOpen(true);
                    }}
                />
            </div>

            {/* Pagination */}
            <Pagination
                currentPage={page}
                totalItems={total}
                limit={limit}
                limitOptions={[10, 30, 50]}
                onPageChange={(p) => setPage(p)}
                onLimitChange={(l) => {
                    setLimit(l);
                    setPage(1);
                }}
            />

            <EnquiryModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={handleAdd}
                title="New Enquiry"
            />

            <EnquiryModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedEnquiry(null);
                }}
                onSave={handleEdit}
                enquiry={selectedEnquiry}
                title="Edit Enquiry"
            />

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete Enquiry"
                message="Are you sure you want to delete this enquiry? This action cannot be undone."
                isProcessing={loading}
            />
        </div>
    );
};

export default EnquiriesList;
