import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Activity } from "lucide-react";
import { toast } from "react-hot-toast";
import { getAssignedClients } from "../../../api/trainer-clients.api";
import type { ClientDTO } from "../../../api/trainer-clients.api";
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
    const [totalPages, setTotalPages] = useState(1);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    const debouncedSearch = useDebounceValue(search, 500);

    // Resize listener
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const loadClients = useCallback(async (pageNum: number, searchQuery: string, append: boolean = false) => {
        try {
            setLoading(true);
            const data = await getAssignedClients(pageNum, searchQuery);
            if (data.status !== "success") {
                toast.error('Failed to load assigned clients');
                return;
            }
            if (append) {
                setClients(prev => [...prev, ...data.data.clients]);
            } else {
                setClients(data.data.clients);
            }
            setTotalPages(data.totalPages);
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
        loadClients(1, debouncedSearch, false);
    }, [debouncedSearch, loadClients]);

    // Pagination (Desktop)
    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        loadClients(newPage, debouncedSearch, false);
    };

    // Infinite Scroll (Mobile)
    const handleScroll = useCallback(() => {
        if (!isMobile || loading || page >= totalPages) return;

        const container = document.getElementById('main-scroll-container');
        if (!container) return;

        // Check if scrolled to bottom
        if (container.scrollTop + container.clientHeight >= container.scrollHeight - 100) {
            const nextPage = page + 1;
            setPage(nextPage);
            loadClients(nextPage, debouncedSearch, true);
        }
    }, [isMobile, loading, page, totalPages, debouncedSearch, loadClients]);

    useEffect(() => {
        const container = document.getElementById('main-scroll-container');
        if (container) {
            container.addEventListener('scroll', handleScroll);
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, [handleScroll]);

    const handleWorkoutPlan = (e: React.MouseEvent, clientId: string) => {
        e.stopPropagation();
        toast.success(`Workout plan feature coming soon! (Client ID: ${clientId})`);
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
                isLoading={loading && page === 1} // Only show full loader on first page/search
                onRowClick={(client) => navigate(`/trainer/clients/${client.id}`)}
            />

            {loading && page > 1 && (
                <div className="text-center py-4 text-zinc-500">Loading more...</div>
            )}

            {/* Pagination only for Desktop */}
            {!isMobile && totalPages > 1 && (
                <div className="flex justify-end">
                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
            )}

        </div>
    );
};

export default AssignedClientsPage;
