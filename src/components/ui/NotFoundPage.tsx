
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Dumbbell } from 'lucide-react';

const NotFoundPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 text-center relative overflow-hidden font-sans selection:bg-emerald-400/30">
            {/* Background Effects */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-400/10 rounded-full blur-[128px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-[128px]" />
            </div>

            <div className="max-w-md w-full animate-in fade-in zoom-in duration-500 z-10 flex flex-col items-center">

                {/* 404 Visual */}
                <div className="relative mb-8">
                    <h1 className="text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-zinc-800 to-black select-none opacity-50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-150 blur-sm pointer-events-none">
                        404
                    </h1>
                    <div className="w-32 h-32 bg-zinc-900 rounded-2xl border border-zinc-800 flex items-center justify-center relative shadow-2xl shadow-emerald-400/10 rotate-12 hover:rotate-0 transition-transform duration-500">
                        <Dumbbell className="w-16 h-16 text-emerald-400" strokeWidth={1.5} />
                        <div className="absolute -bottom-2 -right-2 bg-red-500/10 text-red-500 text-xs font-bold px-2 py-1 rounded border border-red-500/20">
                            MISSING
                        </div>
                    </div>
                </div>

                <h2 className="text-3xl font-bold text-white mb-3">
                    Dropped the Weight?
                </h2>

                <p className="text-zinc-400 mb-8 text-lg leading-relaxed">
                    Looks like this page skipped leg day. It doesn't exist or has been moved to another rack.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center justify-center px-6 py-3.5 rounded-xl bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all duration-300 border border-zinc-800 hover:border-zinc-700 font-medium group"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Go Back
                    </button>

                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center justify-center px-6 py-3.5 rounded-xl bg-emerald-400 text-black font-bold hover:bg-emerald-500 transition-all duration-300 shadow-[0_0_20px_rgba(52,211,153,0.3)] hover:shadow-[0_0_30px_rgba(52,211,153,0.5)] transform hover:-translate-y-0.5 group"
                    >
                        <Home className="w-5 h-5 mr-2" />
                        Back to Home
                    </button>
                </div>
            </div>

            {/* Footer Text */}
            <div className="absolute bottom-8 left-0 w-full text-center text-zinc-600 text-xs uppercase tracking-widest">
                Fitzelly Gym Management
            </div>
        </div>
    );
};

export default NotFoundPage;
