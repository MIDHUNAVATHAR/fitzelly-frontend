import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Calendar,
    Search,
    Clock,
} from 'lucide-react';
import { getDailyAttendanceReport,markManualAttendance } from '../../../api/attendance.api';
import type { DailyAttendanceRecord } from '../../../api/attendance.api';
import DateInput from '../../../components/ui/DateInput';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import { toast } from 'react-hot-toast';
import { socket } from '../../../config/socket';


const AttendanceManagement: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'CLIENT' | 'TRAINER'>('CLIENT');
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'All' | 'Present' | 'Pending'>('All');
    const [report, setReport] = useState<DailyAttendanceRecord[]>([]);
    const [gymId, setGymId] = useState<string | null>(null);

    // Modal State
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<{ userId: string; status: 'PRESENT' | 'ABSENT'; name: string } | null>(null);

    const fetchReport = useCallback(async () => {
        try {
            const response = await getDailyAttendanceReport(selectedDate, activeTab);
            if (response.status === 'success') {
                const reportData = response.data?.report || (Array.isArray(response.data) ? response.data : []);
                setReport(reportData);
                setGymId(response.data?.gymId || null);
            }
        } catch (error) {
            console.error('Error fetching attendance report:', error);
            toast.error('Failed to fetch attendance data');
        }
    }, [selectedDate, activeTab]);

    // Real-time updates
    useEffect(() => {
        if (!gymId) {
            console.log("No gymId provided, skipping socket connection");
            return;
        }

        console.log("Initializing socket for gym:", gymId);
        socket.connect();

        const handleConnect = () => {
            console.log("Socket connected, joining room:", `gym_${gymId}`);
            socket.emit('join-gym', gymId);
        };

        const handleUpdate = () => {
            console.log("Attendance update received! Refreshing report...");
            fetchReport();
        };

        socket.on('connect', handleConnect);
        socket.on('attendanceUpdated', handleUpdate);

        // If already connected, join immediately
        if (socket.connected) {
            handleConnect();
        }

        return () => {
            console.log("Cleaning up socket listeners...");
            socket.off('connect', handleConnect);
            socket.off('attendanceUpdated', handleUpdate);
            socket.disconnect();
        };
    }, [gymId, fetchReport]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    const filteredReport = useMemo(() => {
        const data = Array.isArray(report) ? report : [];
        return data.filter(record => {
            const matchesSearch = record.fullName.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'All'
                || (statusFilter === 'Present' && record.status === 'PRESENT')
                || (statusFilter === 'Pending' && record.status === 'PENDING');
            return matchesSearch && matchesStatus;
        });
    }, [report, searchQuery, statusFilter]);

    const stats = useMemo(() => {
        const data = Array.isArray(report) ? report : [];
        return {
            total: data.length,
            present: data.filter(r => r.status === 'PRESENT').length,
            absent: data.filter(r => r.status === 'ABSENT' || r.status === 'PENDING').length
        };
    }, [report]);

    const handleMarkAttendance = async () => {
        if (!pendingAction) return;
        try {
            const response = await markManualAttendance({
                userId: pendingAction.userId,
                date: selectedDate,
                status: pendingAction.status,
                userType: activeTab
            });
            if (response.status === 'success') {
                toast.success(`Marked ${pendingAction.name} as ${pendingAction.status}`);
                fetchReport();
                setIsConfirmModalOpen(false);
            }
        } catch {
            toast.error('Failed to update attendance');
        }
    };

    const triggerMarkAction = (userId: string, name: string, status: 'PRESENT' | 'ABSENT') => {
        setPendingAction({ userId, name, status });
        setIsConfirmModalOpen(true);
    };

    return (
        <div className="p-6 space-y-6 bg-zinc-950 min-h-screen text-white">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Attendance Management</h1>
                    <p className="text-zinc-400 text-sm mt-1">Track and manage daily attendance for clients and trainers</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative w-44">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 z-10 pointer-events-none" />
                        <DateInput
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="bg-zinc-900 border border-zinc-800 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-emerald-400 transition-colors text-zinc-400 w-full"
                        />
                    </div>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between">
                    <div>
                        <p className="text-zinc-400 text-xs font-medium tracking-wider uppercase">Total {activeTab === 'CLIENT' ? 'Clients' : 'Trainers'}</p>
                        <p className="text-2xl font-bold text-white">{stats.total}</p>
                    </div>
                </div>
                <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between">
                    <div>
                        <p className="text-zinc-400 text-xs font-medium tracking-wider uppercase">Present</p>
                        <p className="text-2xl font-bold text-emerald-400">{stats.present}</p>
                    </div>
                </div>
                <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between">
                    <div>
                        <p className="text-zinc-400 text-xs font-medium tracking-wider uppercase">Absent / Pending</p>
                        <p className="text-2xl font-bold text-red-400">{stats.absent}</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-zinc-800">
                <button
                    onClick={() => setActiveTab('CLIENT')}
                    className={`pb-4 px-2 text-sm font-medium transition-all relative ${activeTab === 'CLIENT' ? 'text-emerald-400' : 'text-zinc-500 hover:text-white'}`}
                >
                    Clients
                    {activeTab === 'CLIENT' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400" />}
                </button>
                <button
                    onClick={() => setActiveTab('TRAINER')}
                    className={`pb-4 px-2 text-sm font-medium transition-all relative ${activeTab === 'TRAINER' ? 'text-emerald-400' : 'text-zinc-500 hover:text-white'}`}
                >
                    Trainers
                    {activeTab === 'TRAINER' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400" />}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                <div className="lg:col-span-9">
                    {/* Filters & Table */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                        <div className="p-4 flex flex-wrap gap-4 items-center bg-zinc-900/50 border-b border-zinc-800">
                            <div className="relative flex-1 min-w-[200px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all"
                                />
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as any)}
                                className="bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-zinc-300 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all cursor-pointer"
                            >
                                <option value="All">All Statuses</option>
                                <option value="Present">Present</option>
                                <option value="Pending">Pending</option>
                            </select>
                        </div>
                        {/* Desktop Table - Hidden on Mobile */}
                        <table className="w-full text-left hidden md:table">
                            <thead className="bg-zinc-950 text-zinc-400 text-xs uppercase font-bold tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Check-In</th>
                                    <th className="px-6 py-4">Check-Out</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800 text-sm">
                                {filteredReport.map((record) => (
                                    <tr key={record.userId} className="hover:bg-zinc-900/40 transition-colors group">
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-white">{record.fullName}</p>
                                            <p className="text-[10px] text-zinc-500 uppercase flex items-center gap-1 mt-0.5">
                                                <span className="opacity-50 tracking-tighter">ID:</span>
                                                {record.clientId && record.clientId.trim() !== "" ? record.clientId : "N/A"}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs text-zinc-400 whitespace-nowrap">
                                            {record.logs && record.logs.length > 0 ? (
                                                <div className="flex flex-col gap-1">
                                                    {record.logs.map((log, idx) => (
                                                        <div key={idx}>{new Date(log.checkIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</div>
                                                    ))}
                                                </div>
                                            ) : record.checkIn}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs text-zinc-400 whitespace-nowrap">
                                            {record.logs && record.logs.length > 0 ? (
                                                <div className="flex flex-col gap-1">
                                                    {record.logs.map((log, idx) => (
                                                        <div key={idx}>{log.checkOut ? new Date(log.checkOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '--'}</div>
                                                    ))}
                                                </div>
                                            ) : record.checkOut || '--'}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold ${record.status === 'PRESENT' ? 'bg-emerald-500/10 text-emerald-400' : record.status === 'ABSENT' ? 'bg-red-500/10 text-red-400' : 'bg-zinc-800 text-zinc-500'}`}>
                                                {record.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex gap-2 justify-center">
                                                {record.status !== 'PRESENT' && (
                                                    <button onClick={() => triggerMarkAction(record.userId, record.fullName, 'PRESENT')} className="px-2 py-1 bg-emerald-500 text-black text-[10px] font-bold rounded">Present</button>
                                                )}
                                                {record.status !== 'ABSENT' && (
                                                    <button onClick={() => triggerMarkAction(record.userId, record.fullName, 'ABSENT')} className="px-2 py-1 bg-red-400/10 text-red-500 text-[10px] font-bold rounded">Absent</button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Mobile Cards - Hidden on Desktop */}
                        <div className="md:hidden divide-y divide-zinc-800">
                            {filteredReport.map((record) => (
                                <div key={record.userId} className="p-4 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-white text-base">{record.fullName}</p>
                                            <p className="text-[10px] text-zinc-500 uppercase">
                                                ID: {record.clientId && record.clientId.trim() !== "" ? record.clientId : "N/A"}
                                            </p>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${record.status === 'PRESENT' ? 'bg-emerald-500/10 text-emerald-400' : record.status === 'ABSENT' ? 'bg-red-500/10 text-red-400' : 'bg-zinc-800 text-zinc-500'}`}>
                                            {record.status}
                                        </span>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <div className="flex flex-col gap-2">
                                            <p className="text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-2 tracking-widest">
                                                <Clock className="w-3 h-3 text-emerald-400" /> Check-In Times
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {record.logs && record.logs.length > 0 ? (
                                                    record.logs.map((log, idx) => (
                                                        <span key={idx} className="px-2 py-1 bg-zinc-950 border border-zinc-800 rounded font-mono text-[10px] text-zinc-400">
                                                            {new Date(log.checkIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="px-2 py-1 bg-zinc-950 border border-zinc-800 rounded font-mono text-[10px] text-zinc-400">{record.checkIn}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <p className="text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-2 tracking-widest">
                                                <Clock className="w-3 h-3 text-red-400/50" /> Check-Out Times
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {record.logs && record.logs.length > 0 ? (
                                                    record.logs.map((log, idx) => (
                                                        <span key={idx} className="px-2 py-1 bg-zinc-950 border border-zinc-800 rounded font-mono text-[10px] text-zinc-400">
                                                            {log.checkOut ? new Date(log.checkOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '--'}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="px-2 py-1 bg-zinc-950 border border-zinc-800 rounded font-mono text-[10px] text-zinc-400">{record.checkOut || '--'}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 pt-2">
                                        {record.status !== 'PRESENT' && (
                                            <button
                                                onClick={() => triggerMarkAction(record.userId, record.fullName, 'PRESENT')}
                                                className="w-full py-2.5 bg-emerald-500 text-black text-xs font-bold rounded-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
                                            >
                                                Mark Present
                                            </button>
                                        )}
                                        {record.status !== 'ABSENT' && (
                                            <button
                                                onClick={() => triggerMarkAction(record.userId, record.fullName, 'ABSENT')}
                                                className="w-full py-2.5 bg-red-400/10 text-red-500 border border-red-500/20 text-xs font-bold rounded-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
                                            >
                                                Mark Absent
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-3 flex flex-col">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex-1 flex flex-col h-full min-h-[400px]">
                        <h3 className="font-bold text-white mb-4 flex items-center gap-2 shrink-0"><Clock className="w-4 h-4 text-emerald-400" /> Timeline</h3>
                        <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1 h-0">
                            {(() => {
                                // Flatten all logs into a single timeline array
                                const events: { time: string, message: string, timestamp: number }[] = [];

                                filteredReport.forEach(record => {
                                    if (record.logs && record.logs.length > 0) {
                                        record.logs.forEach(log => {
                                            // Handle Check-In
                                            if (log.checkIn) {
                                                const timeString = new Date(log.checkIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                                                events.push({
                                                    time: timeString,
                                                    message: `${record.fullName} checked in`,
                                                    timestamp: new Date(log.checkIn).getTime()
                                                });
                                            }
                                            // Handle Check-Out
                                            if (log.checkOut) {
                                                const timeString = new Date(log.checkOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                                                events.push({
                                                    time: timeString,
                                                    message: `${record.fullName} checked out`,
                                                    timestamp: new Date(log.checkOut).getTime()
                                                });
                                            }
                                        });
                                    } else {
                                        // Fallback to summary fields if logs are missing (for safety)
                                        if (record.checkIn && record.checkIn !== '--') {
                                            events.push({
                                                time: record.checkIn,
                                                message: `${record.fullName} checked in`,
                                                timestamp: new Date(`${selectedDate} ${record.checkIn}`).getTime()
                                            });
                                        }
                                        if (record.checkOut && record.checkOut !== '--') {
                                            events.push({
                                                time: record.checkOut,
                                                message: `${record.fullName} checked out`,
                                                timestamp: new Date(`${selectedDate} ${record.checkOut}`).getTime()
                                            });
                                        }
                                    }
                                });

                                // Sort events by time (latest first)
                                const sortedEvents = events.sort((a, b) => b.timestamp - a.timestamp);

                                if (sortedEvents.length === 0) {
                                    return (
                                        <div className="h-full flex flex-col items-center justify-center text-zinc-600 space-y-2 py-10 opacity-50">
                                            <Clock className="w-8 h-8" />
                                            <p className="text-[10px] font-medium uppercase tracking-widest">No Activity Yet</p>
                                        </div>
                                    );
                                }

                                return sortedEvents.map((event, i) => (
                                    <div key={i} className="text-xs border-l-2 border-emerald-400 pl-3 py-1 bg-zinc-900/50 rounded-r-md transition-all hover:bg-zinc-800/50">
                                        <p className="text-white font-medium">
                                            {event.message} <span className="text-emerald-400 ml-1">at {event.time}</span>
                                        </p>
                                    </div>
                                ));
                            })()}
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleMarkAttendance}
                title="Confirm Attendance"
                message={`Mark ${pendingAction?.name} as ${pendingAction?.status}?`}
                confirmText="Confirm"
                variant={pendingAction?.status === 'PRESENT' ? 'success' : 'danger'}
            />
        </div>
    );
};

export default AttendanceManagement;
