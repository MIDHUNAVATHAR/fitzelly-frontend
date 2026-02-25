import React from 'react';
import { LayoutDashboard, LogOut, HeartPulse, User, Building } from 'lucide-react';
import { useLogout } from '../../hooks/useLogout';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
    isMobileOpen: boolean;
    setIsMobileOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, setIsMobileOpen }) => {
    const location = useLocation();

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/client/dashboard' },
        { id: 'profile', label: 'Profile', icon: User, path: '/client/profile' },
        { id: 'gym_details', label: 'Gym Details', icon: Building, path: '/client/gym-details' }
    ];

    const { handleLogout } = useLogout();

    return (
        <>
            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed top-0 left-0 z-50 h-screen w-64 bg-zinc-900 border-r border-zinc-800 transition-transform duration-300 ease-in-out flex flex-col
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:h-full lg:flex-shrink-0
        `}
            >
                <div className="flex flex-col h-full w-full">
                    {/* Logo */}
                    <div className="p-6 border-b border-zinc-800 flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-emerald-400 flex items-center justify-center">
                            <HeartPulse className="w-5 h-5 text-black" />
                        </div>
                        <span className="text-xl font-bold text-white tracking-wider">FITZ<span className="text-emerald-400">ELLY</span></span>
                    </div>

                    {/* Menu */}
                    <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname.startsWith(item.path);

                            return (
                                <Link
                                    key={item.id}
                                    to={item.path}
                                    onClick={() => setIsMobileOpen(false)}
                                    className={`
                    w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group
                    ${isActive
                                            ? 'bg-emerald-400/10 text-emerald-400'
                                            : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                                        }
                  `}
                                >
                                    <Icon
                                        className={`w-5 h-5 ${isActive ? 'text-emerald-400' : 'text-zinc-500 group-hover:text-white'}`}
                                    />
                                    <span className="font-medium">{item.label}</span>
                                    {isActive && (
                                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Logout */}
                    <div className="p-4 border-t border-zinc-800 mt-auto">
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-400/10 transition-colors">
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">Logout</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
