import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getClientById } from "../../../api/gym-clients.api";
import type { Client } from "../../../api/gym-clients.api";
import { ArrowLeft, Loader2, Mail, Edit, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { softDeleteClient, sendWelcomeEmail } from "../../../api/gym-clients.api";

const ViewClient: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [client, setClient] = useState<Client | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClient = async () => {
            if (!id) return;
            try {
                const data = await getClientById(id);
                setClient(data);
            } catch (error) {
                console.error(error);
                toast.error('Client not found');
                navigate('/gym/clients');
            } finally {
                setLoading(false);
            }
        };
        fetchClient();
    }, [id, navigate]);

    const handleDelete = async () => {
        if (!client || !window.confirm("Are you sure you want to delete this client?")) return;
        try {
            await softDeleteClient(client.id);
            toast.success("Client deleted successfully");
            navigate('/gym/clients');
        } catch {
            toast.error("Failed to delete client");
        }
    };

    const handleSendWelcome = async () => {
        if (!client) return;
        try {
            await sendWelcomeEmail(client.id);
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

    if (!client) return null;

    return (
        <div className="max-w-3xl mx-auto p-6 bg-zinc-900 border border-zinc-800 rounded-xl space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-2xl font-bold text-white">{client.fullName}</h1>
                </div>

                <div className="flex gap-2">
                    <button onClick={handleSendWelcome} className="p-2 bg-zinc-800 rounded hover:bg-zinc-700 text-zinc-400 hover:text-white transition" title="Send Welcome Email">
                        <Mail className="w-4 h-4" />
                    </button>
                    <button onClick={() => navigate(`/gym/clients/${client.id}/edit`)} className="p-2 bg-zinc-800 rounded hover:bg-zinc-700 text-amber-400 transition" title="Edit">
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
                    <span className="text-white text-lg">{client.email}</span>
                </div>
                <div className="space-y-1">
                    <span className="text-sm font-medium text-zinc-500 block uppercase tracking-wider">Phone</span>
                    <span className="text-white text-lg">{client.phoneNumber}</span>
                </div>

                <div className="space-y-1">
                    <span className="text-sm font-medium text-zinc-500 block uppercase tracking-wider">Date of Birth</span>
                    <span className="text-white text-lg">{client.dateOfBirth ? new Date(client.dateOfBirth).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="space-y-1">
                    <span className="text-sm font-medium text-zinc-500 block uppercase tracking-wider">Emergency Contact</span>
                    <span className="text-white text-lg">{client.emergencyContact || 'N/A'}</span>
                </div>
                <div className="space-y-1">
                    <span className="text-sm font-medium text-zinc-500 block uppercase tracking-wider">Contact Person</span>
                    <span className="text-white text-lg">{client.contactPerson || 'N/A'}</span>
                </div>
                <div className="space-y-1">
                    <span className="text-sm font-medium text-zinc-500 block uppercase tracking-wider">Current Plan</span>
                    <span className="text-white text-lg">{client.currentPlan || 'N/A'}</span>
                </div>
                <div className="space-y-1">
                    <span className="text-sm font-medium text-zinc-500 block uppercase tracking-wider">Membership Status</span>
                    <span className={`px-2 py-1 rounded text-sm font-semibold inline-block
                        ${client.membershipStatus === 'Active' ? 'bg-green-500/20 text-green-400' :
                            client.membershipStatus === 'Pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-red-500/20 text-red-400'}`}>
                        {client.membershipStatus}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ViewClient;
