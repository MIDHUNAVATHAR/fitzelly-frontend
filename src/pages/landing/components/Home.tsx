import { ArrowRight } from "lucide-react";
import { useState } from "react";
import ForgotPasswordModal from "./ForgotPasswordModal";
import SignUpModal from "./SignUpModal";
import SignInModal from "./SignInModal";

export default function Home() {
    const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
    const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
    const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);

    return (
        <section id="home" className="pt-40 pb-20 px-4">
            <div className="max-w-4xl mx-auto text-center">
                <div className="inline-block bg-emerald-400/10 text-emerald-400 px-4 py-1.5 rounded-full text-sm font-semibold mb-8 border border-emerald-400/20">
                    Powerful Features
                </div>

                <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    Everything You Need to <span className="text-emerald-400">Run Your Gym</span>
                </h1>

                <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
                    From client management to revenue tracking, FITZELLY provides all the tools you need to streamline operations and grow your fitness business.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                    <button
                        onClick={() => setIsSignUpModalOpen(true)}
                        className="px-8 py-4 bg-emerald-400 text-black rounded-xl font-bold text-lg hover:bg-emerald-500 transition-all shadow-[0_0_20px_rgba(52,211,153,0.3)] hover:shadow-[0_0_30px_rgba(52,211,153,0.5)] flex items-center gap-2 group"
                    >
                        Start Free Trial
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button
                        onClick={() => {
                            const el = document.getElementById('features');
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="px-8 py-4 bg-zinc-900 text-white border border-zinc-800 rounded-xl font-bold text-lg hover:bg-zinc-800 transition-colors"
                    >
                        See Features
                    </button>
                </div>
            </div>

            {/* Modals */}
            <SignInModal
                isOpen={isSignInModalOpen}
                onClose={() => setIsSignInModalOpen(false)}
                onSwitchToSignUp={() => {
                    setIsSignInModalOpen(false);
                    setIsSignUpModalOpen(true);
                }}
                onForgotPassword={() => {
                    setIsSignInModalOpen(false);
                    setIsForgotPasswordModalOpen(true);
                }}
            />

            <SignUpModal
                isOpen={isSignUpModalOpen}
                onClose={() => setIsSignUpModalOpen(false)}
                onSwitchToSignIn={() => {
                    setIsSignUpModalOpen(false);
                    setIsSignInModalOpen(true);
                }}
            />

            <ForgotPasswordModal
                isOpen={isForgotPasswordModalOpen}
                onClose={() => setIsForgotPasswordModalOpen(false)}
                onSwitchToSignIn={() => {
                    setIsForgotPasswordModalOpen(false);
                    setIsSignInModalOpen(true);
                }}
            />
        </section>
    );
}