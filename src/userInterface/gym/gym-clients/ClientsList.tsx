import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Plus, Eye, Edit, Trash2, Mail, Loader } from "lucide-react";
import { toast } from "react-hot-toast";
import { getClients, softDeleteClient, sendWelcomeEmail } from "../../../api/gym-clients.api";
import type { ClientDTO } from "../../../api/gym-clients.api";
import ReusableTable from "../../../components/ui/ReusableTable";
import type { Column } from "../../../components/ui/ReusableTable";
import SearchInput from "../../../components/ui/SearchInput";
import Pagination from "../../../components/ui/Pagination";
import ConfirmModal from "../../../components/ui/ConfirmModal";


//debounce function
function useDebounceValue<T>(value: T, delay: number): T {
    const [debounceValue, setDebounceValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebounceValue(value), delay);
        return () => clearTimeout(handler)
    }, [value, delay]);
    return debounceValue;
}

const ClientsList: React.FC = () => {
    const navigate = useNavigate();
    const [clients, setClients] = useState<ClientDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    const [clientToDelete, setClientToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);

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
            const data = await getClients(pageNum, searchQuery);
            if (data.status != "success") {
                toast.error('Failed to load clients');
                return
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


    const handleDelete = (id: string) => {
        setClientToDelete(id);
    };

    const confirmDelete = async () => {
        if (!clientToDelete) return;

        setIsDeleting(true);
        try {
            await softDeleteClient(clientToDelete);
            toast.success("Client deleted successfully");
            loadClients(1, debouncedSearch, false); // Reload
        } catch {
            toast.error("Failed to delete client");
        } finally {
            setIsDeleting(false);
            setClientToDelete(null);
        }
    };

    const handleSendWelcome = async (client: ClientDTO, e: React.MouseEvent) => {
        e.stopPropagation();
        if (client.isEmailVerified) {
            toast.error("Already verified");
            return;
        }

        setSendingEmailId(client.id);
        try {
            await sendWelcomeEmail(client.id);
            toast.success("Welcome email sent!");
        } catch {
            toast.error("Failed to send email");
        } finally {
            setSendingEmailId(null);
        }
    }

    const columns: Column<ClientDTO>[] = [
        { header: 'Full Name', accessor: 'fullName' },
        { header: 'Current Plan', accessor: (client) => client.currentPlan || 'N/A' },
        { header: 'Email', accessor: 'email' },
        { header: 'Phone', accessor: 'phoneNumber' },
        {
            header: 'Membership Status',
            accessor: (client) => (
                <span className={`px-2 py-1 rounded text-xs font-semibold
          ${client.membershipStatus === 'Active' ? 'bg-green-500/20 text-green-400' :
                        client.membershipStatus === 'Pending' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'}`}>
                    {client.membershipStatus}
                </span>
            )
        },
        {
            header: 'Actions',
            accessor: (client) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => handleSendWelcome(client, e)}
                        disabled={sendingEmailId === client.id}
                        title={client.isEmailVerified ? "Already verified" : "Send Welcome Email"}
                        className={`p-1.5 rounded transition ${client.isEmailVerified ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white'}`}
                    >
                        {sendingEmailId === client.id ? <Loader className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/gym/clients/${client.id}`);
                        }}
                        title="View"
                        className="p-1.5 bg-zinc-800 rounded hover:bg-zinc-700 text-blue-400 transition"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/gym/clients/${client.id}/edit`, {
                                state: { enableEditing: true }
                            });
                        }}
                        title="Edit"
                        className="p-1.5 bg-zinc-800 rounded hover:bg-zinc-700 text-amber-400 transition"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(client.id) }}
                        title="Delete"
                        className="p-1.5 bg-zinc-800 rounded hover:bg-zinc-700 text-red-400 transition"
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
                <h1 className="text-2xl font-bold text-white">Clients</h1>
                <Link
                    to="/gym/clients/add"
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors font-semibold"
                >
                    <Plus className="w-5 h-5" />
                    Add Client
                </Link>
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
                onRowClick={(client) => navigate(`/gym/clients/${client.id}`)}
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

            <ConfirmModal
                isOpen={!!clientToDelete}
                onClose={() => setClientToDelete(null)}
                onConfirm={confirmDelete}
                title="Delete Client"
                message="Are you sure you want to delete this client? This action can be undone later."
                isProcessing={isDeleting}
            />
        </div>
    );
};

export default ClientsList;