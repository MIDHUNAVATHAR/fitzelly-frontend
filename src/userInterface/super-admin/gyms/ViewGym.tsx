import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getGymById } from "../../../api/superAdmin-gyms.api";
import type { Gym } from "../../../api/superAdmin-gyms.api";
import { Loader2, ArrowLeft, Building2, MapPin, Phone, Mail, Calendar, ShieldCheck } from 'lucide-react';

const ViewGym: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [gym, setGym] = useState<Gym | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {

            if (!id) return;
            try {
                const data = await getGymById(id);
                setGym(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    const formatDate = (dateString?: string): string => {
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

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
    );

    if (!gym) return <div className="text-white">Gym not found</div>;

    const StatusBadge = ({ status }: { status: string; type: 'approval' | 'subscription' }) => {
        let colorClass = 'text-zinc-400 bg-zinc-800';
        if (status === 'Approved' || status === 'Active') colorClass = 'text-emerald-400 bg-emerald-400/10';
        if (status === 'Pending' || status === 'Trial') colorClass = 'text-amber-400 bg-amber-400/10';
        if (status === 'Rejected' || status === 'Expired') colorClass = 'text-red-400 bg-red-400/10';

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colorClass}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="w-full mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/super-admin/gyms')}
                    className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-zinc-400" />
                </button>
                <h1 className="text-2xl font-bold text-white">Gym Details</h1>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                {/* Gym Header / Logo */}
                <div className="bg-zinc-800/50 p-6 flex flex-col md:flex-row items-center md:items-start gap-6 border-b border-zinc-800">
                    <div className="w-24 h-24 rounded-xl bg-zinc-800 flex items-center justify-center border border-zinc-700">
                        {gym.logoUrl ? (
                            <img src={gym.logoUrl} alt={gym.gymName} className="w-full h-full object-cover rounded-xl" />
                        ) : (
                            <Building2 className="w-10 h-10 text-zinc-600" />
                        )}
                    </div>
                    <div className="flex-1 text-center md:text-left space-y-2">
                        <h2 className="text-2xl font-bold text-white">{gym.gymName}</h2>
                        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                            <StatusBadge status={gym.approvalStatus} type="approval" />
                            <StatusBadge status={gym.subscriptionStatus} type="subscription" />
                        </div>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="flex items-start gap-3 text-zinc-400">
                            <Mail className="w-5 h-5 mt-0.5 text-zinc-500" />
                            <div>
                                <p className="text-xs text-zinc-500 uppercase tracking-wider">Email</p>
                                <p className="text-white">{gym.email}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 text-zinc-400">
                            <Phone className="w-5 h-5 mt-0.5 text-zinc-500" />
                            <div>
                                <p className="text-xs text-zinc-500 uppercase tracking-wider">Phone</p>
                                <p className="text-white">{gym.phone}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 text-zinc-400">
                            <MapPin className="w-5 h-5 mt-0.5 text-zinc-500" />
                            <div>
                                <p className="text-xs text-zinc-500 uppercase tracking-wider">Address</p>
                                <p className="text-white">{gym.address}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-start gap-3 text-zinc-400">
                            <Calendar className="w-5 h-5 mt-0.5 text-zinc-500" />
                            <div>
                                <p className="text-xs text-zinc-500 uppercase tracking-wider">Joined Date</p>
                                <p className="text-white">{gym.createdAt ? formatDate(gym.createdAt) : 'N/A'}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 text-zinc-400">
                            <ShieldCheck className="w-5 h-5 mt-0.5 text-zinc-500" />
                            <div>
                                <p className="text-xs text-zinc-500 uppercase tracking-wider">Expiry Date</p>
                                <p className="text-white font-medium">{gym.expiryDate ? formatDate(gym.expiryDate) : 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewGym;