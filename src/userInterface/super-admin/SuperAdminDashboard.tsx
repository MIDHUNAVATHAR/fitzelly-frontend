import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';

import SuperAdmProfile from './superAdmin-profile/SuperAdmin-Profile';


const SuperAdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState("dashboard");
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
    };

    // Main Content Renderer
    const renderContent = () => {

        switch (activeTab) {
            case 'dashboard':
                return <div className='text-white'>coming...</div>
            case 'profile':
                return <SuperAdmProfile />;
            case 'gyms':
                return <div>Loading...</div>
                break
            default:
                return <div className='text-white'>coming...</div>
        }
    };

    return (
        <div className="h-screen bg-black flex font-sans overflow-hidden w-full">
            {/* Sidebar Component */}
            <Sidebar
                activeTab={activeTab}
                setActiveTab={handleTabChange}
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
                    <span className="font-bold text-white tracking-widest">
                        FITZ<span className="text-emerald-400">ELLY</span>
                        <span className="ml-2 text-[10px] text-zinc-500 font-normal border border-zinc-800 px-2 py-0.5 rounded">ADMIN</span>
                    </span>
                    <div className="w-10" />
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar w-full">
                    <div className="w-full max-w-[1600px] mx-auto">
                        {renderContent()}
                    </div>
                </div>
            </main>
        </div>
    );
};



export default SuperAdminDashboard;