import React, { useEffect, useState } from 'react';
import { Shield, Monitor, Smartphone, Globe, Trash2, Clock, CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react';
import { securityApi } from '../../../api/security.api';
import type { SessionItem } from '../../../api/security.api';
import toast from 'react-hot-toast';

const SecurityPage: React.FC = () => {
    const [sessions, setSessions] = useState<SessionItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [confirmModal, setConfirmModal] = useState<{ show: boolean; sessionId: string | null }>({
        show: false,
        sessionId: null
    });

    const fetchSessions = async () => {
        try {
            setLoading(true);
            const response = await securityApi.getActiveSessions();
            if (response.status === 'success') {
                setSessions(response.data);
            }
        } catch (error: unknown) {
            let message = 'Failed to fetch sessions';
            if (error && typeof error === 'object' && 'response' in error) {
                 const axiosError = error as { response?: { data?: { message?: string } } };
                 message = axiosError.response?.data?.message || message;
            }
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    const handleRevoke = async () => {
        if (!confirmModal.sessionId) return;

        try {
            const response = await securityApi.revokeSession(confirmModal.sessionId);
            if (response.status === 'success') {
                toast.success('Session terminated successfully');
                setConfirmModal({ show: false, sessionId: null });
                fetchSessions();
            }
        } catch (error: unknown) {
            let message = 'Failed to revoke session';
            if (error && typeof error === 'object' && 'response' in error) {
                 const axiosError = error as { response?: { data?: { message?: string } } };
                 message = axiosError.response?.data?.message || message;
            }
            toast.error(message);
        }
    };

    const getDeviceIcon = (device: string) => {
        const lower = device.toLowerCase();
        if (lower.includes('mobi') || lower.includes('android') || lower.includes('iphone')) {
            return <Smartphone className="h-5 w-5 text-emerald-500" />;
        }
        return <Monitor className="h-5 w-5 text-emerald-500" />;
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    if (loading && sessions.length === 0) {
        return (
            <div className="flex h-full items-center justify-center bg-black/20">
                <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-emerald-500"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Shield className="h-6 w-6 text-emerald-500" />
                        Security & Sessions
                    </h1>
                    <p className="text-zinc-400 mt-1">Manage your active login sessions and security settings.</p>
                </div>
            </div>

            <div className="grid gap-4">
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-zinc-800 bg-zinc-800/30">
                        <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Active Sessions</h2>
                    </div>
                    <div className="divide-y divide-zinc-800">
                        {sessions.length === 0 ? (
                            <div className="p-8 text-center text-zinc-500">
                                <AlertCircle className="h-10 w-10 mx-auto mb-2 opacity-20" />
                                <p>No active sessions found.</p>
                            </div>
                        ) : (
                            sessions.map((session) => (
                                <div key={session.id} className="p-4 flex items-center justify-between hover:bg-zinc-800/20 transition-colors">
                                    <div className="flex items-start gap-4">
                                        <div className={`mt-1 p-2 rounded-lg ${session.isCurrent ? 'bg-emerald-500/20' : 'bg-zinc-800'}`}>
                                            {getDeviceIcon(session.device)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium text-white max-w-[200px] sm:max-w-md truncate">
                                                    {session.browser || session.device}
                                                </p>
                                                {session.isCurrent && (
                                                    <span className="text-[10px] bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full uppercase font-bold">
                                                        This Device
                                                    </span>
                                                )}
                                                {session.isRevoked ? (
                                                    <span className="text-[10px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full uppercase font-bold">
                                                        Revoked
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full uppercase font-bold">
                                                        Active Now
                                                    </span>
                                                )}
                                            </div>
                                            <div className="mt-1 flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-zinc-400">
                                                <span className="flex items-center gap-1 font-medium text-zinc-300">
                                                    {session.os || 'Unknown OS'} • {session.device}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Globe className="h-3 w-3" />
                                                    {session.ip}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    Last active: {formatDate(session.lastActive)}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    Logged in: {formatDate(session.createdAt)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {!session.isRevoked && (
                                        <button
                                            onClick={() => setConfirmModal({ show: true, sessionId: session.id })}
                                            className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                            title="Terminate Session"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                    <div>
                        <p className="text-sm font-medium text-emerald-400">Security Recommendation</p>
                        <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                            Terminate any sessions that you don't recognize. We recommend checking your active sessions regularly to keep your account safe.
                        </p>
                    </div>
                </div>
            </div>

            {/* Termination Modal */}
            {confirmModal.show && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in duration-200">
                        <div className="p-6 text-center space-y-4">
                            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
                                <AlertTriangle className="h-8 w-8 text-red-500" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white">Terminate Session?</h2>
                                <p className="text-zinc-400 text-sm mt-2">
                                    This will immediately logout the user on that device. If this is your current device, you will be signed out.
                                </p>
                            </div>
                        </div>
                        <div className="p-4 bg-zinc-800/50 border-t border-zinc-800 flex gap-3">
                            <button 
                                onClick={() => setConfirmModal({ show: false, sessionId: null })}
                                className="flex-1 py-2 rounded-lg border border-zinc-700 text-zinc-300 text-sm font-bold hover:bg-zinc-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleRevoke}
                                className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors"
                            >
                                Terminate
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SecurityPage;
