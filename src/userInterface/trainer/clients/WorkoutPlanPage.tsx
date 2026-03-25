import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ChevronLeft, 
    Plus, 
    Trash2, 
    Loader2, 
    Dumbbell, 
    X, 
    Edit2, 
    NotebookPen, 
    Quote, 
    AlertTriangle, 
    Calendar,
    Search,
    Video,
    Package
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getClientWorkoutPlan, createOrUpdateWorkoutPlan } from '../../../api/workout-plan.api';
import type { IDayPlan, IExercise } from '../../../api/workout-plan.api';
import { axiosInstance } from '../../../api/axios';
import { TRAINER_ROUTES } from '../../../constants/routes';

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

    // Data from library
    const [libraryExercises, setLibraryExercises] = useState<any[]>([]);
    const [templates, setTemplates] = useState<any[]>([]);

    // Modal state for Exercises
    const [showExModal, setShowExModal] = useState(false);
    const [showLibraryModal, setShowLibraryModal] = useState(false);
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
    
    const [exModalMode, setExModalMode] = useState<'add' | 'edit'>('add');
    const [activeDayIdx, setActiveDayIdx] = useState<number | null>(null);
    const [activeExIdx, setActiveExIdx] = useState<number | null>(null);
    const [exForm, setExForm] = useState({ name: '', sets: '', reps: '', instructions: '', videoUrl: '' });

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
        const init = async () => {
            if (!clientId) return;
            try {
                const [planRes, exRes, tempRes] = await Promise.all([
                    getClientWorkoutPlan(clientId),
                    axiosInstance.get(TRAINER_ROUTES.GET_EXERCISES),
                    axiosInstance.get(TRAINER_ROUTES.GET_TEMPLATES)
                ]);

                if (planRes.data && planRes.data.weeklyPlan) {
                    const existingDays = planRes.data.weeklyPlan;
                    const fullPlan = DAYS.map(day => {
                        const existingDay = existingDays.find((d: IDayPlan) => d.day === day);
                        return existingDay || { day, exercises: [] };
                    });
                    setWeeklyPlan(fullPlan);
                    setNotes(planRes.data.notes || "");
                }
                setLibraryExercises(exRes.data.data);
                setTemplates(tempRes.data.data);
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Failed to load workout plan details");
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [clientId]);

    const saveChanges = async (updatedPlan: IDayPlan[], updatedNotes: string) => {
        if (!clientId) return;
        try {
            setSaving(true);
            await createOrUpdateWorkoutPlan({
                clientId,
                weeklyPlan: updatedPlan,
                notes: updatedNotes,
                weekStartDate: new Date().toISOString() // Or handle actual week selection
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
        setExForm({ name: '', sets: '', reps: '', instructions: '', videoUrl: '' });
        setShowExModal(true);
    };

    const handleOpenLibrary = (dayIdx: number) => {
        setActiveDayIdx(dayIdx);
        setShowLibraryModal(true);
    };

    const handleSelectFromLibrary = (exercise: any) => {
        if (activeDayIdx === null) return;
        
        const newEx: IExercise = { 
            id: Math.random().toString(36).substr(2, 9), 
            name: exercise.name,
            instructions: exercise.instructions,
            videoUrl: exercise.videoUrl,
            reps: exercise.reps || '',
            sets: exercise.sets || '',
            idInLibrary: exercise.id
        };

        const newPlan = [...weeklyPlan];
        newPlan[activeDayIdx].exercises.push(newEx);
        setWeeklyPlan(newPlan);
        setShowLibraryModal(false);
        toast.success(`${exercise.name} added from library`);
        saveChanges(newPlan, notes);
    };

    const handleOpenExEdit = (dayIdx: number, exIdx: number) => {
        const ex = weeklyPlan[dayIdx].exercises[exIdx];
        setExModalMode('edit');
        setActiveDayIdx(dayIdx);
        setActiveExIdx(exIdx);
        setExForm({ 
            name: ex.name, 
            sets: ex.sets, 
            reps: ex.reps, 
            instructions: ex.instructions || '', 
            videoUrl: ex.videoUrl || '' 
        });
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
        toast.success("Exercise removed");

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

    const getEmbedUrl = (url: string) => {
        if (!url) return null;
        if (url.includes('youtube.com/watch?v=')) {
            return url.replace('watch?v=', 'embed/').split('&')[0];
        }
        if (url.includes('youtube.com/shorts/')) {
            return url.replace('shorts/', 'embed/');
        }
        if (url.includes('youtu.be/')) {
            const id = url.split('youtu.be/')[1].split('?')[0];
            return `https://www.youtube.com/embed/${id}`;
        }
        if (url.includes('vimeo.com/')) {
            const id = url.split('vimeo.com/')[1].split('?')[0];
            return `https://player.vimeo.com/video/${id}`;
        }
        return null;
    };

    // Template Logic
    const handleApplyTemplate = async (template: any) => {
        const confirmMsg = "Applying a template will overwrite the current weekly schedule. Continue?";
        if (!confirm(confirmMsg)) return;

        const newPlan = DAYS.map(day => {
            const tempDay = template.days.find((d: any) => d.day === day);
            if (tempDay) {
                return {
                    day,
                    exercises: tempDay.exercises.map((ex: any) => ({
                        id: Math.random().toString(36).substr(2, 9),
                        name: ex.name,
                        instructions: ex.instructions,
                        videoUrl: ex.videoUrl,
                        reps: ex.reps,
                        sets: ex.sets,
                        idInLibrary: ex.id
                    }))
                };
            }
            return { day, exercises: [] };
        });

        setWeeklyPlan(newPlan);
        setShowTemplateModal(false);
        toast.success(`Template "${template.name}" applied`);
        saveChanges(newPlan, notes);
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
        toast.success("Instructions cleared");
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
                <div className="flex items-center gap-3">
                    {saving && (
                        <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-black animate-pulse bg-emerald-400/10 px-3 py-1.5 rounded-full border border-emerald-400/20">
                            <Loader2 size={12} className="animate-spin" />
                            SYNCING...
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Dumbbell className="text-emerald-400" />
                    Custom Workout Plan
                </h1>
                <p className="text-zinc-400 text-sm">Design routines for your client. Changes are saved automatically as you build.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">

                {/* 1. Trainer Instructions Card */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col h-full overflow-hidden group">
                    <div className="p-4 bg-zinc-800/30 border-b border-zinc-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <NotebookPen size={18} className="text-emerald-400" />
                            <h3 className="text-lg font-bold text-white tracking-wide">TRAINER'S NOTES</h3>
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
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleOpenLibrary(dayIndex)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 text-emerald-400 hover:bg-zinc-700 rounded-lg text-xs font-bold transition-all border border-zinc-700"
                                >
                                    <Package size={14} /> Library
                                </button>
                                <button
                                    onClick={() => handleOpenExAdd(dayIndex)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 rounded-lg text-xs font-bold transition-all border border-zinc-700"
                                >
                                    <Plus size={14} /> Custom
                                </button>
                            </div>
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
                                            <div className="flex-1 flex items-center gap-3">
                                                <button 
                                                    onClick={() => exercise.videoUrl && setActiveVideoUrl(exercise.videoUrl)}
                                                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${exercise.videoUrl ? 'bg-emerald-400/10 hover:bg-emerald-400/20 text-emerald-400' : 'bg-zinc-900 text-zinc-600 cursor-default'}`}
                                                >
                                                    {exercise.videoUrl ? <Video className="w-4 h-4" /> : <Dumbbell className="w-4 h-4" />}
                                                </button>
                                                <div>
                                                    <h4 className="font-bold text-white text-sm">{exercise.name}</h4>
                                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">
                                                        {exercise.sets || '0'} sets × {exercise.reps || '0'} reps
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 transition-opacity">
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

            {/* Template Selection Modal */}
            {showTemplateModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
                        <div className="p-6 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-white">Select Template</h2>
                                <p className="text-zinc-500 text-xs">Choose a pre-defined weekly routine to apply</p>
                            </div>
                            <button onClick={() => setShowTemplateModal(false)} className="text-zinc-500 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-4 overflow-y-auto space-y-3">
                            {templates.length === 0 ? (
                                <div className="py-12 text-center text-zinc-600">
                                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p>No templates found.</p>
                                </div>
                            ) : (
                                templates.map(temp => (
                                    <button 
                                        key={temp.id}
                                        onClick={() => handleApplyTemplate(temp)}
                                        className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4 text-left hover:border-emerald-400/40 hover:bg-zinc-800 transition-all group"
                                    >
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-bold text-white group-hover:text-emerald-400">{temp.name}</h4>
                                            <span className="text-[10px] bg-zinc-900 px-2 py-1 rounded text-zinc-500">Weekly</span>
                                        </div>
                                        <div className="flex mt-2 gap-1 overflow-x-hidden">
                                            {temp.days.slice(0, 3).map((d: any, i: number) => (
                                                <span key={i} className="text-[9px] text-zinc-600 uppercase font-black">{d.day.substring(0,2)}</span>
                                            ))}
                                            <span className="text-[9px] text-zinc-600">...</span>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Exercise Library Modal */}
            {showLibraryModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col h-[80vh]">
                        <div className="p-6 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-white">Exercise Library</h2>
                                <p className="text-zinc-500 text-xs">Pick an exercise to add to {DAYS[activeDayIdx!]}'s plan</p>
                            </div>
                            <button onClick={() => setShowLibraryModal(false)} className="text-zinc-500 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-4 border-b border-zinc-800 bg-zinc-950/30">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
                                <input 
                                    type="text" 
                                    placeholder="Search library..." 
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                                />
                            </div>
                        </div>
                        <div className="p-4 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {libraryExercises.length === 0 ? (
                                <div className="col-span-full py-20 text-center text-zinc-600">
                                    <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p>Your library is empty.</p>
                                </div>
                            ) : (
                                libraryExercises.map(ex => (
                                    <button 
                                        key={ex.id}
                                        onClick={() => handleSelectFromLibrary(ex)}
                                        className="bg-zinc-800/40 border border-zinc-700/50 rounded-xl p-3 text-left hover:border-emerald-400/40 hover:bg-zinc-800 transition-all flex items-center gap-3 group"
                                    >
                                        <button 
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); ex.videoUrl && setActiveVideoUrl(ex.videoUrl); }}
                                            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${ex.videoUrl ? 'bg-zinc-900 group-hover:bg-emerald-400/10 text-emerald-400' : 'bg-zinc-900 text-zinc-600 cursor-default'}`}
                                        >
                                            {ex.videoUrl ? <Video className="w-5 h-5" /> : <Dumbbell className="w-5 h-5" />}
                                        </button>
                                        <div className="overflow-hidden">
                                            <h4 className="font-bold text-white text-sm truncate">{ex.name}</h4>
                                            <p className="text-[10px] text-zinc-500 truncate">{ex.instructions || 'No instructions'}</p>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Exercise Edit Modal (Also for Custom Add) */}
            {showExModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
                        <div className="p-5 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between">
                            <h2 className="font-bold text-white flex items-center gap-2">
                                {exModalMode === 'add' ? <Plus size={18} className="text-emerald-400" /> : <Edit2 size={18} className="text-emerald-400" />}
                                {exModalMode === 'add' ? 'Manual Exercise' : 'Edit Details'}
                            </h2>
                            <button onClick={() => setShowExModal(false)} className="text-zinc-500 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Exercise Name</label>
                                <input
                                    type="text"
                                    value={exForm.name}
                                    onChange={(e) => setExForm({ ...exForm, name: e.target.value })}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-400/50"
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
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-400/50"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Reps / Time</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 12"
                                        value={exForm.reps}
                                        onChange={(e) => setExForm({ ...exForm, reps: e.target.value })}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-400/50"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Instructions</label>
                                <textarea
                                    placeholder="How to perform..."
                                    value={exForm.instructions}
                                    onChange={(e) => setExForm({ ...exForm, instructions: e.target.value })}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-400/50 min-h-[80px] resize-none"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1 flex items-center gap-2">
                                    <Video size={12} className="text-red-500" /> YouTube Video URL
                                </label>
                                <input
                                    type="url"
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    value={exForm.videoUrl}
                                    onChange={(e) => setExForm({ ...exForm, videoUrl: e.target.value })}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-400/50"
                                />
                            </div>
                        </div>
                        <div className="p-5 border-t border-zinc-800 bg-zinc-950/50 flex gap-3">
                            <button onClick={() => setShowExModal(false)} className="flex-1 py-2.5 rounded-xl border border-zinc-800 text-zinc-400 text-sm font-bold hover:bg-zinc-800 hover:text-white transition-all">Cancel</button>
                            <button 
                                onClick={handleSaveEx}
                                className="flex-1 py-2.5 rounded-xl bg-emerald-400 text-black text-sm font-black hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-400/20"
                            >
                                {exModalMode === 'add' ? 'Add Item' : 'Update'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Notes Modal */}
            {showNotesModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg flex flex-col shadow-2xl overflow-hidden">
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
                                className="flex-1 py-2 rounded-lg bg-emerald-400 text-black text-sm font-extrabold hover:bg-emerald-500 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] flex items-center justify-center"
                            >
                                {saving ? <Loader2 size={16} className="animate-spin" /> : 'Save Instructions'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {confirmModal.show && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-sm flex flex-col shadow-2xl overflow-hidden">
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
            {/* Video Player Modal */}
            {activeVideoUrl && (
                <div 
                    className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300"
                    onClick={() => setActiveVideoUrl(null)}
                >
                    <div className="relative w-full max-w-4xl aspect-video rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-zinc-950" onClick={e => e.stopPropagation()}>
                        {getEmbedUrl(activeVideoUrl) ? (
                            <iframe src={getEmbedUrl(activeVideoUrl)!} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" title="Demo" />
                        ) : (
                            <video src={activeVideoUrl} controls autoPlay crossOrigin="anonymous" className="w-full h-full object-contain" />
                        )}
                        <button onClick={() => setActiveVideoUrl(null)} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center border border-white/10 hover:bg-white hover:text-black transition-all">
                            <X size={20} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkoutPlanPage;
