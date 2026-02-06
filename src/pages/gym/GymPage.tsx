import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from "./components/Sidebar";

import Profile from "./components/Profile";

const GymPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <div className="text-white">Dashboard Component (Coming Soon)</div>;
            case 'profile':
                return <Profile />;
            case 'members':
                return <div className="text-white">Members Component (Coming Soon)</div>;
            case 'trainers':
                return <div className="text-white">Trainers Component (Coming Soon)</div>;
            case 'payments':
                return <div className="text-white">Payments Component (Coming Soon)</div>;
            case 'settings':
                return <div className="text-white">Settings Component (Coming Soon)</div>;
            default:
                return <div className="text-white">Dashboard Component (Coming Soon)</div>;
        }
    };

    return (
        <div className="h-screen bg-black flex font-sans overflow-hidden w-full">
            {/* Sidebar Component */}
            <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
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
                    <div className="w-10" /> {/* Spacer for centering */}
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-4 lg:p-6 custom-scrollbar w-full">
                    <div className="w-full">
                        {renderContent()}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default GymPage;
