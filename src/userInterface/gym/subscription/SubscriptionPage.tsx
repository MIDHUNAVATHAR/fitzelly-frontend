import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
    Check, 
    Zap, 
    Crown, 
    CreditCard, 
    Loader2, 
    CheckCircle2, 
    Sparkles,
    ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getAvailableFitzellyPlans, createStripeCheckoutSession, confirmFitzellySubscription, type SubscriptionPlan } from '../../../api/gym-subscription.api';
import { useAuth } from '../../../context/useAuth';
import { toast } from 'react-hot-toast';

const SubscriptionPage: React.FC = () => {
    const { setIsSubscriptionExpired } = useAuth();
    const [searchParams] = useSearchParams();
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    const fetchPlans = useCallback(async () => {
        try {
            const data = await getAvailableFitzellyPlans();
            setPlans(data);
        } catch {
            toast.error("Failed to load plans");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handlePaymentCallbacks = useCallback(async () => {
        const success = searchParams.get('success');
        const sessionId = searchParams.get('session_id');
        const planId = searchParams.get('plan_id');

        if (success === 'true' && sessionId && planId) {
            try {
                setIsProcessing(true);
                await confirmFitzellySubscription(sessionId, planId);
                setPaymentSuccess(true);
                setIsSubscriptionExpired(false);
                toast.success("Subscription activated successfully!", {
                    icon: '🎉',
                    duration: 6000
                });
            } catch {
                toast.error("Failed to confirm subscription. Please contact support.");
            } finally {
                setIsProcessing(false);
                // Clean up URL
                window.history.replaceState({}, '', window.location.pathname);
            }
        }
    }, [searchParams, setIsSubscriptionExpired]);

    useEffect(() => {
        fetchPlans();
        handlePaymentCallbacks();
    }, [fetchPlans, handlePaymentCallbacks]);

    const handleSubscribe = async (planId: string) => {
        try {
            setIsProcessing(true);
            const { url } = await createStripeCheckoutSession(planId);
            window.location.href = url;
        } catch (error: unknown) {
            let message = "Failed to initiate checkout";
            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as { response?: { data?: { message?: string } } };
                message = axiosError.response?.data?.message || message;
            }
            toast.error(message);
        } finally {
            setIsProcessing(false);
        }
    };

    if (isLoading || isProcessing) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-emerald-500/20 rounded-full"></div>
                    <div className="absolute top-0 w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-zinc-400 font-medium animate-pulse">
                    {isProcessing ? "Processing your subscription..." : "Loading premium plans..."}
                </p>
            </div>
        );
    }

    if (paymentSuccess) {
        return (
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl mx-auto mt-10 p-10 bg-zinc-900 border border-zinc-800 rounded-[2.5rem] text-center shadow-2xl overflow-hidden relative"
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
                <div className="mb-8 flex justify-center">
                    <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                        <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                    </div>
                </div>
                <h1 className="text-4xl font-black text-white mb-4">Welcome Back!</h1>
                <p className="text-zinc-400 text-lg mb-10 leading-relaxed">
                    Your subscription has been successfully activated. You now have full access to all Fitzelly features. Let's grow your gym together!
                </p>
                <button 
                    onClick={() => window.location.href = '/gym/dashboard'}
                    className="px-10 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95 group flex items-center gap-2 mx-auto"
                >
                    Go to Dashboard
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
            </motion.div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="text-center mb-16">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm font-bold mb-6"
                >
                    <Sparkles className="w-4 h-4" />
                    PREMIUM ACCESS
                </motion.div>
                <motion.h1 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-5xl lg:text-7xl font-black text-white mb-6 tracking-tight"
                >
                    Elevate Your <span className="text-emerald-500">Gym</span>
                </motion.h1>
                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-zinc-400 text-xl max-w-2xl mx-auto font-medium"
                >
                    Choose the perfect plan to streamline your operations and provide a world-class experience for your members.
                </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {plans.map((plan, index) => (
                    <motion.div
                        key={plan.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`
                            relative group p-8 bg-zinc-900 border border-zinc-800 rounded-[2rem] flex flex-col h-full transition-all duration-500 hover:border-emerald-500/40 hover:shadow-2xl hover:shadow-emerald-500/5 hover:-translate-y-2
                            ${index === 1 ? 'lg:scale-110 lg:z-10 bg-zinc-800/50 border-emerald-500/30 ring-1 ring-emerald-500/20' : ''}
                        `}
                    >
                        {index === 1 && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-emerald-500 text-white text-xs font-black uppercase tracking-widest rounded-full shadow-lg">
                                Most Popular
                            </div>
                        )}

                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-2xl font-black text-white tracking-tight">{plan.name}</h3>
                                {index === 0 ? <Zap className="text-zinc-500" /> : index === 1 ? <Crown className="text-emerald-400" /> : <CreditCard className="text-teal-400" />}
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-5xl font-black text-white tracking-tighter">₹{plan.price}</span>
                                <span className="text-zinc-500 font-bold">/{plan.durationMonths}m</span>
                            </div>
                        </div>

                        <div className="space-y-4 mb-10 flex-1">
                            {plan.description.split(',').map((feature, fIndex) => (
                                <div key={fIndex} className="flex items-start gap-3">
                                    <div className="mt-1 w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                                    </div>
                                    <span className="text-zinc-400 font-medium">{feature.trim()}</span>
                                </div>
                            ))}
                            {/* Static features for visual richness */}
                            <div className="flex items-start gap-3">
                                <div className="mt-1 w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                </div>
                                <span className="text-zinc-400 font-medium">Full Analytics Dashboard</span>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="mt-1 w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                </div>
                                <span className="text-zinc-400 font-medium">Unlimited Member Management</span>
                            </div>
                        </div>

                        <button
                            onClick={() => handleSubscribe(plan.id)}
                            disabled={isProcessing}
                            className={`
                                w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50
                                ${index === 1 
                                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30' 
                                    : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'}
                            `}
                        >
                            {isProcessing ? (
                                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                            ) : (
                                `Subscribe ${plan.name}`
                            )}
                        </button>
                    </motion.div>
                ))}
            </div>

        </div>
    );
};

export default SubscriptionPage;
