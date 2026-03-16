import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Activity } from "lucide-react";
import { toast } from "react-hot-toast";
import { getAssignedClients } from "../../../api/trainer-clients.api";
import type { ClientDTO } from "../../../api/gym-clients.api";
import ReusableTable from "../../../components/ui/ReusableTable";
import type { Column } from "../../../components/ui/ReusableTable";
import SearchInput from "../../../components/ui/SearchInput";
import Pagination from "../../../components/ui/Pagination";

// debounce function
function useDebounceValue<T>(value: T, delay: number): T {
    const [debounceValue, setDebounceValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebounceValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debounceValue;
}

const AssignedClientsPage: React.FC = () => {
    const navigate = useNavigate();
    const [clients, setClients] = useState<ClientDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    const debouncedSearch = useDebounceValue(search, 500);

    const loadClients = useCallback(async (pageNum: number, currentLimit: number, searchQuery: string) => {
        try {
            setLoading(true);
            const data = await getAssignedClients(pageNum, currentLimit, searchQuery);
            if (data.status !== "success") {
                toast.error('Failed to load assigned clients');
                return;
            }
            setClients(data.data.clients);
            setTotalItems(data.totalItems);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load clients');
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial fetch and search
    useEffect(() => {
        setPage(1);
        loadClients(1, limit, debouncedSearch);
    }, [debouncedSearch, limit, loadClients]);

    // Pagination
    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        loadClients(newPage, limit, debouncedSearch);
    };

    const handleLimitChange = (newLimit: number) => {
        setLimit(newLimit);
        setPage(1);
    };

    const handleWorkoutPlan = (e: React.MouseEvent, clientId: string) => {
        e.stopPropagation();
        navigate(`/trainer/clients/${clientId}/workout-plan`);
    };

    const columns: Column<ClientDTO>[] = [
        { header: 'Full Name', accessor: 'fullName' },
        { header: 'Email', accessor: 'email' },
        { header: 'Phone', accessor: 'phoneNumber' },
        {
            header: 'Actions',
            accessor: (client) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/trainer/clients/${client.id}`);
                        }}
                        title="View Profile"
                        className="p-1.5 bg-zinc-800 rounded hover:bg-zinc-700 text-blue-400 transition"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    <button
                        onClick={(e) => handleWorkoutPlan(e, client.id)}
                        title="Workout Plan"
                        className="p-1.5 bg-zinc-800 rounded hover:bg-zinc-700 text-emerald-400 transition"
                    >
                        <Activity className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-white">Assigned Clients</h1>
            </div>

            <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Search clients by name, email or phone..."
            />

            <ReusableTable
                columns={columns}
                data={clients}
                isLoading={loading}
                onRowClick={(client) => navigate(`/trainer/clients/${client.id}`)}
            />

            <div className="flex justify-end mt-4">
                <Pagination
                    currentPage={page}
                    totalItems={totalItems}
                    limit={limit}
                    onPageChange={handlePageChange}
                    onLimitChange={handleLimitChange}
                />
            </div>
        </div>
    );
};

export default AssignedClientsPage;
