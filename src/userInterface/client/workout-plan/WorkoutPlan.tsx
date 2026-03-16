import React, { useState, useEffect } from 'react';
import { Loader2, Dumbbell, CheckCircle2, Circle, Calendar, Info } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getMyWorkoutPlan, trackWorkoutProgress, getWorkoutProgress } from '../../../api/workout-plan.api';
import type { IWorkoutPlan, IWorkoutProgress } from '../../../api/workout-plan.api';

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const ClientWorkoutPlan: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [plan, setPlan] = useState<IWorkoutPlan | null>(null);
    const [progress, setProgress] = useState<IWorkoutProgress | null>(null);
    const todayName = DAYS[new Date().getDay()];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const planResponse = await getMyWorkoutPlan();
                setPlan(planResponse.data);

                // Fetch progress for today
                const todayDateStr = new Date().toISOString().split('T')[0];
                const progressResponse = await getWorkoutProgress(todayDateStr);
                setProgress(progressResponse.data);
            } catch (error) {
                console.error("Error fetching workout data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleToggleExercise = async (exerciseId: string) => {
        if (!plan) return;

        const todayDateStr = new Date().toISOString().split('T')[0];
        const currentCompleted = progress?.completedExercises || [];

        let newCompleted: string[];
        if (currentCompleted.includes(exerciseId)) {
            newCompleted = currentCompleted.filter(id => id !== exerciseId);
        } else {
            newCompleted = [...currentCompleted, exerciseId];
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
                                            const isCompleted = progress?.completedExercises.includes(exercise.id);
                                            return (
                                                <div
                                                    key={exercise.id}
                                                    onClick={() => isToday && handleToggleExercise(exercise.id)}
                                                    className={`
                                                        group flex items-center gap-3 p-3 rounded-2xl border transition-all
                                                        ${isToday ? 'cursor-pointer hover:border-emerald-500/30' : 'cursor-default'}
                                                        ${isCompleted
                                                            ? 'bg-emerald-500/5 border-emerald-500/20'
                                                            : 'bg-zinc-950/40 border-zinc-800/50'}
                                                    `}
                                                >
                                                    <div className={`
                                                        flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all
                                                        ${isCompleted
                                                            ? 'bg-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                                                            : isToday ? 'bg-zinc-800 text-zinc-500 group-hover:bg-zinc-700' : 'bg-zinc-800 text-zinc-600'}
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
                                                    </div>

                                                    {!isToday && isCompleted && (
                                                        <CheckCircle2 size={14} className="text-emerald-500/20" />
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

            <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <Info size={20} className="text-emerald-400" />
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                    Progress tracking is active for <strong className="text-emerald-400">{todayName}</strong>. Tap exercises in today's card to mark them as done. Your trainer will see your completions.
                </p>
            </div>
        </div>
    );
};

export default ClientWorkoutPlan;
