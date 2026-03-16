import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Trash2, Save, Loader2, Dumbbell, X, Edit2, NotebookPen, Quote, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
// import { getClientWorkoutPlan, createOrUpdateWorkoutPlan } from '../../../api/workout-plan.api';
import  { getClientWorkoutPlan,createOrUpdateWorkoutPlan } from '../../../api/workout-plan.api';
import type { IDayPlan, IExercise } from '../../../api/workout-plan.api';

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const WorkoutPlanPage: React.FC = () => {
    const { id: clientId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [weeklyPlan, setWeeklyPlan] = useState<IDayPlan[]>(
        DAYS.map(day => ({ day, exercises: [] }))
    );
    const [notes, setNotes] = useState("");

    // Modal state for Exercises
    const [showExModal, setShowExModal] = useState(false);
    const [exModalMode, setExModalMode] = useState<'add' | 'edit'>('add');
    const [activeDayIdx, setActiveDayIdx] = useState<number | null>(null);
    const [activeExIdx, setActiveExIdx] = useState<number | null>(null);
    const [exForm, setExForm] = useState({ name: '', sets: '', reps: '' });

    // Modal state for Notes
    const [showNotesModal, setShowNotesModal] = useState(false);
    const [notesForm, setNotesForm] = useState("");

    // Confirm Modal state
    const [confirmModal, setConfirmModal] = useState<{
        show: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        type: 'danger' | 'warning';
    }>({
        show: false,
        title: '',
        message: '',
        onConfirm: () => { },
        type: 'danger'
    });

    useEffect(() => {
        const fetchPlan = async () => {
            if (!clientId) return;
            try {
                const response = await getClientWorkoutPlan(clientId);
                if (response.data && response.data.weeklyPlan) {
                    const existingDays = response.data.weeklyPlan;
                    const fullPlan = DAYS.map(day => {
                        const existingDay = existingDays.find((d: IDayPlan) => d.day === day);
                        return existingDay || { day, exercises: [] };
                    });
                    setWeeklyPlan(fullPlan);
                    setNotes(response.data.notes || "");
                }
            } catch (error) {
                console.error("Error fetching plan:", error);
                toast.error("Failed to load existing workout plan");
            } finally {
                setLoading(false);
            }
        };
        fetchPlan();
    }, [clientId]);

    const saveChanges = async (updatedPlan: IDayPlan[], updatedNotes: string) => {
        if (!clientId) return;
        try {
            setSaving(true);
            await createOrUpdateWorkoutPlan({
                clientId,
                weeklyPlan: updatedPlan,
                notes: updatedNotes
            });
        } catch (error) {
            console.error("Error saving plan:", error);
            toast.error("Failed to sync changes with server");
        } finally {
            setSaving(false);
        }
    };

    // Exercise Handlers
    const handleOpenExAdd = (dayIdx: number) => {
        setExModalMode('add');
        setActiveDayIdx(dayIdx);
        setActiveExIdx(null);
        setExForm({ name: '', sets: '', reps: '' });
        setShowExModal(true);
    };

    const handleOpenExEdit = (dayIdx: number, exIdx: number) => {
        const ex = weeklyPlan[dayIdx].exercises[exIdx];
        setExModalMode('edit');
        setActiveDayIdx(dayIdx);
        setActiveExIdx(exIdx);
        setExForm({ name: ex.name, sets: ex.sets, reps: ex.reps });
        setShowExModal(true);
    };

    const confirmRemoveEx = (dayIdx: number, exIdx: number) => {
        const exName = weeklyPlan[dayIdx].exercises[exIdx].name;
        setConfirmModal({
            show: true,
            title: 'Remove Exercise',
            message: `Are you sure you want to remove "${exName || 'this exercise'}" from the plan?`,
            type: 'danger',
            onConfirm: () => handleRemoveEx(dayIdx, exIdx)
        });
    };

    const handleRemoveEx = async (dayIdx: number, exIdx: number) => {
        const newPlan = [...weeklyPlan];
        newPlan[dayIdx].exercises.splice(exIdx, 1);
        setWeeklyPlan(newPlan);
        setConfirmModal(prev => ({ ...prev, show: false }));
        toast.info("Exercise removed");
        await saveChanges(newPlan, notes);
    };

    const handleSaveEx = async () => {
        if (!exForm.name.trim()) {
            toast.error("Exercise name is required");
            return;
        }
        const newPlan = [...weeklyPlan];
        if (activeDayIdx === null) return;
        if (exModalMode === 'add') {
            const newEx: IExercise = { id: Math.random().toString(36).substr(2, 9), ...exForm };
            newPlan[activeDayIdx].exercises.push(newEx);
        } else if (activeExIdx !== null) {
            newPlan[activeDayIdx].exercises[activeExIdx] = { ...newPlan[activeDayIdx].exercises[activeExIdx], ...exForm };
        }
        setWeeklyPlan(newPlan);
        setShowExModal(false);
        toast.success(exModalMode === 'add' ? "Exercise added" : "Exercise updated");
        await saveChanges(newPlan, notes);
    };

    // Note Handlers
    const handleOpenNotes = () => {
        setNotesForm(notes);
        setShowNotesModal(true);
    };

    const handleSaveNotes = async () => {
        setNotes(notesForm);
        setShowNotesModal(false);
        await saveChanges(weeklyPlan, notesForm);
        toast.success("Instructions updated!");
    };

    const confirmDeleteNotes = () => {
        setConfirmModal({
            show: true,
            title: 'Clear Instructions',
            message: 'Are you sure you want to delete all trainer instructions and guidance? This action cannot be undone.',
            type: 'danger',
            onConfirm: handleDeleteNotes
        });
    };

    const handleDeleteNotes = async () => {
        setNotes("");
        setConfirmModal(prev => ({ ...prev, show: false }));
        await saveChanges(weeklyPlan, "");
        toast.info("Instructions cleared");
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                <p className="text-zinc-400">Loading workout plan...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20 w-full px-2 sm:px-4">
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
                >
                    <ChevronLeft size={20} />
                    <span>Back to Client</span>
                </button>
                {saving && (
                    <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-black animate-pulse">
                        <Loader2 size={12} className="animate-spin" />
                        SYNCING...
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Dumbbell className="text-emerald-400" />
                    Weekly Workout Plan
                </h1>
                <p className="text-zinc-400 text-sm">Design routines and provide guidance. Everything syncs automatically.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">

                {/* 1. Trainer Instructions Card */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col h-full overflow-hidden group">
                    <div className="p-4 bg-zinc-800/30 border-b border-zinc-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <NotebookPen size={18} className="text-emerald-400" />
                            <h3 className="text-lg font-bold text-white tracking-wide uppercase">Trainer's Notes</h3>
                        </div>
                        {!notes ? (
                            <button
                                onClick={handleOpenNotes}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 text-emerald-400 hover:bg-zinc-700 rounded-lg text-sm font-semibold transition-all border border-zinc-700"
                            >
                                <Plus size={16} />
                                Add Note
                            </button>
                        ) : (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleOpenNotes}
                                    className="p-1.5 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-md transition-all"
                                    title="Edit Notes"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={confirmDeleteNotes}
                                    className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-all"
                                    title="Delete Notes"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="p-6 flex-1 flex flex-col relative">
                        {notes ? (
                            <div className="relative">
                                <Quote className="absolute -top-2 -left-2 w-8 h-8 text-white/5" />
                                <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap font-medium pl-4 border-l-2 border-emerald-500/30">
                                    {notes}
                                </p>
                            </div>
                        ) : (
                            <div className="h-full py-10 flex flex-col items-center justify-center border-2 border-dashed border-zinc-800/50 rounded-xl bg-zinc-950/20 text-center px-4">
                                <NotebookPen size={32} className="text-zinc-800 mb-3" />
                                <p className="text-zinc-600 text-xs font-semibold italic">No general instructions or dietary tips assigned yet.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. Days of the Week */}
                {weeklyPlan.map((dayPlan, dayIndex) => (
                    <div key={dayPlan.day} className="bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col overflow-hidden">
                        <div className="p-4 bg-zinc-800/30 border-b border-zinc-800 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white tracking-wide uppercase">{dayPlan.day}</h3>
                            <button
                                onClick={() => handleOpenExAdd(dayIndex)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 text-emerald-400 hover:bg-zinc-700 rounded-lg text-sm font-semibold transition-all border border-zinc-700"
                            >
                                <Plus size={16} />
                                Add
                            </button>
                        </div>

                        <div className="p-4 flex-1">
                            {dayPlan.exercises.length === 0 ? (
                                <div className="h-full py-10 flex flex-col items-center justify-center border-2 border-dashed border-zinc-800/50 rounded-xl bg-zinc-950/20">
                                    <p className="text-zinc-600 text-xs font-medium italic">No exercises scheduled.</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {dayPlan.exercises.map((exercise, exIndex) => (
                                        <div key={exercise.id} className="flex items-center justify-between gap-4 p-3 bg-zinc-950/40 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors group">
                                            <div className="flex-1">
                                                <h4 className="font-bold text-white text-sm">{exercise.name}</h4>
                                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">
                                                    {exercise.sets || '0'} sets × {exercise.reps || '0'} reps
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleOpenExEdit(dayIndex, exIndex)}
                                                    className="p-1.5 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-md transition-all"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => confirmRemoveEx(dayIndex, exIndex)}
                                                    className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-all"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Exercise Modal */}
            {showExModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm flex flex-col shadow-2xl overflow-hidden scale-in-center transition-transform">
                        <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950/50">
                            <h2 className="text-base font-bold text-white flex items-center gap-2">
                                <Plus size={18} className="text-emerald-400" />
                                {exModalMode === 'add' ? 'Add Exercise' : 'Edit Exercise'}
                            </h2>
                            <button
                                onClick={() => setShowExModal(false)}
                                className="text-zinc-500 hover:text-white p-1 hover:bg-zinc-800 rounded-md"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-5 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Exercise Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Barbell Squats"
                                    value={exForm.name}
                                    onChange={(e) => setExForm({ ...exForm, name: e.target.value })}
                                    autoFocus
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500/50"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Sets</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 4"
                                        value={exForm.sets}
                                        onChange={(e) => setExForm({ ...exForm, sets: e.target.value })}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500/50"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Reps / Time</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 12"
                                        value={exForm.reps}
                                        onChange={(e) => setExForm({ ...exForm, reps: e.target.value })}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500/50"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-zinc-950/30 border-t border-zinc-800 flex gap-3">
                            <button
                                onClick={() => setShowExModal(false)}
                                className="flex-1 py-2 rounded-lg border border-zinc-800 text-zinc-400 text-sm font-bold hover:bg-zinc-800 hover:text-white transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveEx}
                                className="flex-1 py-2 rounded-lg bg-emerald-500 text-black text-sm font-extrabold hover:bg-emerald-400 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                            >
                                {saving ? <Loader2 size={16} className="animate-spin m-auto" /> : (exModalMode === 'add' ? 'Add' : 'Update')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Notes Modal */}
            {showNotesModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg flex flex-col shadow-2xl overflow-hidden scale-in-center transition-transform">
                        <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950/50">
                            <h2 className="text-base font-bold text-white flex items-center gap-2">
                                <NotebookPen size={18} className="text-emerald-400" />
                                Trainer's Instructions
                            </h2>
                            <button
                                onClick={() => setShowNotesModal(false)}
                                className="text-zinc-500 hover:text-white p-1 hover:bg-zinc-800 rounded-md"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-5 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Note Content</label>
                                <textarea
                                    placeholder="Add general instructions, dietary tips, or week-specific focus here..."
                                    value={notesForm}
                                    onChange={(e) => setNotesForm(e.target.value)}
                                    autoFocus
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500/50 min-h-[200px] resize-none"
                                />
                            </div>
                        </div>

                        <div className="p-4 bg-zinc-950/30 border-t border-zinc-800 flex gap-3">
                            <button
                                onClick={() => setShowNotesModal(false)}
                                className="flex-1 py-2 rounded-lg border border-zinc-800 text-zinc-400 text-sm font-bold hover:bg-zinc-800 hover:text-white transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveNotes}
                                disabled={saving}
                                className="flex-1 py-2 rounded-lg bg-emerald-500 text-black text-sm font-extrabold hover:bg-emerald-400 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] flex items-center justify-center"
                            >
                                {saving ? <Loader2 size={16} className="animate-spin" /> : 'Save Instructions'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {confirmModal.show && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-sm flex flex-col shadow-2xl overflow-hidden scale-in-center">
                        <div className="p-8 text-center">
                            <div className={`w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center ${confirmModal.type === 'danger' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'
                                }`}>
                                <AlertTriangle size={32} />
                            </div>
                            <h2 className="text-xl font-bold text-white mb-3">{confirmModal.title}</h2>
                            <p className="text-zinc-400 text-sm leading-relaxed">
                                {confirmModal.message}
                            </p>
                        </div>

                        <div className="p-6 bg-zinc-950/50 border-t border-zinc-800 flex gap-3">
                            <button
                                onClick={() => setConfirmModal(prev => ({ ...prev, show: false }))}
                                className="flex-1 py-3 rounded-2xl border border-zinc-800 text-zinc-400 text-sm font-bold hover:bg-zinc-800 hover:text-white transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmModal.onConfirm}
                                className={`flex-1 py-3 rounded-2xl text-white text-sm font-black transition-all shadow-lg ${confirmModal.type === 'danger' ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' : 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20'
                                    }`}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkoutPlanPage;
