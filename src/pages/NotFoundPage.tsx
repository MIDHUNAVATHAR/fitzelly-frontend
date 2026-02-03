
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFoundPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">
            <div className="max-w-md w-full animate-fade-in-up z-10">
                <h1 className="text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-500 mb-8 animate-pulse">
                    404
                </h1>

                <h2 className="text-3xl font-bold text-slate-900 mb-4">
                    Page Not Found
                </h2>
                <p className="text-slate-500 mb-8 text-lg">
                    Oops! The page you are looking for has vanished into thin air.
                    It might have been moved or deleted.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center justify-center px-6 py-3 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all duration-300 border border-slate-200 hover:border-slate-300 group"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Go Back
                    </button>

                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center justify-center px-6 py-3 rounded-lg bg-cyan-400 text-slate-900 font-bold hover:bg-cyan-300 transition-all duration-300 shadow-lg shadow-cyan-400/20 group"
                    >
                        <Home className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                        Back to Home
                    </button>
                </div>
            </div>

            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl" />
            </div>
        </div>
    );
};

export default NotFoundPage;
