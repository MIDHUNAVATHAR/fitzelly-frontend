import React, { useState } from 'react';
import { Mail, Lock, Key, ArrowRight, ArrowLeft, ShieldCheck, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { login } from '../../api/login.api';
import { initiateForgotpassword } from '../../api/forgotpassword.api';
import { verifyForgotPassword } from '../../api/forgotpassword.api';
import { resetPassword } from '../../api/forgotpassword.api';
import { useAuth } from '../../context/useAuth';
import { isAxiosError } from 'axios';
import { ROLES } from '../../constants/roles';
import PasswordInput from '../landing/components/PasswordInput';

type AuthView = 'LOGIN' | 'FORGOT_EMAIL' | 'VERIFY_OTP' | 'RESET_PASSWORD';

const SuperAdminLoginPage: React.FC = () => {
    const navigate = useNavigate();
    const [view, setView] = useState<AuthView>('LOGIN');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login: updateAuthContext } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) return toast.error('Please fill in all fields');

        setIsLoading(true);

        try {
            const response = await login({ email: email, password: password, role: ROLES.SUPER_ADMIN })
            if (response.status == "success") {

                const { accessToken, role, email, id } = response.data;
                updateAuthContext(accessToken, { email, id, role })

                toast.success(response.message || "Welcome back, Super admin")
                setIsLoading(false);
                navigate("/super-admin/dashboard");
            } else {
                toast.error(response.message || "login failed")
                setIsLoading(false);

            }

        } catch (error) {
            setIsLoading(false);
            if (isAxiosError(error)) {
                const errorMessage = error.response?.data?.message || "Login failed. please check your credentials";
                toast.error(errorMessage)
            }
        }

    };

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return toast.error('Please enter your email');
        setIsLoading(true);
        try {
            const result = await initiateForgotpassword({ email: email, role: ROLES.SUPER_ADMIN })
            toast.success(result?.message || "An otp send to your email ")
            setIsLoading(false)
            setView('VERIFY_OTP')
        } catch (error) {
            if (isAxiosError(error)) {
                const errorMessage = error.response?.data.message;
                toast.error(errorMessage)
            }
            setIsLoading(false)
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!otp) return toast.error('Please enter the OTP');
        setIsLoading(false);
        try {
            const result = await verifyForgotPassword({ email: email, role: ROLES.SUPER_ADMIN, otp: otp })
            toast.success(result?.message || "otp verified")
            setIsLoading(false)
            setView('RESET_PASSWORD')
        } catch (error) {
            if (isAxiosError(error)) {
                const errorMessage = error.response?.data.message;
                toast.error(errorMessage)
            }
            setIsLoading(false)
        }

    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPassword || !confirmPassword) return toast.error('Please fill all fields');
        if (newPassword !== confirmPassword) return toast.error('Passwords do not match');
        setIsLoading(true);
        try {
            const result = await resetPassword({ email: email, password: newPassword, otp: otp, role: ROLES.SUPER_ADMIN });
            toast.success(result?.message || "Passoword Reset Successfull");
            setIsLoading(false)

            setView("LOGIN");

        } catch (error) {
            if (isAxiosError(error)) {
                const errorMessage = error.response?.data.message;
                toast.error(errorMessage)
            }
            setIsLoading(false)
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-0 md:p-4">
            {/* Modal Container */}
            <div className="w-full h-screen md:w-full md:h-auto md:max-w-md md:rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-y-auto animate-fade-in-up md:min-w-[400px] relative">


                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-4 right-4 md:hidden text-zinc-500 hover:text-zinc-300 z-20"
                    aria-label="Close"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Header Section */}
                <div className="bg-zinc-950 p-6 text-center relative overflow-hidden flex-shrink-0 border-b border-zinc-800">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10">
                        <div className="absolute top-10 left-10 w-20 h-20 bg-emerald-400 rounded-full blur-xl"></div>
                        <div className="absolute bottom-10 right-10 w-20 h-20 bg-emerald-600 rounded-full blur-xl"></div>
                    </div>

                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-10 h-10 bg-emerald-400 rounded-lg flex items-center justify-center text-black font-bold text-xl mb-3 shadow-lg shadow-emerald-400/20">
                            F
                        </div>
                        <h1 className="text-xl font-bold text-white mb-1">Fitzelly</h1>
                        <p className="text-emerald-400 text-sm font-medium">Super Admin Portal</p>
                    </div>
                </div>

                {/* Body Section */}
                <div className="p-6 md:p-8 flex-1 flex flex-col">
                    {/* LOGIN VIEW */}
                    {view === 'LOGIN' && (
                        <form onSubmit={handleLogin} className="space-y-6 flex-1 flex flex-col">
                            <div className="space-y-6 flex-1">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5 block z-10" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-black border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-white placeholder:text-zinc-600 transition-all font-medium relative"
                                            placeholder="admin@fitzelly.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <PasswordInput
                                        label="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="mb-2"
                                    />
                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => setView('FORGOT_EMAIL')}
                                            className="text-sm text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                                        >
                                            Forgot Password?
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full bg-emerald-400 hover:bg-emerald-500 text-black py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 shadow-[0_0_10px_rgba(52,211,153,0.3)] hover:shadow-[0_0_20px_rgba(52,211,153,0.5)] transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed mt-auto`}
                            >
                                {isLoading ? 'Authenticating...' : 'Sign In'}
                                {!isLoading && <ArrowRight className="w-4 h-4" />}
                            </button>
                        </form>
                    )}

                    {/* FORGOT EMAIL VIEW */}
                    {view === 'FORGOT_EMAIL' && (
                        <form onSubmit={handleSendOtp} className="space-y-6 flex-1 flex flex-col animate-fade-in-up">
                            <div className="space-y-6 flex-1">
                                <div className="text-center mb-6">
                                    <h3 className="text-xl font-bold text-white">Reset Password</h3>
                                    <p className="text-zinc-400 text-sm mt-2">Enter your email to receive an OTP.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5 block z-10" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-black border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-white placeholder:text-zinc-600 transition-all font-medium relative"
                                            placeholder="admin@fitzelly.com"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 mt-auto">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-emerald-400 text-black py-3 rounded-lg font-bold hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 shadow-[0_0_10px_rgba(52,211,153,0.3)] hover:shadow-[0_0_20px_rgba(52,211,153,0.5)] transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? 'Sending...' : 'Send OTP'}
                                    {!isLoading && <ArrowRight className="w-4 h-4" />}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setView('LOGIN')}
                                    className="w-full text-zinc-500 py-2 font-medium hover:text-white transition-colors flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <ArrowLeft className="w-4 h-4" /> Back to Login
                                </button>
                            </div>
                        </form>
                    )}

                    {/* VERIFY OTP VIEW */}
                    {view === 'VERIFY_OTP' && (
                        <form onSubmit={handleVerifyOtp} className="space-y-6 flex-1 flex flex-col animate-fade-in-up">
                            <div className="space-y-6 flex-1">
                                <div className="text-center mb-6">
                                    <h3 className="text-xl font-bold text-white">Verify OTP</h3>
                                    <p className="text-zinc-400 text-sm mt-2">Enter the verification code sent to {email}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">One-Time Password</label>
                                    <div className="relative">
                                        <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5 block z-10" />
                                        <input
                                            type="text"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-black border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-white placeholder:text-zinc-600 transition-all tracking-widest text-center text-lg font-bold relative"
                                            placeholder="123456"
                                            maxLength={6}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 mt-auto">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-emerald-400 text-black py-3 rounded-lg font-bold hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 shadow-[0_0_10px_rgba(52,211,153,0.3)] hover:shadow-[0_0_20px_rgba(52,211,153,0.5)] transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? 'Verifying...' : 'Verify OTP'}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setView('FORGOT_EMAIL')}
                                    className="w-full text-zinc-500 py-2 font-medium hover:text-white transition-colors flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <ArrowLeft className="w-4 h-4" /> Change Email
                                </button>
                            </div>
                        </form>
                    )}

                    {/* RESET PASSWORD VIEW */}
                    {view === 'RESET_PASSWORD' && (
                        <form onSubmit={handleResetPassword} className="space-y-6 flex-1 flex flex-col animate-fade-in-up">
                            <div className="space-y-6 flex-1">
                                <div className="text-center mb-6">
                                    <h3 className="text-xl font-bold text-white">New Password</h3>
                                    <p className="text-zinc-400 text-sm mt-2">Create a secure password including numbers and symbols.</p>
                                </div>

                                <div>
                                    <PasswordInput
                                        label="New Password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="mb-4"
                                    />
                                    <PasswordInput
                                        label="Confirm Password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-emerald-400 text-black py-3 rounded-lg font-bold hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 shadow-[0_0_10px_rgba(52,211,153,0.3)] hover:shadow-[0_0_20px_rgba(52,211,153,0.5)] transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed mt-auto"
                            >
                                {isLoading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SuperAdminLoginPage;
