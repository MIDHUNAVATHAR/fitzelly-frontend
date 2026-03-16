import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle2,
    Circle,
    Dumbbell,
    Flame,
    Trophy,
    Calendar,
    Loader2,
    ArrowRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getMyWorkoutPlan, trackWorkoutProgress, getWorkoutProgress, getWorkoutStreak } from '../../../api/workout-plan.api';
import type { IWorkoutPlan, IWorkoutProgress } from '../../../api/workout-plan.api';

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const TodayWorkoutDashboard: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [plan, setPlan] = useState<IWorkoutPlan | null>(null);
    const [progress, setProgress] = useState<IWorkoutProgress | null>(null);
    const [streak, setStreak] = useState(0);
    const [isCelebrating, setIsCelebrating] = useState(false);
    const [recentExercise, setRecentExercise] = useState<string | null>(null);
    const [showTaskCongrats, setShowTaskCongrats] = useState(false);

    const today = DAYS[new Date().getDay()];
    const todayDateStr = new Date().toISOString().split('T')[0];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [planRes, progressRes, streakRes] = await Promise.all([
                    getMyWorkoutPlan(),
                    getWorkoutProgress(todayDateStr),
                    getWorkoutStreak()
                ]);

                const fetchedPlan = planRes.data;
                const fetchedProgress = progressRes.data;

                // Clean up any old IDs and replace them with names for database consistency
                if (fetchedPlan && fetchedProgress?.completedExercises) {
                    const exercisesForToday = fetchedPlan.weeklyPlan.find(d => d.day === today)?.exercises || [];
                    const sanitized = fetchedProgress.completedExercises.map(item => {
                        const matching = exercisesForToday.find(ex => ex.id === item || ex.name === item);
                        return matching ? matching.name : null;
                    }).filter((name): name is string => name !== null);

                    fetchedProgress.completedExercises = [...new Set(sanitized)];
                }

                setPlan(fetchedPlan);
                setProgress(fetchedProgress);
                setStreak(streakRes.data);
            } catch (error) {
                console.error("Error fetching workout data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [todayDateStr, today]);

    const todayPlan = plan?.weeklyPlan.find(d => d.day === today);
    const exercises = todayPlan?.exercises || [];
    const completedExercises = progress?.completedExercises || [];

    const totalExercises = exercises.length;
    const completedCount = exercises.filter(ex => completedExercises.includes(ex.name)).length;
    const progressPercentage = totalExercises > 0 ? (completedCount / totalExercises) * 100 : 0;
    const isAllCompleted = totalExercises > 0 && completedCount === totalExercises;
    const [hasCelebrated, setHasCelebrated] = useState(false);

    // Trigger celebration when all exercises are completed
    useEffect(() => {
        if (isAllCompleted && !hasCelebrated && !loading) {
            setIsCelebrating(true);
            setHasCelebrated(true);
        }
    }, [isAllCompleted, hasCelebrated, loading]);

    const handleToggleExercise = async (exerciseId: string) => {
        const exercise = exercises.find(ex => ex.id === exerciseId);
        if (!exercise) return;

        const isCurrentlyCompleted = completedExercises.includes(exercise.name);
        let newCompleted: string[];

        if (isCurrentlyCompleted) {
            newCompleted = completedExercises.filter(name => name !== exercise.name);
        } else {
            newCompleted = [...completedExercises, exercise.name];
        }

        try {
            const response = await trackWorkoutProgress({
                date: todayDateStr,
                completedExercises: newCompleted
            });
            setProgress(response.data);

            if (!isCurrentlyCompleted) {
                setRecentExercise(exercise.name);
                setShowTaskCongrats(true);
                setTimeout(() => setShowTaskCongrats(false), 2000);

                toast.success('Nice! Exercise complete', {
                    icon: '💪',
                    style: {
                        borderRadius: '12px',
                        background: '#10b981',
                        color: '#fff',
                    }
                });

                // If this was the last exercise, refresh streak for the celebration
                if (newCompleted.length === totalExercises) {
                    const streakRes = await getWorkoutStreak();
                    setStreak(streakRes.data);
                }
            }
        } catch (error) {
            console.error("Error updating progress:", error);
            toast.error("Failed to update progress");
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                >
                    <Loader2 className="w-12 h-12 text-emerald-500" />
                </motion.div>
                <p className="text-zinc-400 font-medium animate-pulse text-lg uppercase tracking-widest">Waking up units...</p>
            </div>
        );
    }

    if (!plan || exercises.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8 bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem] mt-4">
                <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mb-6 shadow-xl border border-zinc-700/50">
                    <Dumbbell className="w-10 h-10 text-zinc-600" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">Active Recovery Mode</h2>
                <p className="text-zinc-500 max-w-sm leading-relaxed mb-8">
                    {!plan ? "Your trainer hasn't prescribed a routine yet. Check back soon!" : "Today is for recovery. Listen to your body and refuel. See you tomorrow!"}
                </p>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-emerald-500 text-black font-black rounded-3xl shadow-lg shadow-emerald-500/20 uppercase tracking-widest text-xs"
                >
                    Review Weekly Plan
                </motion.button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto py-6 px-4 sm:px-6 space-y-10 pb-24 relative">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 mb-3"
                    >
                        <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-1.5">
                            <Calendar size={14} className="text-emerald-500" />
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">{today}'s Grind</span>
                        </div>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl font-black text-white leading-[0.9] tracking-tighter"
                    >
                        CRUSH IT<br />TODAY
                    </motion.h1>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-8 bg-zinc-900/60 backdrop-blur-3xl p-5 rounded-[2.5rem] border border-zinc-800 shadow-2xl"
                >
                    <div className="flex flex-col items-center">
                        <span className="text-3xl font-black text-emerald-400 leading-none">{completedCount}</span>
                        <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mt-1">Done</span>
                    </div>
                    <div className="w-px h-10 bg-zinc-800" />
                    <div className="flex flex-col items-center">
                        <span className="text-3xl font-black text-zinc-300 leading-none">{totalExercises}</span>
                        <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mt-1">Goal</span>
                    </div>
                </motion.div>
            </div>

            {/* Progress Bar Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-3">
                    <div className="flex items-center gap-2">
                        <Flame className={`w-5 h-5 transition-all duration-700 ${progressPercentage > 0 ? 'text-orange-500 fill-orange-500 scale-125' : 'text-zinc-700'}`} />
                        <span className="text-sm font-black text-zinc-400 uppercase tracking-widest">Intensity Progress</span>
                    </div>
                    <span className="text-sm font-black text-emerald-400 tabular-nums">{Math.round(progressPercentage)}%</span>
                </div>

                <div className="h-8 w-full bg-zinc-950 rounded-full p-2 border border-zinc-800/50 shadow-inner overflow-hidden flex items-center">
                    <motion.div
                        className="h-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-emerald-300 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.4)] relative"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercentage}%` }}
                        transition={{ type: "spring", stiffness: 40, damping: 15 }}
                    >
                        <motion.div
                            className="absolute inset-0 bg-white/30"
                            animate={{ x: ['-200%', '300%'] }}
                            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                        />
                    </motion.div>
                </div>
            </div>

            {/* Workout List */}
            <div className="space-y-5">
                <AnimatePresence mode="popLayout">
                    {exercises.map((exercise, index) => {
                        const isCompleted = completedExercises.includes(exercise.name);
                        return (
                            <motion.div
                                key={exercise.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => handleToggleExercise(exercise.id)}
                                className={`
                                    group relative flex items-center gap-5 p-6 rounded-[2.5rem] border-2 transition-all duration-500 cursor-pointer overflow-hidden
                                    ${isCompleted
                                        ? 'bg-emerald-500/5 border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.1)]'
                                        : 'bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-600 hover:bg-zinc-900 shadow-xl'}
                                `}
                            >
                                {/* Checkbox Animation */}
                                <motion.div
                                    className={`
                                        flex-shrink-0 w-14 h-14 rounded-3xl flex items-center justify-center transition-all duration-500
                                        ${isCompleted
                                            ? 'bg-emerald-500 text-black shadow-[0_10px_25px_rgba(16,185,129,0.4)] rotate-0'
                                            : 'bg-zinc-800 text-zinc-500 group-hover:bg-zinc-700 group-hover:text-white -rotate-3'}
                                    `}
                                    animate={isCompleted ? { scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] } : {}}
                                >
                                    <AnimatePresence mode="wait">
                                        {isCompleted ? (
                                            <motion.div
                                                key="checked"
                                                initial={{ scale: 0, rotate: -90, opacity: 0 }}
                                                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                                                exit={{ scale: 0, rotate: 90, opacity: 0 }}
                                            >
                                                <CheckCircle2 size={28} strokeWidth={3} />
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="unchecked"
                                                initial={{ scale: 0, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                exit={{ scale: 0, opacity: 0 }}
                                            >
                                                <Circle size={28} strokeWidth={1} />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>

                                <div className="flex-1 min-w-0">
                                    <h3 className={`text-xl font-black tracking-tight transition-all duration-500 ${isCompleted ? 'text-zinc-500/50 line-through' : 'text-white'}`}>
                                        {exercise.name}
                                    </h3>
                                    <div className="flex gap-6 mt-1.5">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black text-emerald-500/50 uppercase tracking-[0.2em]">Rounds</span>
                                            <span className="text-sm font-bold text-zinc-400">{exercise.sets}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black text-emerald-500/50 uppercase tracking-[0.2em]">Volume</span>
                                            <span className="text-sm font-bold text-zinc-400">{exercise.reps}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Background Pattern for Completed */}
                                {isCompleted && (
                                    <motion.div
                                        className="absolute -right-6 -bottom-6 text-emerald-500/5 rotate-12"
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                    >
                                        <Dumbbell size={120} />
                                    </motion.div>
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Task Congratulation Popup */}
            <AnimatePresence>
                {showTaskCongrats && (
                    <div className="fixed inset-0 lg:left-64 flex items-center justify-center z-50 pointer-events-none px-4">
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.8, opacity: 0, y: -20 }}
                            className="bg-emerald-500 text-black px-8 py-5 rounded-[2rem] shadow-[0_20px_50px_rgba(16,185,129,0.4)] flex items-center gap-4 border-4 border-white"
                        >
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl">
                                🔥
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 leading-none mb-1">Task Complete</p>
                                <p className="text-lg font-black leading-none uppercase tracking-tight">{recentExercise}</p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Celebration Dashboard Layer */}
            <AnimatePresence>
                {isCelebrating && (
                    <div className="fixed inset-0 lg:left-64 flex items-center justify-center z-40 px-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
                            onClick={() => setIsCelebrating(false)}
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, y: 50 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 50 }}
                            className="bg-zinc-900/90 backdrop-blur-3xl p-8 sm:p-10 rounded-[3rem] sm:rounded-[4rem] shadow-[0_0_80px_rgba(16,185,129,0.2)] border-2 border-zinc-800 flex flex-col items-center text-center max-w-sm w-full relative overflow-hidden"
                        >
                            {/* Animated Particles */}
                            {[...Array(10)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute w-1.5 h-1.5 rounded-full"
                                    animate={{
                                        x: [(Math.random() - 0.5) * 400, (Math.random() - 0.5) * 600],
                                        y: [(Math.random() - 0.5) * 400, (Math.random() - 0.5) * 600],
                                        scale: [0, 1, 0],
                                        opacity: [0, 0.8, 0]
                                    }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 3 + Math.random() * 2,
                                        ease: "easeInOut"
                                    }}
                                    style={{
                                        backgroundColor: i % 2 === 0 ? '#10b981' : '#fbbf24',
                                        left: '50%',
                                        top: '50%'
                                    }}
                                />
                            ))}

                            <motion.div
                                animate={{
                                    scale: [1, 1.15, 1],
                                    rotate: [0, 10, -10, 0],
                                }}
                                transition={{ repeat: Infinity, duration: 3 }}
                                className="w-20 h-20 sm:w-24 sm:h-24 bg-emerald-500 rounded-full flex items-center justify-center mb-6 sm:mb-8 text-4xl sm:text-5xl shadow-[0_0_30px_rgba(16,185,129,0.3)] relative z-10"
                            >
                                🏆
                            </motion.div>

                            <h2 className="text-3xl sm:text-4xl font-black text-white mb-2 sm:mb-3 tracking-tighter relative z-10 leading-none uppercase">Session<br /><span className="text-emerald-400">Complete</span></h2>
                            <p className="text-zinc-400 text-xs sm:text-sm font-bold mb-8 sm:mb-10 leading-relaxed relative z-10 uppercase tracking-widest px-4">You're on a <strong>{streak} day</strong> win streak. Go recover!</p>

                            <motion.button
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setIsCelebrating(false)}
                                className="w-full py-4 sm:py-5 bg-emerald-500 text-black font-black rounded-[2rem] sm:rounded-[2.5rem] hover:bg-emerald-400 transition-all shadow-[0_15px_30px_rgba(16,185,129,0.2)] relative z-10 uppercase tracking-[0.2em] text-[10px] sm:text-xs"
                            >
                                Dismiss
                            </motion.button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Bottom Insight */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-[3rem] flex items-center gap-6 shadow-2xl relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[50px] rounded-full" />

                <div className="w-16 h-16 bg-zinc-800/80 backdrop-blur rounded-2xl flex items-center justify-center flex-shrink-0 border border-zinc-700/50">
                    <Trophy className="text-yellow-500" size={32} />
                </div>
                <div className="flex-1">
                    <p className="text-lg font-black text-white leading-none">{streak > 0 ? 'ELITE CONSISTENCY' : 'START YOUR STREAK'}</p>
                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">
                        {streak} {streak === 1 ? 'Day' : 'Days'} Win Streak {streak > 0 ? 'Active' : 'Opportunity'}
                    </p>
                </div>
                <ArrowRight className="text-zinc-600" size={24} />
            </motion.div>
        </div>
    );
};

export default TodayWorkoutDashboard;
