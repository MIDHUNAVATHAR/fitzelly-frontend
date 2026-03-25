import React, { useState, useEffect } from 'react';
import { Loader2, Dumbbell, CheckCircle2, Circle, Calendar, Info, Play, Video, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { getMyWorkoutPlan, trackWorkoutProgress, getWorkoutProgress } from '../../../api/workout-plan.api';
import type { IWorkoutPlan, IWorkoutProgress, IExercise } from '../../../api/workout-plan.api';

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const ClientWorkoutPlan: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [plan, setPlan] = useState<IWorkoutPlan | null>(null);
    const [progress, setProgress] = useState<IWorkoutProgress | null>(null);
    const [activeVideo, setActiveVideo] = useState<{ url: string, name: string } | null>(null);
    const todayName = DAYS[new Date().getDay()];

    const fetchData = async () => {
        try {
            const todayDateStr = new Date().toISOString().split('T')[0];
            const [planRes, progressRes] = await Promise.all([
                getMyWorkoutPlan(),
                getWorkoutProgress(todayDateStr)
            ]);
            
            const fetchedPlan = planRes.data;
            const fetchedProgress = progressRes.data;

            // Sync: Dashboard and Plan page must use the same Name-based tracking
            if (fetchedPlan && fetchedProgress?.completedExercises) {
                const todayNameLocal = DAYS[new Date().getDay()];
                const exercisesForToday = fetchedPlan.weeklyPlan.find(d => d.day === todayNameLocal)?.exercises || [];
                
                const sanitized = fetchedProgress.completedExercises.map(item => {
                    const matching = exercisesForToday.find(ex => ex.id === item || ex.name === item);
                    return matching ? matching.name : null;
                }).filter((name): name is string => name !== null);

                fetchedProgress.completedExercises = [...new Set(sanitized)];
            }

            setPlan(fetchedPlan);
            setProgress(fetchedProgress);
        } catch (error) {
            console.error("Error fetching workout data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Set up an interval or listener if you want live updates between dashboard and plan tab
        const interval = setInterval(fetchData, 10000); // Poll every 10s for sync
        return () => clearInterval(interval);
    }, []);

    const handleToggleExercise = async (exercise: IExercise) => {
        if (!plan) return;

        const todayDateStr = new Date().toISOString().split('T')[0];
        const currentCompleted = progress?.completedExercises || [];

        let newCompleted: string[];
        if (currentCompleted.includes(exercise.name)) {
            newCompleted = currentCompleted.filter(name => name !== exercise.name);
        } else {
            newCompleted = [...currentCompleted, exercise.name];
        }

        try {
            const response = await trackWorkoutProgress({
                date: todayDateStr,
                completedExercises: newCompleted
            });
            setProgress(response.data);
            toast.success("Progress updated!");
        } catch (error) {
            console.error("Error updating progress:", error);
            toast.error("Failed to update progress");
        }
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

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                <p className="text-zinc-400">Loading your workout routine...</p>
            </div>
        );
    }

    if (!plan) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6 bg-zinc-900/50 border border-zinc-800 rounded-3xl">
                <Dumbbell className="w-16 h-16 text-zinc-700 mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">No Workout Plan Assigned</h2>
                <p className="text-zinc-500 max-w-md">Your trainer hasn't assigned a workout routine for you yet. Contact your gym trainer to get started!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 w-full px-2 sm:px-4 pb-10">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Dumbbell className="text-emerald-400" />
                    My Workout Routine
                </h1>
                <p className="text-zinc-400">View your weekly program and track today's progress.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">

                {/* 1. Trainer Instructions (Always first) */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 relative overflow-hidden group flex flex-col h-full min-h-[200px]">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Dumbbell size={100} />
                    </div>
                    <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Trainer's Instructions
                    </h3>
                    {plan.notes ? (
                        <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap relative z-10 font-medium overflow-y-auto">
                            {plan.notes}
                        </p>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 gap-2 italic">
                            <Info size={24} className="opacity-20" />
                            <p className="text-xs">No specific instructions provided.</p>
                        </div>
                    )}
                </div>

                {/* 2. Days of the week */}
                {DAYS.map((day) => {
                    const dayPlan = plan.weeklyPlan.find(d => d.day === day);
                    const isToday = day === todayName;

                    return (
                        <div
                            key={day}
                            className={`
                                flex flex-col bg-zinc-900 border rounded-3xl overflow-hidden transition-all h-full
                                ${isToday ? 'border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.1)] ring-1 ring-emerald-500/20' : 'border-zinc-800'}
                            `}
                        >
                            <div className={`p-5 border-b flex items-center justify-between ${isToday ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-zinc-800/30 border-zinc-800'}`}>
                                <h3 className={`font-bold tracking-wider uppercase flex items-center gap-2 ${isToday ? 'text-emerald-400' : 'text-zinc-400'}`}>
                                    <Calendar size={16} />
                                    {day}
                                </h3>
                                {isToday && (
                                    <span className="text-[9px] font-black text-emerald-400 px-2 py-0.5 bg-emerald-400/10 border border-emerald-400/20 rounded-full">
                                        TODAY'S TARGET
                                    </span>
                                )}
                            </div>

                            <div className="p-5 flex-1 overflow-y-auto">
                                {!dayPlan || dayPlan.exercises.length === 0 ? (
                                    <div className="h-full py-8 flex items-center justify-center text-zinc-600 text-xs italic font-medium">
                                        Rest Day or no scheduled activity.
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {dayPlan.exercises.map((exercise) => {
                                            const isTodayOfTarget = day === todayName;
                                            const isCompleted = isTodayOfTarget && progress?.completedExercises.includes(exercise.name);
                                            return (
                                                <div
                                                    key={exercise.id}
                                                    className={`
                                                        group flex items-center gap-3 p-3 rounded-2xl border transition-all
                                                        ${isCompleted
                                                            ? 'bg-emerald-500/5 border-emerald-500/20'
                                                            : 'bg-zinc-950/40 border-zinc-800/50'}
                                                    `}
                                                >
                                                    <div
                                                        onClick={() => isToday && handleToggleExercise(exercise)}
                                                        className={`
                                                        flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer
                                                        ${isCompleted
                                                                ? 'bg-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                                                                : isToday ? 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700' : 'bg-zinc-800 text-zinc-600'}
                                                    `}>
                                                        {isCompleted ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <h4 className={`font-bold text-sm truncate transition-all ${isCompleted ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>
                                                            {exercise.name}
                                                        </h4>
                                                        <div className="flex gap-3 mt-0.5">
                                                            <span className="text-[10px] font-bold text-zinc-500 uppercase">Sets: <span className="text-emerald-400/70">{exercise.sets || '—'}</span></span>
                                                            <span className="text-[10px] font-bold text-zinc-500 uppercase">Reps: <span className="text-emerald-400/70">{exercise.reps || '—'}</span></span>
                                                        </div>
                                                        {exercise.instructions && !isCompleted && (
                                                            <p className="text-[10px] text-zinc-500 mt-1 line-clamp-1 italic">{exercise.instructions}</p>
                                                        )}
                                                    </div>

                                                    {exercise.videoUrl && (
                                                        <button
                                                            onClick={() => setActiveVideo({ url: exercise.videoUrl!, name: exercise.name })}
                                                            className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-emerald-400 hover:bg-emerald-400 hover:text-black transition-all"
                                                            title="Watch Demo"
                                                        >
                                                            <Play size={14} fill="currentColor" />
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Video Modal */}
            <AnimatePresence>
                {activeVideo && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setActiveVideo(null)}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
                    >
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative bg-zinc-900 border border-zinc-800 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl"
                        >
                            <div className="p-4 border-b border-zinc-800 bg-zinc-950/50 flex items-center justify-between">
                                <h3 className="font-bold text-white flex items-center gap-2 uppercase tracking-widest text-xs">
                                    <Video className="w-4 h-4 text-emerald-400" />
                                    {activeVideo.name} — Demo
                                </h3>
                                <button onClick={() => setActiveVideo(null)} className="text-zinc-500 hover:text-white transition-colors p-1">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="aspect-video bg-black rounded-b-3xl overflow-hidden">
                                {getEmbedUrl(activeVideo.url) ? (
                                    <iframe
                                        src={getEmbedUrl(activeVideo.url)!}
                                        className="w-full h-full"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        referrerPolicy="strict-origin-when-cross-origin"
                                        title="Exercise Demo Video"
                                    />
                                ) : (
                                    <video
                                        src={activeVideo.url}
                                        className="w-full h-full object-contain"
                                        controls
                                        autoPlay
                                        crossOrigin="anonymous"
                                    />
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <Info size={20} className="text-emerald-400" />
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                    Progress tracking is active for <strong className="text-emerald-400">{todayName}</strong>. Tap status icon to mark as done. View <Play size={10} className="inline inline-block" /> demo videos for any exercise if available.
                </p>
            </div>
        </div>
    );
};

export default ClientWorkoutPlan;
