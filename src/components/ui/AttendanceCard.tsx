import React, { useState, useEffect } from 'react';
import { Clock, LogIn, LogOut, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getTodayAttendance, markAttendance } from '../../api/attendance.api';
import type { AttendanceDTO } from '../../api/attendance.api';
import ConfirmModal from '../ui/ConfirmModal';

interface AttendanceCardProps {
    gymId: string;
}

const AttendanceCard: React.FC<AttendanceCardProps> = ({ gymId }) => {
    const [attendance, setAttendance] = useState<AttendanceDTO | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<'CHECK_IN' | 'CHECK_OUT' | null>(null);

    const fetchAttendance = async () => {
        try {
            const response = await getTodayAttendance();
            if (response.status === 'success') {
                setAttendance(response.data);
            }
        } catch (error) {
            console.error('Error fetching attendance:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendance();
    }, []);

    const getCurrentPosition = (): Promise<GeolocationPosition> => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error("Geolocation is not supported by your browser."));
                return;
            }
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            });
        });
    };

    const handleAction = async (action: 'CHECK_IN' | 'CHECK_OUT') => {
        try {
            setIsActionLoading(true);

            let locationData = {};
            try {
                const position = await getCurrentPosition();
                locationData = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                };
            } catch (err: any) {
                let errorMsg = "Could not get your location. Please enable GPS.";
                if (err.code === 1) errorMsg = "Please allow location access to continue.";
                throw new Error(errorMsg);
            }

            const response = await markAttendance({
                action,
                gymId,
                ...locationData
            });

            if (response.status === 'success') {
                toast.success(response.message);
                setAttendance(response.data);
                setIsConfirmModalOpen(false);
            }
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || 'Failed to update attendance';
            toast.error(message, { duration: 4000 });
        } finally {
            setIsActionLoading(false);
        }
    };

    const triggerAction = (action: 'CHECK_IN' | 'CHECK_OUT') => {
        setPendingAction(action);
        setIsConfirmModalOpen(true);
    };

    const lastLog = attendance?.logs && attendance.logs.length > 0
        ? attendance.logs[attendance.logs.length - 1]
        : null;
    const isCheckedIn = !!(lastLog && !lastLog.checkOut);

    if (isLoading) {
        return (
            <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center min-h-[140px] gap-3">
                <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
                <p className="text-zinc-500 text-sm font-medium">Loading status...</p>
            </div>
        );
    }

    return (
        <>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-sm text-white overflow-hidden transition-all hover:border-zinc-700">
                <div className="p-5 flex flex-col md:flex-row items-center justify-between gap-5">
                    {/* Left side: Header & Status */}
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center shadow-inner transition-colors duration-300 ${isCheckedIn ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-500'}`}>
                            <Clock className={`w-6 h-6 ${isCheckedIn ? 'animate-pulse' : ''}`} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold tracking-tight">Today's Attendance</h3>
                            <div className="flex items-center mt-0.5">
                                {isCheckedIn ? (
                                    <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 uppercase tracking-wide">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                                        Active Session
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                                        Not Checked In
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right side: Actions */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                        {/* Session Timeline Summary */}
                        {attendance && attendance.logs.length > 0 && (
                            <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 overflow-hidden px-2">
                                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mr-1 hidden sm:inline">Timeline:</span>
                                {attendance.logs.slice(-2).map((log, index) => (
                                    <div key={index} className="flex items-center gap-1.5 text-[11px] font-medium bg-zinc-800/50 border border-zinc-700/50 px-2 py-1 rounded-md text-zinc-400">
                                        <span>{new Date(log.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        <span className="text-zinc-600">→</span>
                                        {log.checkOut ? (
                                            <span>{new Date(log.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        ) : (
                                            <span className="text-emerald-500 text-[10px] font-bold">Now</span>
                                        )}
                                    </div>
                                )).reverse()}
                                {attendance.logs.length > 2 && <span className="text-xs text-zinc-600 font-bold">+{attendance.logs.length - 2}</span>}
                            </div>
                        )}

                        <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                            {!isCheckedIn ? (
                                <button
                                    onClick={() => triggerAction('CHECK_IN')}
                                    disabled={isActionLoading}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-bold rounded-lg transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                                    Check In
                                </button>
                            ) : (
                                <button
                                    onClick={() => triggerAction('CHECK_OUT')}
                                    disabled={isActionLoading}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-zinc-100 hover:bg-white text-black text-sm font-bold rounded-lg transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                                    Check Out
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={() => pendingAction && handleAction(pendingAction)}
                title={pendingAction === 'CHECK_IN' ? 'Check In Confirmation' : 'Check Out Confirmation'}
                message="Make sure you are at the gym."
                isProcessing={isActionLoading}
                confirmText={pendingAction === 'CHECK_IN' ? 'Confirm Check In' : 'Confirm Check Out'}
                variant={pendingAction === 'CHECK_IN' ? 'success' : 'primary'}
            />
        </>
    );
};

export default AttendanceCard;
