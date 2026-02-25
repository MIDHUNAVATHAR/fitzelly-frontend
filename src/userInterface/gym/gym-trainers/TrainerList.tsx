
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ReusableTable from '../../../components/ui/ReusableTable';
import type { Column } from '../../../components/ui/ReusableTable';
import SearchInput from '../../../components/ui/SearchInput';
import Pagination from '../../../components/ui/Pagination';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import { Plus, Mail, Eye, Edit, Trash2, Loader } from 'lucide-react';
import { getTrainers, softDeleteTrainer, sendWelcomeEmail } from "../../../api/gym-trainers.api";
import type { Trainer } from "../../../api/gym-trainers.api";
import { toast } from 'react-hot-toast';

const TrainersList: React.FC = () => {
    const navigate = useNavigate();
    const [trainers, setTrainers] = useState<Trainer[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // For infinite scroll
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    const [trainerToDelete, setTrainerToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const loadTrainers = useCallback(async (page: number, searchTerm: string, append: boolean = false) => {
        try {
            setLoading(true);
            const data = await getTrainers(page, searchTerm);
            setTrainers(prev => append ? [...prev, ...data.trainers] : data.trainers);
            setTotalPages(data?.totalPages);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load trainers');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        setCurrentPage(1); // Reset to page 1 on search change
        loadTrainers(1, search, false);
    }, [search, loadTrainers]);

    useEffect(() => {
        if (!isMobile) {
            loadTrainers(currentPage, search, false);
        }
    }, [currentPage, isMobile, loadTrainers, search]);


    // Infinite Scroll Handler
    const handleScroll = useCallback(() => {
        if (!isMobile || loading || currentPage >= totalPages) return;

        const container = document.getElementById('main-scroll-container');
        if (!container) return;

        const { scrollTop, scrollHeight, clientHeight } = container;

        // Trigger when close to bottom
        if (scrollTop + clientHeight >= scrollHeight - 50) {
            const nextPage = currentPage + 1;
            setCurrentPage(nextPage);
            loadTrainers(nextPage, search, true);
        }
    }, [isMobile, loading, currentPage, totalPages, loadTrainers, search]);

    useEffect(() => {
        const container = document.getElementById('main-scroll-container');
        if (container) {
            container.addEventListener('scroll', handleScroll);
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, [handleScroll]);


    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setTrainerToDelete(id);
    }

    const confirmDelete = async () => {
        if (!trainerToDelete) return;

        setIsDeleting(true);
        try {
            await softDeleteTrainer(trainerToDelete);
            toast.success("Trainer deleted");
            loadTrainers(1, search, false); // Reload
            setCurrentPage(1);
        } catch {
            toast.error("Failed to delete trainer");
        } finally {
            setIsDeleting(false);
            setTrainerToDelete(null);
        }
    }

    const handleSendWelcome = async (trainer: Trainer, e: React.MouseEvent) => {
        e.stopPropagation();
        if (trainer.isEmailVerified) {
            toast.error("Already verified");
            return;
        }

        setSendingEmailId(trainer.id!);
        try {
            await sendWelcomeEmail(trainer.id!);
            toast.success("Welcome email sent");
        } catch {
            toast.error("Failed to send email");
        } finally {
            setSendingEmailId(null);
        }
    }


    const columns: Column<Trainer>[] = [
        { header: 'Full Name', accessor: 'fullName' },
        { header: 'Email', accessor: 'email' },
        { header: 'Phone', accessor: 'phoneNumber' },
        { header: 'Specialization', accessor: (trainer) => trainer.specialization || 'N/A' },
        {
            header: 'Salary',
            accessor: (trainer) => trainer.salary ? `${trainer.salary}` : '-'
        },
        {
            header: 'Actions',
            accessor: (trainer) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => handleSendWelcome(trainer, e)}
                        disabled={sendingEmailId === trainer.id}
                        className={`p-1.5 rounded transition ${trainer.isEmailVerified ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white'}`}
                        title={trainer.isEmailVerified ? "Already verified" : "Send Welcome Email"}
                    >
                        {sendingEmailId === trainer.id ? <Loader className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/gym/trainers/${trainer.id}`) }}
                        className="p-1.5 bg-zinc-800 rounded hover:bg-zinc-700 text-blue-400 transition"
                        title="View"
                    >
                        <Eye className="w-4 h-4" />
                    </button>

                    <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/gym/trainers/${trainer.id}/edit`) }}
                        className="p-1.5 bg-zinc-800 rounded hover:bg-zinc-700 text-amber-400 transition"
                        title="Edit"
                    >
                        <Edit className="w-4 h-4" />
                    </button>

                    <button
                        onClick={(e) => handleDelete(trainer.id!, e)}
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
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-white">Trainers</h1>
                <Link
                    to="/gym/trainers/add"
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors font-semibold"
                >
                    <Plus className="w-5 h-5" />
                    Add Trainer
                </Link>
            </div>

            <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Search trainers..."
            />

            <ReusableTable
                data={trainers}
                columns={columns}
                isLoading={loading}
                onRowClick={(trainer) => navigate(`/gym/trainers/${trainer.id}`)}
            />

            {!isMobile && totalPages > 1 && (
                <div className="flex justify-end">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
            )}

            <ConfirmModal
                isOpen={!!trainerToDelete}
                onClose={() => setTrainerToDelete(null)}
                onConfirm={confirmDelete}
                title="Delete Trainer"
                message="Are you sure you want to delete this trainer? This action can be undone later."
                isProcessing={isDeleting}
            />
        </div>
    );
};

export default TrainersList;
