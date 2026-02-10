import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import PasswordInput from './PasswordInput';
import { login } from "../../../api/login.api";
import { useAuth } from '../../../context/useAuth';
import { initiateGoogleLogin } from '../../../api/google-login.api';
import axios from 'axios';


interface SignInModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSwitchToSignUp?: () => void;
    onForgotPassword?: () => void;
}

export default function SignInModal({ isOpen, onClose, onSwitchToSignUp, onForgotPassword }: SignInModalProps) {
    const [selectedRole, setSelectedRole] = useState("client");
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const resetError = () => {
        setError("")
    }

    // Prevent background scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const { login: updateAuthContext } = useAuth();

    const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await login({ email, password, role: selectedRole });

            if (response.status == "success") {

                const { accessToken, role, email, id } = response.data;
                updateAuthContext(accessToken, { email, id, role });

                onClose();

                const targetPath = role === "super-admin" ? "/fitzelly-hq" : `/${role}/dashboard`;

                navigate(targetPath, { replace: true });

            } else {

                setError(response.message || 'Sign in failed');
            }
        } catch (err) {

            if (axios.isAxiosError(err)) {

                if (err.response?.status === 404) {
                    setError("Login for this role currently unavailable");
                } else {
                    setError(err?.response?.data?.message);
                }
            } else
                setError("Network error. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };


    const handleGoogleLogin = () => {
        initiateGoogleLogin(selectedRole, "login");
    };


    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center md:items-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Card */}
            <div className="relative w-full h-full md:h-auto md:w-[480px] bg-zinc-900 border border-zinc-800 md:rounded-2xl shadow-2xl p-6 md:p-8 transform transition-all animate-in fade-in duration-300 overflow-y-auto">

                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
                        <p className="text-zinc-400 mt-1 text-sm">Sign in to your FITZELLY account</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-zinc-500 hover:text-white transition-colors bg-zinc-800 hover:bg-zinc-700 p-1.5 rounded-full cursor-pointer"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Role Toggle */}
                <div className="mb-6">
                    <div className="flex gap-2 p-1 bg-zinc-950 rounded-lg border border-zinc-800">
                        <button
                            type="button"
                            onClick={() => setSelectedRole("gym")}
                            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${selectedRole === "gym"
                                ? 'bg-zinc-800 text-white shadow-sm'
                                : 'text-zinc-500 hover:text-zinc-300'
                                } `}
                        >
                            Gym
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedRole('client')}
                            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${selectedRole === 'client'
                                ? 'bg-zinc-800 text-white shadow-sm'
                                : 'text-zinc-500 hover:text-zinc-300'
                                } `}
                        >
                            Client
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedRole("trainer")}
                            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${selectedRole === "trainer"
                                ? 'bg-zinc-800 text-white shadow-sm'
                                : 'text-zinc-500 hover:text-zinc-300'
                                } `}
                        >
                            Trainer
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form className="space-y-5" onSubmit={handleSignIn}>
                    {error && (
                        <div className="bg-red-500/10 text-red-500 text-sm p-3 rounded-lg border border-red-500/20 mb-4 text-center">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-zinc-300 mb-2">Email</label>
                        <div className="relative">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-white placeholder:text-zinc-600 transition-all font-medium"
                                required
                            />
                        </div>
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

                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={onForgotPassword}
                            className="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors cursor-pointer"
                        >
                            Forgot password?
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full bg-emerald-400 hover:bg-emerald-500 text-black font-bold py-3.5 rounded-xl transition-all shadow-[0_0_10px_rgba(52,211,153,0.3)] hover:shadow-[0_0_20px_rgba(52,211,153,0.5)] transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center ${isLoading ? 'opacity-70 cursor-not-allowed' : ''} `}
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            "Sign In"
                        )}
                    </button>
                </form>

                <div className="my-6 flex items-center gap-4">
                    <div className="h-px bg-zinc-800 flex-1"></div>
                    <span className="text-zinc-500 text-sm">Or continue with</span>
                    <div className="h-px bg-zinc-800 flex-1"></div>
                </div>

                <div className="flex justify-center">
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="w-full max-w-[300px] bg-zinc-800 border border-zinc-700 text-zinc-300 font-semibold py-2.5 rounded-full hover:bg-zinc-700 hover:text-white transition-all flex items-center justify-center gap-3 cursor-pointer shadow-sm"
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
                        Login with Google
                    </button>
                </div>

                <p className="mt-8 text-center text-zinc-500 text-sm">
                    Don't have an account?{' '}
                    <button
                        onClick={() => { resetError(); onSwitchToSignUp?.() }}
                        className="text-emerald-400 font-semibold hover:text-emerald-300 cursor-pointer"
                    >
                        Start free trial
                    </button>
                </p>

            </div>
        </div>,
        document.body
    );
}