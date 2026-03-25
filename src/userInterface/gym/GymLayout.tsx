import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Outlet } from "react-router-dom";
import { Menu, Dumbbell, Bell, Check, Trash2, Inbox } from "lucide-react";
import Sidebar from "./Sidebar";
import { useAuth } from "../../context/useAuth";
import { socket } from "../../config/socket";
import toast from "react-hot-toast";
import { 
    getUnreadNotifications, 
    getReadNotifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead
} from "../../api/notification.api";
import type { NotificationItem } from "../../api/notification.api";

const GymLayout: React.FC = () => {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    
    // Notifications state
    const [unreadNotifications, setUnreadNotifications] = useState<NotificationItem[]>([]);
    const [readNotifications, setReadNotifications] = useState<NotificationItem[]>([]);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'unread' | 'read'>('unread');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingRead, setIsLoadingRead] = useState(false);

    const { user } = useAuth();
    const notifRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Initial fetch of unread notifications
    useEffect(() => {
        if (!user) return;
        getUnreadNotifications().then(data => {
            setUnreadNotifications(data);
        }).catch(err => console.error("Failed to load notifications", err));
    }, [user]);

    // Fetch read notifications when tab switched or page changed
    const fetchReadNotifications = useCallback(async (pageNum: number, append: boolean = false) => {
        if (!user || isLoadingRead || !hasMore) return;
        setIsLoadingRead(true);
        try {
            const data = await getReadNotifications(pageNum);
            if (data.length < 10) setHasMore(false);
            
            if (append) {
                setReadNotifications(prev => {
                    const existingIds = new Set(prev.map(p => p.id));
                    const newItems = data.filter(d => !existingIds.has(d.id));
                    return [...prev, ...newItems];
                });
            } else {
                setReadNotifications(data);
            }
        } catch (e) {
            console.error("Failed to fetch read notifications", e);
        } finally {
            setIsLoadingRead(false);
        }
    }, [user, isLoadingRead, hasMore]);

    // Handle Tab switch
    useEffect(() => {
        if (activeTab === 'read' && page === 1 && readNotifications.length === 0) {
            fetchReadNotifications(1, false);
        }
    }, [activeTab]); // eslint-disable-line

    // Infinite scroll handler
    const handleScroll = () => {
        if (!scrollRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        if (scrollHeight - scrollTop <= clientHeight * 1.5 && activeTab === 'read' && !isLoadingRead && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchReadNotifications(nextPage, true);
        }
    };

    // Close notification dropdown if clicked outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setIsNotifOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (!user) return;

        if (!socket.connected) {
            socket.auth = { id: user.id, role: user.role };
            socket.connect();
        }
        
        socket.emit("join-gym", user.id);

        const targetEvent = "NEW_NOTIFICATION";

        const handleNewNotification = (data: NotificationItem) => {
            setUnreadNotifications(prev => [data, ...prev]);

            toast.custom(
                (t) => (
                    <div
                        className={`${t.visible ? 'animate-enter' : 'animate-leave'} 
                        max-w-md w-full bg-zinc-900 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-zinc-800`}
                    >
                        <div className="flex-1 w-0 p-4">
                            <div className="flex items-start">
                                <div className="flex-shrink-0 pt-0.5">
                                    <div className="h-10 w-10 bg-emerald-500/10 rounded-full flex items-center justify-center">
                                        <Bell className="h-5 w-5 text-emerald-500" />
                                    </div>
                                </div>
                                <div className="ml-3 flex-1">
                                    <p className="text-sm font-medium text-white">
                                        New Notification
                                    </p>
                                    <p className="mt-1 text-sm text-zinc-400">
                                        {data.message}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex border-l border-zinc-800">
                            <button
                                onClick={() => toast.dismiss(t.id)}
                                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-emerald-500 hover:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                ),
                { duration: 5000, position: 'top-right' }
            );
        };

        socket.on(targetEvent, handleNewNotification);
        return () => {
            socket.off(targetEvent, handleNewNotification);
        };
    }, [user]);

    const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await markNotificationAsRead(id);
            const notif = unreadNotifications.find(n => n.id === id);
            setUnreadNotifications(prev => prev.filter(n => n.id !== id));
            if (notif) {
                setReadNotifications(prev => [{ ...notif, isRead: true }, ...prev]);
            }
        } catch (e) {
            toast.error("Failed to mark as read");
        }
    };

    const handleMarkAllRead = async () => {
        if (unreadNotifications.length === 0) return;
        try {
            await markAllNotificationsAsRead();
            const marked = unreadNotifications.map(n => ({...n, isRead: true}));
            setReadNotifications(prev => [...marked, ...prev]);
            setUnreadNotifications([]);
        } catch(e) {
            toast.error("Failed to mark all as read");
        }
    };

    const unreadCount = unreadNotifications.length;
    const currentList = activeTab === 'unread' ? unreadNotifications : readNotifications;

    const NotificationBell = () => (
        <div className="relative" ref={notifRef}>
            <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors focus:outline-none"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-black">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 min-w-80 bg-zinc-900 border border-zinc-800 shadow-2xl rounded-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/90 backdrop-blur-sm">
                        <div className="flex bg-zinc-800 rounded-md p-1">
                            <button
                                onClick={() => setActiveTab('unread')}
                                className={`px-3 py-1 text-xs font-semibold rounded ${activeTab === 'unread' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'}`}
                            >
                                Unread ({unreadCount})
                            </button>
                            <button
                                onClick={() => setActiveTab('read')}
                                className={`px-3 py-1 text-xs font-semibold rounded ${activeTab === 'read' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'}`}
                            >
                                Readed
                            </button>
                        </div>
                        <div className="flex gap-2">
                            {unreadCount > 0 && activeTab === 'unread' && (
                                <button onClick={handleMarkAllRead} className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 font-medium">
                                    <Check className="w-3 h-3" /> Mark all read
                                </button>
                            )}
                        </div>
                    </div>
                    
                    <div 
                        ref={scrollRef}
                        onScroll={handleScroll}
                        className="max-h-96 overflow-y-auto custom-scrollbar"
                    >
                        {currentList.length === 0 ? (
                            <div className="py-8 text-center text-zinc-500 text-sm">
                                <Inbox className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                {activeTab === 'unread' ? "No new notifications" : "No read notifications"}
                            </div>
                        ) : (
                            <div className="divide-y divide-zinc-800">
                                {currentList.map(notif => (
                                    <div 
                                        key={notif.id} 
                                        className={`p-4 hover:bg-zinc-800/50 transition-colors flex gap-3 items-start ${!notif.isRead ? 'bg-zinc-800/20' : ''}`}
                                    >
                                        <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${!notif.isRead ? 'bg-emerald-500' : 'bg-transparent'}`} />
                                        <div className="flex-1">
                                            <p className={`text-sm ${!notif.isRead ? 'text-white' : 'text-zinc-400'}`}>
                                                {notif.message}
                                            </p>
                                            <div className="flex items-center justify-between mt-2">
                                                <p className="text-xs text-zinc-500">
                                                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                                                </p>
                                                {!notif.isRead && (
                                                    <button 
                                                        onClick={(e) => handleMarkAsRead(notif.id, e)}
                                                        className="text-[10px] text-emerald-400 font-medium hover:underline flex items-center gap-1"
                                                    >
                                                        <Check className="w-3 h-3"/> Mark as read
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {activeTab === 'read' && isLoadingRead && (
                                    <div className="p-3 text-center text-xs text-zinc-500">Loading more...</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );

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
                <div className="lg:hidden flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm z-30 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsMobileOpen(true)}
                            className="p-2 -ml-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <span className="font-bold text-white tracking-widest text-sm">FITZELLY</span>
                    </div>
                    <NotificationBell />
                </div>

                {/* Desktop Topbar */}
                <div className="hidden lg:flex items-center justify-between p-4 px-6 border-b border-zinc-800 bg-black z-30 flex-shrink-0">
                    <div className="text-sm font-semibold tracking-widest text-zinc-400">GYM PORTAL</div>
                    <div className="flex items-center gap-4">
                        <NotificationBell />
                    </div>
                </div>

                <div id="main-scroll-container" className="flex-1 overflow-y-auto p-4 lg:p-6 custom-scrollbar w-full relative">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default GymLayout;
