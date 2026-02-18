
import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { LayoutDashboard } from 'lucide-react';
import Spinner from '../../components/ui/Spinner';

const SuperAdminLayout: React.FC = () => {
    const [isMobileOpen, setIsMobileOpen] = React.useState(false);

    return (
        <div className="h-screen bg-black flex font-sans overflow-hidden w-full">
            <Sidebar
                isMobileOpen={isMobileOpen}
                setIsMobileOpen={setIsMobileOpen}
            />

            <main className="flex-1 flex flex-col h-full bg-black text-foreground relative overflow-hidden">
                <div className="lg:hidden flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-30 flex-shrink-0">
                    <button
                        onClick={() => setIsMobileOpen(true)}
                        className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
                    >
                        <LayoutDashboard className="w-6 h-6" />
                    </button>
                    <span className="font-bold text-white tracking-widest">
                        FITZ<span className="text-emerald-400">ELLY</span>
                        <span className="ml-2 text-[10px] text-zinc-500 font-normal border border-zinc-800 px-2 py-0.5 rounded">ADMIN</span>
                    </span>
                    <div className="w-10" />
                </div>

                <div className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar w-full">
                    <div className="w-full max-w-[1600px] mx-auto">
                        <Suspense fallback={<Spinner />}>
                            <Outlet />
                        </Suspense>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SuperAdminLayout;
