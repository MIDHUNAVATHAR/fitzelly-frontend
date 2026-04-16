import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Plus, Eye, Edit, Trash2, Mail, Loader, MessageCircle } from "lucide-react";
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
    const [limit, setLimit] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    const [clientToDelete, setClientToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);

    const debouncedSearch = useDebounceValue(search, 500);

    const loadClients = useCallback(async (pageNum: number, currentLimit: number, searchQuery: string, append: boolean = false) => {
        try {
            setLoading(true);
            const data = await getClients(pageNum, currentLimit, searchQuery);
            if (data.status != "success") {
                toast.error('Failed to load clients');
                return
            }
            if (append) {
                setClients(prev => [...prev, ...data.data.clients]);
            } else {
                setClients(data.data.clients);
            }
            setTotalItems(data.data.pagination.total);
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
        loadClients(1, limit, debouncedSearch, false);
    }, [debouncedSearch, limit, loadClients]);

    // Pagination (Desktop)
    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        loadClients(newPage, limit, debouncedSearch, false);
    };

    const handleLimitChange = (newLimit: number) => {
        setLimit(newLimit);
        setPage(1);
    };

    const handleDelete = (id: string) => {
        setClientToDelete(id);
    };

    const confirmDelete = async () => {
        if (!clientToDelete) return;

        setIsDeleting(true);
        try {
            await softDeleteClient(clientToDelete);
            toast.success("Client deleted successfully");
            loadClients(1, limit, debouncedSearch, false); // Reload
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
            accessor: (client) => {
                if (!client.membershipStatus) {
                    return <span className="text-zinc-500">N/A</span>;
                }
                return (
                    <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold
                            ${client.membershipStatus.toUpperCase() === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400' :
                                client.membershipStatus.toUpperCase() === 'PENDING' ? 'bg-amber-500/20 text-amber-400' :
                                    'bg-red-500/20 text-red-400'}`}>
                            {client.membershipStatus}
                        </span>
                    </div>
                );
            }
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
                            const clientId = client.id;
                            navigate(`/gym/messages`, { state: { selectUserId: clientId, selectUserName: client.fullName } });
                        }}
                        title="Chat"
                        className="p-1.5 bg-zinc-800 rounded hover:bg-zinc-700 text-emerald-400 transition"
                    >
                        <MessageCircle className="w-4 h-4" />
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
                isLoading={loading}
                onRowClick={(client) => navigate(`/gym/clients/${client.id}`)}
            />

            <div className="flex justify-end">
                <div className="w-full mt-4">
                    <Pagination
                        currentPage={page}
                        totalItems={totalItems}
                        limit={limit}
                        onPageChange={handlePageChange}
                        onLimitChange={handleLimitChange}
                    />
                </div>
            </div>

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