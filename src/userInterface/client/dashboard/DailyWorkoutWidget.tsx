import React, { useState, useEffect } from 'react';
import { Loader2, Dumbbell, CheckCircle2, Circle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getMyWorkoutPlan, trackWorkoutProgress, getWorkoutProgress } from '../../../api/workout-plan.api';
import type { IWorkoutPlan, IWorkoutProgress } from '../../../api/workout-plan.api';

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const DailyWorkoutWidget: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [plan, setPlan] = useState<IWorkoutPlan | null>(null);
    const [progress, setProgress] = useState<IWorkoutProgress | null>(null);
    const today = DAYS[new Date().getDay()];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const planResponse = await getMyWorkoutPlan();
                setPlan(planResponse.data);

                const dateStr = new Date().toISOString().split('T')[0];
                const progressResponse = await getWorkoutProgress(dateStr);
                setProgress(progressResponse.data);
            } catch (error) {
                console.error("Error fetching daily workout:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleToggleExercise = async (exerciseId: string) => {
        const dateStr = new Date().toISOString().split('T')[0];
        const currentCompleted = progress?.completedExercises || [];

        let newCompleted: string[];
        if (currentCompleted.includes(exerciseId)) {
            newCompleted = currentCompleted.filter(id => id !== exerciseId);
        } else {
            newCompleted = [...currentCompleted, exerciseId];
        }

        try {
            const response = await trackWorkoutProgress({
                date: dateStr,
                completedExercises: newCompleted
            });
            setProgress(response.data);
        } catch (error) {
            console.error("Error updating progress:", error);
        }
    };

    if (loading) {
        return (
            <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center gap-4">
                <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
                <span className="text-zinc-500 text-sm">Loading today's workout...</span>
            </div>
        );
    }

    const todayPlan = plan?.weeklyPlan.find(d => d.day === today);
    const hasExercises = todayPlan && todayPlan.exercises.length > 0;

    if (!plan || !hasExercises) {
        return (
            <div className="p-8 bg-zinc-900/50 border border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center text-xl">
                    🧘
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-white">No Workout Scheduled Today</h3>
                    <p className="text-zinc-500 text-sm">{!plan ? "Get a workout plan from your trainer to start tracking!" : "Enjoy your rest day or do some light activity!"}</p>
                </div>
            </div>
        );
    }

    const completedCount = todayPlan.exercises.filter(ex => progress?.completedExercises.includes(ex.id)).length;
    const totalCount = todayPlan.exercises.length;
    const percentage = Math.round((completedCount / totalCount) * 100);

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg">
            <div className="p-5 border-b border-zinc-800 bg-zinc-800/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
                        <Dumbbell size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-white leading-tight">Today's Workout</h3>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{today} Routine</p>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-lg font-black text-emerald-400">{percentage}%</span>
                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter">Completed</span>
                </div>
            </div>

            <div className="p-5 space-y-3">
                {todayPlan.exercises.slice(0, 3).map((exercise) => {
                    const isCompleted = progress?.completedExercises.includes(exercise.id);
                    return (
                        <div
                            key={exercise.id}
                            onClick={() => handleToggleExercise(exercise.id)}
                            className={`
                                flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all
                                ${isCompleted
                                    ? 'bg-emerald-500/5 border-emerald-500/20'
                                    : 'bg-zinc-950/30 border-zinc-800/50 hover:border-zinc-700'}
                            `}
                        >
                            <div className={`
                                transition-all
                                ${isCompleted ? 'text-emerald-400' : 'text-zinc-600'}
                            `}>
                                {isCompleted ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                            </div>
                            <span className={`text-sm font-medium flex-1 ${isCompleted ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>
                                {exercise.name}
                            </span>
                            <span className="text-[10px] font-bold text-zinc-600 uppercase">
                                {exercise.sets} × {exercise.reps}
                            </span>
                        </div>
                    );
                })}

                {todayPlan.exercises.length > 3 && (
                    <p className="text-[10px] text-center text-zinc-500 font-medium italic">
                        + {todayPlan.exercises.length - 3} more exercises
                    </p>
                )}

                <Link
                    to="/client/workout-plan"
                    className="flex items-center justify-center gap-2 w-full mt-2 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-bold transition-all border border-zinc-700/50"
                >
                    View Full Routine
                    <ArrowRight size={14} />
                </Link>
            </div>
        </div>
    );
};

export default DailyWorkoutWidget;
