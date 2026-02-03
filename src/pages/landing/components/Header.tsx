import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/useAuth";
import SignInModal from "./SignInModal";
import SignUpModal from "./SignUpModal";
import ForgotPasswordModal from "./ForgotPasswordModal";
import { ROLES } from "../../../constants/roles";

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
    const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
    const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);

    const { user, isLoading } = useAuth();

    const navigate = useNavigate();

    const [searchParams] = useSearchParams();

    const isAuthenticated = !!user;
    const role = user?.role;

    const getDashboardPath = () => {
        switch (role) {
            case ROLES.SUPER_ADMIN:
                return "/fitzelly-hq";
            case ROLES.GYM:
                return "/gym/dashboard";
            case ROLES.TRAINER:
                return "/trainer/dashboard";
            case ROLES.CLIENT:
                return "/client/dashboard";
            default:
                return "/";
        }
    };

    const getDashboardLabel = () => {
        switch (role) {
            case ROLES.SUPER_ADMIN:
                return "Super Admin Dashboard";
            case ROLES.GYM:
                return "Gym Dashboard";
            case ROLES.TRAINER:
                return "Trainer Dashboard";
            case ROLES.CLIENT:
                return "Client Dashboard";
            default:
                return "Dashboard";
        }
    };

    useEffect(() => {
        const error = searchParams.get("error");
        if (error) {
            toast.error(error) 
        }
    }, [searchParams])


    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToSection = (id: string) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth" });
        setIsMobileMenuOpen(false);
    };

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                ? "bg-slate-900/90 backdrop-blur-md shadow-lg py-4"
                : "bg-transparent py-6"
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    {/* logo */}
                    <div
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    >
                        <div className="w-8 h-8 bg-[#00ffd5] rounded-lg flex items-center justify-center text-slate-900 font-bold text-xl">
                            F
                        </div>
                        <span className={`text-xl font-bold tracking-tight transition-colors ${isScrolled ? "text-white" : "text-slate-900"
                            }`}>
                            FITZELLY
                        </span>
                    </div>

                    <nav className="hidden md:flex items-center gap-8">
                        <button
                            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                            className={`font-medium transition-colors ${isScrolled
                                ? "text-slate-300 hover:text-white"
                                : "text-slate-900 hover:text-slate-900"
                                }`}
                        >
                            Home
                        </button>
                        <button
                            onClick={() => scrollToSection("features")}
                            className={`font-medium transition-colors ${isScrolled
                                ? "text-slate-300 hover:text-white"
                                : "text-slate-900 hover:text-slate-900"
                                }`}
                        >
                            Features
                        </button>
                        <button
                            onClick={() => scrollToSection("pricing")}
                            className={`font-medium transition-colors ${isScrolled
                                ? "text-slate-300 hover:text-white"
                                : "text-slate-900 hover:text-slate-900"
                                }`}
                        >
                            Pricing
                        </button>
                    </nav>

                    {/* desktop sigin/dashboard button */}
                    <div className="hidden md:flex items-center gap-4">
                        {isLoading ? (
                            <div className="w-6 h-6 border-2 border-[#00ffd5] border-t-transparent rounded-full animate-spin"></div>
                        ) : isAuthenticated ? (
                            <button
                                onClick={() => navigate(getDashboardPath())}
                                className="bg-[#00ffd5] text-slate-900 px-5 py-2.5 rounded-lg font-bold hover:bg-[#00e6c0] transition-colors cursor-pointer"
                            >
                                {getDashboardLabel()}
                            </button>
                        ) : (
                            <button
                                onClick={() => setIsSignInModalOpen(true)}
                                className="bg-[#00ffd5] text-slate-900 px-5 py-2.5 rounded-lg font-bold hover:bg-[#00e6c0] transition-colors cursor-pointer"
                            >
                                Sign In
                            </button>
                        )}
                    </div>

                    {/* mobile menu button */}
                    <button
                        className={`md:hidden ${isScrolled ? "text-white" : "text-slate-900"}`}
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* mobile menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-slate-900 absolute top-full left-0 right-0 border-t border-slate-800 p-4">
                    <div className="flex flex-col space-y-4">
                        <button
                            onClick={() => {
                                window.scrollTo({ top: 0, behavior: "smooth" });
                                setIsMobileMenuOpen(false);
                            }}
                            className="text-left text-slate-300 hover:text-white font-medium"
                        >
                            Home
                        </button>
                        <button
                            onClick={() => scrollToSection("features")}
                            className="text-left text-slate-300 hover:text-white font-medium"
                        >
                            Features
                        </button>
                        <button
                            onClick={() => scrollToSection("pricing")}
                            className="text-left text-slate-300 hover:text-white font-medium"
                        >
                            Pricing
                        </button>
                        <div className="h-px bg-slate-800 my-2"></div>
                        {isAuthenticated ? (
                            <button
                                onClick={() => {
                                    setIsMobileMenuOpen(false);
                                    navigate(getDashboardPath());
                                }}
                                className="w-full bg-[#00ffd5] text-slate-900 px-5 py-2.5 rounded-lg font-bold hover:bg-[#00e6c0] transition-colors text-center cursor-pointer"
                            >
                                {getDashboardLabel()}
                            </button>
                        ) : (
                            <button
                                onClick={() => {
                                    setIsMobileMenuOpen(false);
                                    setIsSignInModalOpen(true);
                                }}
                                className="w-full bg-[#00ffd5] text-slate-900 px-5 py-2.5 rounded-lg font-bold hover:bg-[#00e6c0] transition-colors text-center cursor-pointer"
                            >
                                Sign In
                            </button>
                        )}
                    </div>
                </div>
            )}

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
        </header>
    );
}