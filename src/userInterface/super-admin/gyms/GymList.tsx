import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ReusableTable from '../../../components/ui/ReusableTable';
import type { Column } from '../../../components/ui/ReusableTable';
import SearchInput from '../../../components/ui/SearchInput';
import Pagination from '../../../components/ui/Pagination';
import type { Gym } from "../../../api/superAdmin-gyms.api";
import { fetchGyms } from "../../../api/superAdmin-gyms.api";
import { Eye } from 'lucide-react';

interface GymWithId extends Gym {
    id: string;
}

const GymsList: React.FC = () => {
    const navigate = useNavigate();
    const [gyms, setGyms] = useState<GymWithId[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    const loadGyms = useCallback(async (page: number, currentLimit: number, searchTerm: string) => {
        try {
            setLoading(true);
            const data = await fetchGyms(page, searchTerm, currentLimit);
            // map _id to id for reusableTable
            const mappedGyms = data.gyms.map(g => ({ ...g, id: g._id }));
            setGyms(mappedGyms);
            setTotalItems(data.totalGyms);
        } catch (error) {
            console.error('Failed to load gyms', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        setCurrentPage(1);
        loadGyms(1, limit, search);
    }, [search, limit, loadGyms]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        loadGyms(page, limit, search);
    };

    const handleLimitChange = (newLimit: number) => {
        setLimit(newLimit);
        setCurrentPage(1);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Approved': return 'text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full text-xs font-semibold';
            case 'Pending': return 'text-amber-500 bg-amber-500/10 px-2 py-1 rounded-full text-xs font-semibold';
            case 'Rejected': return 'text-red-500 bg-red-500/10 px-2 py-1 rounded-full text-xs font-semibold';
            case 'Active': return 'text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full text-xs font-semibold';
            case 'Trial': return 'text-blue-500 bg-blue-500/10 px-2 py-1 rounded-full text-xs font-semibold';
            case 'Expired': return 'text-red-500 bg-red-500/10 px-2 py-1 rounded-full text-xs font-semibold';
            default: return 'text-zinc-500';
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-IN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch {
            return 'Invalid Date';
        }
    };

    const columns: Column<GymWithId>[] = [
        { header: 'Gym Name', accessor: 'gymName' },
        {
            header: 'Approval Status',
            accessor: (gym) => (
                <span className={getStatusColor(gym.approvalStatus)}>
                    {gym.approvalStatus}
                </span>
            )
        },
        {
            header: 'Subscription',
            accessor: (gym) => (
                <span className={getStatusColor(gym.subscriptionStatus)}>
                    {gym.subscriptionStatus}
                </span>
            )
        },
        {
            header: 'Expiry Date',
            accessor: (gym) => formatDate(gym.expiryDate)
        },
        {
            header: 'Actions',
            accessor: (gym) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/super-admin/gyms/${gym._id}`); }}
                        className="p-1.5 bg-zinc-800 rounded hover:bg-zinc-700 text-blue-400 transition"
                        title="View"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-white">Gyms</h1>
            </div>

            <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Search gyms..."
            />

            <ReusableTable
                data={gyms}
                columns={columns}
                isLoading={loading}
                emptyMessage="No gyms found."
                onRowClick={(gym) => navigate(`/super-admin/gyms/${gym._id}`)}
            />

            <div className="flex justify-end mt-4">
                <Pagination
                    currentPage={currentPage}
                    totalItems={totalItems}
                    limit={limit}
                    onPageChange={handlePageChange}
                    onLimitChange={handleLimitChange}
                />
            </div>
        </div>
    );
};

export default GymsList;