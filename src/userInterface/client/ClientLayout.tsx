import React, { useState } from 'react';
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";

const ClientLayout: React.FC = () => {
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    return (
        <div className="h-screen bg-black flex font-sans overflow-hidden w-full">
            {/* Sidebar Component */}
            <Sidebar
                isMobileOpen={isMobileOpen}
                setIsMobileOpen={setIsMobileOpen}
            />

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-full bg-black text-foreground relative overflow-hidden">

                {/* Mobile Header */}
                <div className="lg:hidden flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-30 flex-shrink-0">
                    <button
                        onClick={() => setIsMobileOpen(true)}
                        className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <span className="font-bold text-white">FITZELLY</span>
                    <div className="w-10" />
                </div>

                <div id="main-scroll-container" className="flex-1 overflow-y-auto p-4 lg:p-6 custom-scrollbar w-full">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default ClientLayout;
