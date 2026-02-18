import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getTrainerById, softDeleteTrainer, sendWelcomeEmail } from  "../../../api/gym-trainers.api";;
import type { Trainer } from "../../../api/gym-trainers.api";
import { ArrowLeft, Loader2, Mail, Edit, Trash2, Info } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ViewTrainer: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [trainer, setTrainer] = useState<Trainer | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrainer = async () => {
            if (!id) return;
            try {
                const data = await getTrainerById(id);
                setTrainer(data);
            } catch (error) {
                console.error(error);
                toast.error('Trainer not found');
                navigate('/gym/trainers');
            } finally {
                setLoading(false);
            }
        };
        fetchTrainer();
    }, [id, navigate]);

    const handleDelete = async () => {
        if (!trainer || !window.confirm("Are you sure you want to delete this trainer?")) return;
        try {
            await softDeleteTrainer(trainer.id);
            toast.success("Trainer deleted successfully");
            navigate('/gym/trainers');
        } catch{
            toast.error("Failed to delete trainer");
        }
    };

    const handleSendWelcome = async () => {
        if (!trainer) return;
        try {
            await sendWelcomeEmail(trainer.id);
            toast.success("Welcome email sent!");
        } catch {
            toast.error("Failed to send email");
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    if (!trainer) return null;

    return (
        <div className="max-w-3xl mx-auto p-6 bg-zinc-900 border border-zinc-800 rounded-xl space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-2xl font-bold text-white">{trainer.fullName}</h1>
                    {trainer.isSuperTrainer && (
                        <span className="px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold">
                            Super Trainer
                        </span>
                    )}
                </div>

                <div className="flex gap-2">
                    <button onClick={handleSendWelcome} className="p-2 bg-zinc-800 rounded hover:bg-zinc-700 text-zinc-400 hover:text-white transition" title="Send Welcome Email">
                        <Mail className="w-4 h-4" />
                    </button>
                    <button onClick={() => navigate(`/gym/trainers/${trainer.id}/edit`)} className="p-2 bg-zinc-800 rounded hover:bg-zinc-700 text-amber-400 transition" title="Edit">
                        <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={handleDelete} className="p-2 bg-zinc-800 rounded hover:bg-zinc-700 text-red-400 transition" title="Delete">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                    <span className="text-sm font-medium text-zinc-500 block uppercase tracking-wider">Email</span>
                    <span className="text-white text-lg">{trainer.email}</span>
                </div>
                <div className="space-y-1">
                    <span className="text-sm font-medium text-zinc-500 block uppercase tracking-wider">Phone</span>
                    <span className="text-white text-lg">{trainer.phoneNumber}</span>
                </div>
                <div className="space-y-1">
                    <span className="text-sm font-medium text-zinc-500 block uppercase tracking-wider">Salary</span>
                    <span className="text-white text-lg">{trainer.salary ? `$${trainer.salary}` : 'N/A'}</span>
                </div>
                <div className="space-y-1">
                    <span className="text-sm font-medium text-zinc-500 block uppercase tracking-wider">Specialization</span>
                    <span className="text-white text-lg">{trainer.specialization || 'N/A'}</span>
                </div>
                <div className="space-y-1">
                    <span className="text-sm font-medium text-zinc-500 block uppercase tracking-wider">Date of Birth</span>
                    <span className="text-white text-lg">{trainer.dateOfBirth ? new Date(trainer.dateOfBirth).toLocaleDateString() : 'N/A'}</span>
                </div>
            </div>

            {trainer.isSuperTrainer && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-start gap-3">
                    <Info className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="text-white font-medium mb-1">Super Trainer Privileges Active</h3>
                        <p className="text-sm text-zinc-400">
                            This trainer has been granted advanced permissions to mark client attendance and setup weekly workout plans.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ViewTrainer;
