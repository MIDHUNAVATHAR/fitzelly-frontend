import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Scale,
    Ruler,
    Activity,
    History,
    Loader2,
    TrendingUp,
    ArrowRight,
    TrendingDown,
    Minus
} from "lucide-react";
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from "recharts";
import { healthTrackingApi } from "../../../api/health-tracking.api";
import { getClientProfile } from "../../../api/client-profile.api";
import { toast } from "react-hot-toast";
import { format } from "date-fns";

// Types
interface WeightLog {
    weight: number;
    height: number;
    bmi: number;
    date: string;
}

const HealthTrackingPage: React.FC = () => {
    const [weightHistory, setWeightHistory] = useState<WeightLog[]>([]);
    const [currentWeight, setCurrentWeight] = useState<string>("");
    const [currentHeight, setCurrentHeight] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [history, profileData] = await Promise.all([
                healthTrackingApi.getWeightHistory(),
                getClientProfile()
            ]);
            setWeightHistory(history);
            if (profileData.profile.height) setCurrentHeight(profileData.profile.height.toString());
            if (profileData.profile.weight) setCurrentWeight(profileData.profile.weight.toString());

            // If history has more recent weight, use that
            if (history && history.length > 0) {
                const latest = history[history.length - 1];
                setCurrentWeight(latest.weight.toString());
                setCurrentHeight(latest.height.toString());
            }
        } catch (error) {
            console.error("Health fetch error:", error);
            toast.error("Failed to fetch health data");
        } finally {
            setLoading(false);
        }
    };

    const calculateBMI = (w: number, h: number) => {
        if (!w || !h) return 0;
        const hInMeters = h / 100;
        return parseFloat((w / (hInMeters * hInMeters)).toFixed(1));
    };

    const getBMICategory = (bmi: number) => {
        if (!bmi) return { label: "Unknown", color: "text-gray-400" };
        if (bmi < 18.5) return { label: "Underweight", color: "text-blue-400" };
        if (bmi < 25) return { label: "Normal", color: "text-emerald-400" };
        if (bmi < 30) return { label: "Overweight", color: "text-amber-400" };
        return { label: "Obese", color: "text-rose-400" };
    };

    const handleLogWeight = async (e: React.FormEvent) => {
        e.preventDefault();
        const weightNum = parseFloat(currentWeight);
        const heightNum = parseFloat(currentHeight);

        if (!weightNum || !heightNum) {
            toast.error("Please enter valid height and weight");
            return;
        }

        try {
            setSaving(true);
            const bmiValue = calculateBMI(weightNum, heightNum);
            await healthTrackingApi.addWeightLog({
                weight: weightNum,
                height: heightNum,
                bmi: bmiValue,
                date: new Date().toISOString()
            });
            toast.success("Health metrics updated");
            fetchData();
        } catch {
            toast.error("Failed to log metrics");
        } finally {
            setSaving(false);
        }
    };

    const currentBmi = calculateBMI(parseFloat(currentWeight), parseFloat(currentHeight));
    const bmiInfo = getBMICategory(currentBmi);

    const chartData = weightHistory.map(log => ({
        ...log,
        displayDate: format(new Date(log.date), "MMM dd")
    }));

    // Calculate weight change
    const weightChange = weightHistory.length > 1
        ? weightHistory[weightHistory.length - 1].weight - weightHistory[weightHistory.length - 2].weight
        : 0;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="w-full space-y-8 text-white">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-1"
            >
                <h1 className="text-4xl font-black tracking-tighter text-white uppercase leading-none">
                    Body <span className="text-emerald-500">Analytics</span>
                </h1>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-zinc-500 font-bold text-[10px] uppercase tracking-[0.2em]">Live Tracking • Performance Metrics</p>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Metrics and Form */}
                <div className="space-y-8">
                    {/* BMI Card */}
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="p-8 rounded-[2.5rem] bg-zinc-900 border border-zinc-800 relative overflow-hidden group shadow-2xl"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Activity size={100} />
                        </div>
                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div className="flex justify-between items-start mb-8">
                                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                                    <Activity className="text-emerald-500" size={20} />
                                </div>
                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-zinc-950 border border-zinc-800 ${bmiInfo.color.replace('text-blue-400', 'text-emerald-400')}`}>
                                    {bmiInfo.label}
                                </span>
                            </div>
                            <div>
                                <p className="text-zinc-500 text-[9px] font-black uppercase tracking-widest mb-1.5">Body Mass Index</p>
                                <h2 className="text-5xl font-black tracking-tighter mb-4 leading-none">
                                    {currentBmi || "0.0"}
                                    <span className="text-sm text-zinc-600 font-bold ml-2 tracking-normal uppercase">Index</span>
                                </h2>

                                <div className="space-y-2">
                                    <div className="h-3 w-full bg-zinc-950 rounded-full overflow-hidden p-0.5 border border-zinc-800 shadow-inner">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min((currentBmi / 40) * 100, 100)}%` }}
                                            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                                            className={`h-full rounded-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.3)] relative`}
                                        >
                                            <motion.div
                                                className="absolute inset-0 bg-white/20"
                                                animate={{ x: ['-200%', '300%'] }}
                                                transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                                            />
                                        </motion.div>
                                    </div>
                                    <div className="flex justify-between text-[9px] text-zinc-600 font-black uppercase tracking-tighter">
                                        <span>Lean</span>
                                        <span>Optimal</span>
                                        <span>Above</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Weight Log Form */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="p-8 rounded-[2.5rem] bg-zinc-900/60 border border-zinc-800 backdrop-blur-3xl shadow-xl"
                    >
                        <h3 className="text-xl font-black mb-8 flex items-center gap-3 uppercase tracking-tight">
                            <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                            Log Progress
                        </h3>
                        <form onSubmit={handleLogWeight} className="space-y-6">
                            <div className="space-y-2.5 group">
                                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2 group-focus-within:text-emerald-400 transition-colors">
                                    <Scale size={14} /> Weight (kg)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={currentWeight}
                                    onChange={(e) => setCurrentWeight(e.target.value)}
                                    placeholder="00.0"
                                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded-[1.5rem] px-6 py-4 text-xl font-black focus:outline-none focus:border-emerald-500/50 hover:bg-zinc-950 transition-all text-emerald-50 shadow-inner"
                                />
                            </div>
                            <div className="space-y-2.5 group">
                                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2 group-focus-within:text-emerald-400 transition-colors">
                                    <Ruler size={14} /> Height (cm)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={currentHeight}
                                    onChange={(e) => setCurrentHeight(e.target.value)}
                                    placeholder="000"
                                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded-[1.5rem] px-6 py-4 text-xl font-black focus:outline-none focus:border-emerald-500/50 hover:bg-zinc-950 transition-all text-zinc-50 shadow-inner"
                                />
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                disabled={saving}
                                className="w-full bg-emerald-500 text-black py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all shadow-[0_15px_30px_rgba(16,185,129,0.2)] disabled:opacity-50 mt-4 group"
                            >
                                {saving ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Calibrate Metrics
                                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </motion.button>
                        </form>
                    </motion.div>
                </div>

                {/* Charts and History */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Weight Chart */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                        className="p-8 rounded-[2.5rem] bg-zinc-900 border border-zinc-800 shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full" />

                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 relative z-10">
                            <div>
                                <h3 className="text-2xl font-black flex items-center gap-3 tracking-tighter uppercase">
                                    <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                                    Weight Flow
                                </h3>
                                <p className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest mt-1">Consistency Analysis</p>
                            </div>
                            <div className="flex items-center gap-4 bg-zinc-950 border border-zinc-800 px-5 py-3 rounded-2xl self-end">
                                <div className="flex flex-col items-end">
                                    <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Net Change</span>
                                    <div className="flex items-center gap-2">
                                        {weightChange > 0 ? (
                                            <TrendingUp size={18} className="text-rose-500" />
                                        ) : weightChange < 0 ? (
                                            <TrendingDown size={18} className="text-emerald-500" />
                                        ) : (
                                            <Minus size={18} className="text-zinc-600" />
                                        )}
                                        <span className={`text-xl font-black tabular-nums ${weightChange > 0 ? "text-rose-500" : weightChange < 0 ? "text-emerald-500" : "text-zinc-600"}`}>
                                            {weightChange > 0 ? "+" : ""}{weightChange.toFixed(1)} <span className="text-[10px] font-bold text-zinc-600 uppercase ml-1">kg</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="h-[300px] w-full relative z-10">
                            {weightHistory.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="8 8" stroke="#ffffff03" vertical={false} />
                                        <XAxis
                                            dataKey="displayDate"
                                            stroke="#3f3f46"
                                            tick={{ fontSize: 9, fontWeight: 900 }}
                                            axisLine={false}
                                            tickLine={false}
                                            dy={15}
                                        />
                                        <YAxis
                                            stroke="#3f3f46"
                                            tick={{ fontSize: 9, fontWeight: 900 }}
                                            axisLine={false}
                                            tickLine={false}
                                            domain={['dataMin - 2', 'dataMax + 2']}
                                            dx={-10}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#09090b',
                                                border: '1px solid #27272a',
                                                borderRadius: '20px',
                                                padding: '16px'
                                            }}
                                            itemStyle={{ color: '#fff', fontWeight: 900, textTransform: 'uppercase', fontSize: '11px' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="weight"
                                            stroke="#10b981"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorWeight)"
                                            animationDuration={1500}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-zinc-700 space-y-4">
                                    <TrendingUp size={48} className="opacity-10" />
                                    <p className="font-black text-[9px] uppercase tracking-widest text-zinc-600">Pending Data Stream</p>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* BMI Chart */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                        className="p-8 rounded-[2.5rem] bg-zinc-900/40 border border-zinc-800 shadow-2xl"
                    >
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                            <div>
                                <h3 className="text-xl font-black flex items-center gap-3 tracking-tighter uppercase">
                                    <div className="w-1.5 h-5 bg-zinc-700 rounded-full" />
                                    BMI Trajectory
                                </h3>
                                <p className="text-zinc-600 font-bold text-[9px] uppercase tracking-widest mt-1">Structural Progress</p>
                            </div>
                        </div>
                        <div className="h-[200px] w-full">
                            {weightHistory.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorBmi" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#71717a" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#71717a" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="8 8" stroke="#ffffff03" vertical={false} />
                                        <XAxis
                                            dataKey="displayDate"
                                            stroke="#27272a"
                                            tick={{ fontSize: 8, fontWeight: 900 }}
                                            axisLine={false}
                                            tickLine={false}
                                            dy={15}
                                        />
                                        <YAxis
                                            stroke="#27272a"
                                            tick={{ fontSize: 8, fontWeight: 900 }}
                                            axisLine={false}
                                            tickLine={false}
                                            dx={-10}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#09090b',
                                                border: '1px solid #27272a',
                                                borderRadius: '16px',
                                                padding: '12px'
                                            }}
                                            itemStyle={{ color: '#a1a1aa', fontWeight: 900, fontSize: '9px' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="bmi"
                                            stroke="#3f3f46"
                                            strokeWidth={2}
                                            fillOpacity={1}
                                            fill="url(#colorBmi)"
                                            animationDuration={2000}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-zinc-800">
                                    <Activity size={32} className="opacity-10" />
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Recent Logs List */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="p-8 rounded-[2.5rem] bg-zinc-900 border border-zinc-800"
                    >
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-black flex items-center gap-3 uppercase tracking-tight">
                                <div className="w-1.5 h-6 bg-zinc-700 rounded-full" />
                                Activity Log
                            </h3>
                            <button className="text-[9px] font-black text-zinc-500 hover:text-emerald-400 transition-colors flex items-center gap-2 uppercase tracking-widest">
                                Expand <ArrowRight size={12} />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {weightHistory.slice().reverse().slice(0, 6).map((log, index) => {
                                const logBmiInfo = getBMICategory(log.bmi);
                                const isLatest = index === 0;
                                return (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 * index }}
                                        className={`flex items-center justify-between p-5 rounded-[1.8rem] border transition-all duration-300 group ${isLatest ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-zinc-950/40 border-zinc-800/60 hover:border-zinc-700'}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-xl ${isLatest ? 'bg-emerald-500 text-black' : 'bg-zinc-900 text-zinc-500'}`}>
                                                <History size={16} />
                                            </div>
                                            <div>
                                                <p className={`font-black text-lg leading-none ${isLatest ? 'text-white' : 'text-zinc-300'}`}>{log.weight} <span className="text-[9px] font-bold text-zinc-600 uppercase">kg</span></p>
                                                <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mt-1">{format(new Date(log.date), "MMM dd")}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex flex-col items-end">
                                                <p className={`text-[7px] font-black uppercase tracking-[0.2em] leading-none mb-1 ${isLatest ? 'text-emerald-400' : 'text-zinc-600'}`}>{logBmiInfo.label}</p>
                                                <p className="font-black text-xl tracking-tighter leading-none text-white">{log.bmi}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                            {weightHistory.length === 0 && (
                                <div className="col-span-2 text-center py-12 bg-zinc-950/30 rounded-[2rem] border-2 border-dashed border-zinc-800/50">
                                    <p className="text-zinc-600 font-black text-[9px] uppercase tracking-[0.3em]">Initialize Log</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default HealthTrackingPage;
