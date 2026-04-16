import React, { useState, useEffect } from 'react';
import { getCallHistory } from '../../api/chat.api';
import { Phone, Video, X, Clock, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface CallHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export interface CallHistoryEntry {
    _id: string;
    type: 'video' | 'audio';
    status: 'completed' | 'missed' | 'rejected' | 'failed';
    duration: number;
    startTime: string;
    endTime: string;
    otherUser: {
        id: string;
        name: string;
        avatar?: string;
    };
}

const CallHistoryModal: React.FC<CallHistoryModalProps> = ({ isOpen, onClose }) => {
    const [history, setHistory] = useState<CallHistoryEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            fetchHistory();
        }
    }, [isOpen]);

    const fetchHistory = async () => {
        setIsLoading(true);
        try {
            const data = await getCallHistory();
            setHistory(data);
        } catch (err) {
            console.error("Failed to fetch call history", err);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                                <Clock className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-bold text-white">Call History</h2>
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-500 hover:text-white transition-all"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
                                <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4" />
                                <p>Loading history...</p>
                            </div>
                        ) : history.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-zinc-500 text-center">
                                <Phone className="w-16 h-16 mb-4 opacity-20" />
                                <h3 className="text-lg font-semibold text-zinc-300 mb-1">No Call History</h3>
                                <p className="text-sm max-w-[200px]">Calls you make or receive will appear here.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {history.map((call) => {
                                    const isVideo = call.type === 'video';
                                    const Icon = isVideo ? Video : Phone;
                                    const isMissed = call.status === 'missed' || call.status === 'rejected';

                                    return (
                                        <div 
                                            key={call._id}
                                            className="flex items-center justify-between p-4 bg-zinc-800/30 border border-zinc-800 rounded-2xl hover:bg-zinc-800/50 transition-all group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    <div className="w-12 h-12 rounded-full bg-zinc-700 flex items-center justify-center overflow-hidden border border-zinc-600">
                                                        {call.otherUser?.avatar ? (
                                                            <img src={call.otherUser.avatar} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="text-emerald-400 font-bold">{call.otherUser?.name[0]}</span>
                                                        )}
                                                    </div>
                                                    <div className={`absolute -bottom-1 -right-1 p-1 rounded-full border-2 border-zinc-900 ${isMissed ? 'bg-red-500' : 'bg-emerald-500'}`}>
                                                        <Icon className="w-2 h-2 text-white" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-zinc-100">{call.otherUser?.name}</h4>
                                                    <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5">
                                                        <span className={isMissed ? 'text-red-400' : 'text-emerald-400 font-medium'}>
                                                            {isMissed ? 'Missed Call' : `${call.type.charAt(0).toUpperCase() + call.type.slice(1)} Call`}
                                                        </span>
                                                        <span>•</span>
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            {format(new Date(call.startTime), 'MMM d, HH:mm')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="text-right">
                                                {!isMissed && (
                                                    <div className="text-sm font-mono text-zinc-400">
                                                        {Math.floor(call.duration / 60)}:{String(call.duration % 60).padStart(2, '0')}
                                                    </div>
                                                )}
                                                <div className="text-[10px] text-zinc-600 uppercase tracking-wider mt-1 font-bold">
                                                    {isMissed ? 'No Response' : 'Connected'}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default CallHistoryModal;
