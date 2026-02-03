import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import PasswordInput from './PasswordInput';
import { initiateGymSignup } from '../../../api/gym-registration.api';
import { verifyGymSignupOtp } from '../../../api/gym-registration.api';
import { initiateGoogleLogin } from '../../../api/google-login.api';
import axios from 'axios';


interface SignUpModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSwitchToSignIn: () => void;
}

export default function SignUpModal({ isOpen, onClose, onSwitchToSignIn }: SignUpModalProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState('DETAILS'); // 'DETAILS' or 'OTP'
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Prevent background scrolling and reset form on close
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
            resetForm();
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const resetForm = () => {
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setOtp('');
        setStep('DETAILS');
        setError('');
        setIsLoading(false);
    };

    const handleInitiateSignUp = async (e: any) => {
        e.preventDefault();
        setError('');

        // Validation
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);

        try {
            const response = await initiateGymSignup({ email });

            if (response.status == "success") {
                setStep("OTP"); //move to otp step on success
            } else {
                setError(response.message || "Failed to send verification code");
            }
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err?.response?.data?.message || "Failed to send verification code");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleCompleteSignUp = async (e: any) => {
        e.preventDefault();
        setError('');

        if (otp.length !== 6) {
            setError('Please enter a valid 6-digit code');
            return;
        }

        setIsLoading(true);

        try {
            const response = await verifyGymSignupOtp({ email, password, otp });
            if (response.status == "success") {
                onClose();
                onSwitchToSignIn(); //switch to sigin modal
            } else {
                setError(response.message || "Verification failed");
            }
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err?.response?.data?.message)
            }
        } finally {
            setIsLoading(false);
        }
    };



    const handleGoogleSignup = () => {
        initiateGoogleLogin("gym", "signup");
    };


    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center md:items-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Card */}
            <div className="relative w-full h-full md:h-auto md:w-[480px] bg-white md:rounded-2xl shadow-2xl p-6 md:p-8 transform transition-all animate-in fade-in duration-300 overflow-y-auto">

                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">
                            {step === 'DETAILS' ? 'Get Started' : 'Verify Email'}
                        </h2>
                        <p className="text-slate-500 mt-1 text-sm">
                            {step === 'DETAILS' ? 'Create your FITZELLY account' : `Enter code sent to ${email}`}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors bg-slate-100 p-1.5 rounded-full cursor-pointer"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 mb-4 text-center">
                        {error}
                    </div>
                )}

                {/* STEP 1: Details Form */}
                {step === 'DETAILS' && (
                    <form className="space-y-4" onSubmit={handleInitiateSignUp}>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-900 placeholder:text-slate-400 transition-all"
                                required
                            />
                        </div>

                        <div>
                            <PasswordInput
                                label="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <div>
                            <PasswordInput
                                label="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full bg-[#00ffd5] hover:bg-[#00e6c0] text-slate-900 font-bold py-3.5 rounded-xl transition-all shadow-[0_4px_14px_0_rgba(0,255,213,0.39)] hover:shadow-[0_6px_20px_rgba(0,255,213,0.23)] transform hover:-translate-y-0.5 mt-2 cursor-pointer flex items-center justify-center ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                "Send Verification Code"
                            )}
                        </button>
                    </form>
                )}

                {/* STEP 2: OTP Form */}
                {step === 'OTP' && (
                    <form className="space-y-6" onSubmit={handleCompleteSignUp}>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2 text-center">Enter 6-Digit Code</label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="123456"
                                maxLength={6}
                                className="w-full px-4 py-4 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-900 placeholder:text-slate-300 transition-all text-center text-2xl font-bold tracking-widest"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full bg-[#00ffd5] hover:bg-[#00e6c0] text-slate-900 font-bold py-3.5 rounded-xl transition-all shadow-[0_4px_14px_0_rgba(0,255,213,0.39)] hover:shadow-[0_6px_20px_rgba(0,255,213,0.23)] transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                "Verify & Create Account"
                            )}
                        </button>
                    </form>
                )}

                <div className="my-6 flex items-center gap-4">
                    <div className="h-px bg-slate-200 flex-1"></div>
                    <span className="text-slate-400 text-sm">Or</span>
                    <div className="h-px bg-slate-200 flex-1"></div>
                </div>

                <div className="space-y-4">
                    {step === 'DETAILS' && (
                        <div className="flex justify-center">
                            <button
                                type="button"
                                onClick={handleGoogleSignup}
                                className="w-full max-w-[300px] bg-white border border-slate-200 text-slate-700 font-semibold py-2.5 rounded-full hover:bg-slate-50 transition-all flex items-center justify-center gap-3 cursor-pointer shadow-sm"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                Signup with Google
                            </button>
                        </div>
                    )}

                    <p className="text-center text-slate-500 text-sm">
                        Already have an account?{' '}
                        <button
                            onClick={onSwitchToSignIn}
                            className="text-teal-500 font-semibold hover:text-teal-600 cursor-pointer"
                        >
                            Login
                        </button>
                    </p>
                </div>

            </div>
        </div>,
        document.body
    );
}