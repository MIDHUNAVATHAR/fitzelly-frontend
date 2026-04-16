import React, { useState, useEffect } from 'react';
import { 
    Calendar, 
    Clock, 
    ChevronRight, 
    AlertCircle, 
    CheckCircle2, 
    Search,
    Dumbbell,
    LayoutDashboard
} from 'lucide-react';
import { getEquipments } from '../../../api/equipment.api';
import type { Equipment } from '../../../api/equipment.api';
import { getEquipmentSlots, bookEquipment, getMyBookings, cancelBooking } from '../../../api/equipment-booking.api';
import type { EquipmentSlot, EquipmentBooking } from '../../../api/equipment-booking.api';
import { getClientProfile } from '../../../api/client-profile.api';
import { format, addDays } from 'date-fns';
import { toast } from 'react-hot-toast';
import { isAxiosError } from 'axios';

const EquipmentBookingPage: React.FC = () => {
    const [gymId, setGymId] = useState<string | null>(null);
    const [equipments, setEquipments] = useState<Equipment[]>([]);
    const [myBookings, setMyBookings] = useState<EquipmentBooking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isBooking, setIsBooking] = useState(false);
    const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
    const [slots, setSlots] = useState<EquipmentSlot[]>([]);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Confirmation Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pendingSlot, setPendingSlot] = useState<EquipmentSlot | null>(null);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [bookingToCancel, setBookingToCancel] = useState<EquipmentBooking | null>(null);
    const [isCancelling, setIsCancelling] = useState(false);

    const tomorrow = addDays(new Date(), 1);
    const tomorrowStr = format(tomorrow, 'yyyy-MM-dd');
    const todayStr = format(new Date(), 'yyyy-MM-dd');

    useEffect(() => {
        const init = async () => {
            try {
                const profile = await getClientProfile();
                if (profile.profile.gymId) {
                    setGymId(profile.profile.gymId);
                    const [equipRes, bookingsRes] = await Promise.all([
                        getEquipments(1, 100, '', profile.profile.gymId),
                        getMyBookings()
                    ]);
                    
                    if (Array.isArray(equipRes)) {
                        setEquipments(equipRes);
                    } else if (equipRes?.equipments) {
                        setEquipments(equipRes.equipments);
                    } else {
                        setEquipments([]);
                    }

                    setMyBookings(bookingsRes || []);
                }
            } catch (error) {
                console.error("Initialization failed:", error);
                toast.error("Failed to load equipment data");
            } finally {
                setIsLoading(false);
            }
        };
        init();
    }, []);

    const fetchSlots = async (equipmentId: string) => {
        setIsLoadingSlots(true);
        try {
            const data = await getEquipmentSlots(equipmentId, tomorrowStr);
            setSlots(data);
        } catch {
            toast.error("Failed to load slots");
        } finally {
            setIsLoadingSlots(false);
        }
    };

    const handleEquipmentSelect = (equipment: Equipment) => {
        setSelectedEquipment(equipment);
        fetchSlots(equipment.id);
    };

    const initiateBooking = (slot: EquipmentSlot) => {
        setPendingSlot(slot);
        setIsModalOpen(true);
    };

    const handleConfirmBooking = async () => {
        if (!gymId || !selectedEquipment || !pendingSlot) return;
        
        setIsModalOpen(false);
        setIsBooking(true);
        try {
            await bookEquipment({
                gymId,
                equipmentId: selectedEquipment.id,
                date: tomorrowStr,
                startTime: pendingSlot.startTime
            });
            toast.success(`Reserved ${selectedEquipment.name} at ${pendingSlot.startTime}`);
            
            // Refresh bookings and slots
            const [updatedBookings] = await Promise.all([
                getMyBookings(),
                fetchSlots(selectedEquipment.id)
            ]);
            setMyBookings(updatedBookings);
        } catch (error: unknown) {
            const errorMsg = isAxiosError(error) ? error.response?.data?.message : "Booking failed";
            toast.error(errorMsg || "Booking failed");
        } finally {
            setIsBooking(false);
            setPendingSlot(null);
        }
    };

    const handleCancelBooking = (booking: EquipmentBooking) => {
        setBookingToCancel(booking);
        setIsCancelModalOpen(true);
    };

    const confirmCancellation = async () => {
        if (!bookingToCancel) return;
        
        setIsCancelling(true);
        try {
            await cancelBooking(bookingToCancel.id);
            toast.success("Reservation cancelled");
            setIsCancelModalOpen(false);
            const updatedBookings = await getMyBookings();
            setMyBookings(updatedBookings);
            if (selectedEquipment) {
                fetchSlots(selectedEquipment.id);
            }
        } catch (error: unknown) {
            const errorMsg = isAxiosError(error) ? error.response?.data?.message : "Cancellation failed";
            toast.error(errorMsg || "Cancellation failed");
        } finally {
            setIsCancelling(false);
            setBookingToCancel(null);
        }
    };

    if (isLoading) {
        return (
            <div className="h-screen flex flex-col items-center justify-center p-10 bg-zinc-950">
                <div className="relative">
                    <div className="w-24 h-24 rounded-full border-t-2 border-emerald-500 animate-spin" />
                    <Dumbbell className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-500 animate-pulse" size={32} />
                </div>
                <p className="mt-8 text-zinc-500 font-black uppercase tracking-[0.5em] text-[10px]">Synchronizing Arena...</p>
            </div>
        );
    }

    const filteredEquipments = equipments.filter(e => 
        e.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-4 md:p-8 space-y-10 bg-zinc-950 min-h-full text-white pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-900">
                <div className="space-y-1">
                    <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">
                        Gear <span className="text-emerald-500">Reservations</span>
                    </h1>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black uppercase text-emerald-500 tracking-tighter">Booking for Tomorrow</span>
                        </div>
                        <span className="text-zinc-700 font-bold">•</span>
                        <span className="text-zinc-400 text-xs font-black uppercase italic tracking-widest">{format(tomorrow, 'EEEE, dd MMMM')}</span>
                    </div>
                </div>
                
                <div className="relative group w-full md:w-96">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search Equipment..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-zinc-900/30 border border-zinc-800 rounded-2xl py-5 pl-14 pr-8 text-sm font-bold focus:outline-none focus:border-emerald-500/50 focus:ring-8 focus:ring-emerald-500/5 transition-all placeholder:text-zinc-700"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                {/* Left Side: Equipment Selection List (Compact) */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Inventory</h3>
                        <div className="h-px flex-1 mx-4 bg-zinc-900" />
                        <span className="text-[10px] font-bold text-zinc-700 uppercase">{filteredEquipments.length} UNIT</span>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2.5 h-[calc(100vh-300px)] overflow-y-auto pr-2 custom-scrollbar">
                        {filteredEquipments.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => handleEquipmentSelect(item)}
                                className={`group relative flex items-center p-3 rounded-2xl border transition-all duration-300 ${
                                    selectedEquipment?.id === item.id 
                                    ? 'bg-emerald-500/5 border-emerald-500/50 shadow-[0_10px_30px_rgba(16,185,129,0.1)]' 
                                    : 'bg-zinc-900/50 border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-900'
                                }`}
                            >
                                <div className={`w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border transition-colors ${
                                    selectedEquipment?.id === item.id ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-zinc-950 border-zinc-900'
                                }`}>
                                    {item.image ? (
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Dumbbell className={selectedEquipment?.id === item.id ? 'text-emerald-500' : 'text-zinc-700'} size={20} />
                                        </div>
                                    )}
                                </div>
                                
                                <div className="ml-4 text-left flex-1 min-w-0">
                                    <h4 className={`text-sm font-black uppercase tracking-tight leading-none truncate ${selectedEquipment?.id === item.id ? 'text-emerald-500' : 'text-white/90'}`}>
                                        {item.name}
                                    </h4>
                                    <div className="flex items-center gap-3 mt-1.5">
                                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-md border ${
                                            selectedEquipment?.id === item.id ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500/80' : 'bg-zinc-800/50 border-zinc-800 text-zinc-500'
                                        }`}>
                                            {item.slotIntervalMinutes}M
                                        </span>
                                        <span className="text-[9px] font-bold text-zinc-600 uppercase flex items-center gap-1">
                                            <div className="w-1 h-1 rounded-full bg-zinc-800" />
                                            CAP {item.capacity}
                                        </span>
                                    </div>
                                </div>

                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                                    selectedEquipment?.id === item.id ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'bg-zinc-800 text-zinc-600 group-hover:text-zinc-400'
                                }`}>
                                    <ChevronRight size={16} />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right Side: Slots & My Bookings (3 cols) */}
                <div className="lg:col-span-3 space-y-10">
                    {/* Slot Selection View */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-[3rem] p-10 min-h-[500px] flex flex-col shadow-2xl relative overflow-hidden">
                        {/* Background Decoration */}
                        <div className="absolute -top-24 -right-24 w-80 h-80 bg-emerald-500/10 blur-[120px] pointer-events-none rounded-full" />
                        
                        <div className="flex items-center justify-between mb-10 relative z-10">
                            <div>
                                <h3 className="text-2xl font-black uppercase italic tracking-tighter">
                                    {selectedEquipment ? `Times for ${selectedEquipment.name}` : 'Select Equipment First'}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none">Tomorrow's Availability Schedule</span>
                                    <div className="h-px w-8 bg-zinc-800" />
                                </div>
                            </div>
                            
                            <div className="flex flex-col items-end gap-1.5">
                                <span className="text-[10px] font-black text-emerald-500 uppercase flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                    Available
                                </span>
                                <span className="text-[10px] font-black text-zinc-600 uppercase flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-zinc-700" />
                                    Booked / Full
                                </span>
                            </div>
                        </div>

                        {!selectedEquipment ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 relative z-10 border-2 border-dashed border-zinc-800 rounded-[2.5rem]">
                                <div className="w-20 h-20 rounded-full bg-zinc-800/30 flex items-center justify-center mb-6">
                                    <Clock className="text-zinc-700" size={32} />
                                </div>
                                <h4 className="text-zinc-400 font-black uppercase italic tracking-tighter text-lg leading-tight">Ready for action?</h4>
                                <p className="text-zinc-600 font-bold text-xs uppercase mt-2 max-w-[240px]">Select any gear on the left to browse available slots for tomorrow.</p>
                            </div>
                        ) : isLoadingSlots ? (
                            <div className="flex-1 flex flex-col items-center justify-center py-20 relative z-10">
                                <div className="relative">
                                    <div className="w-12 h-12 border-t-2 border-emerald-500 animate-spin rounded-full opacity-50" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                                    </div>
                                </div>
                                <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.3em] mt-6">Refreshing Live Data...</p>
                            </div>
                        ) : slots.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center relative z-10 border-2 border-dashed border-zinc-800 rounded-[2.5rem]">
                                <div className="w-20 h-20 rounded-full bg-red-500/5 flex items-center justify-center mb-6 border border-red-500/10">
                                    <AlertCircle className="text-red-500/40" size={32} />
                                </div>
                                <h4 className="text-zinc-400 font-black uppercase italic tracking-tighter text-lg leading-tight">Gym Restricted</h4>
                                <p className="text-zinc-600 font-bold text-xs uppercase mt-2">Reservations are disabled for Sundays.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 sm:grid-cols-4 xl:grid-cols-5 gap-4 relative z-10 max-h-[500px] overflow-y-auto pr-3 custom-scrollbar">
                                {slots.map((slot, idx) => {
                                    const hasMyBookingInSlot = myBookings.some(b => 
                                        b.equipmentId === selectedEquipment.id && 
                                        b.startTime === slot.startTime && 
                                        b.date?.slice(0, 10) === tomorrowStr &&
                                        b.status === 'BOOKED'
                                    );
                                    const isAvailable = slot.isAvailable && slot.bookedCount < slot.capacity && !hasMyBookingInSlot;
                                    return (
                                        <button
                                            key={idx}
                                            disabled={!isAvailable || isBooking}
                                            onClick={() => initiateBooking(slot)}
                                            className={`group relative flex flex-col items-center justify-center p-5 rounded-3xl border transition-all duration-300 ${
                                                hasMyBookingInSlot
                                                ? 'bg-blue-500/5 border-blue-500/50 shadow-[0_10px_30px_rgba(59,130,246,0.1)] grayscale-0 opacity-100 cursor-not-allowed'
                                                : isAvailable 
                                                ? 'bg-zinc-950 border-zinc-800 hover:border-emerald-500 hover:bg-emerald-500/5 active:scale-95 shadow-xl hover:shadow-emerald-500/5' 
                                                : 'bg-zinc-900 border-zinc-800/50 cursor-not-allowed opacity-40 grayscale'
                                            }`}
                                        >
                                            <span className={`text-sm font-black transition-colors uppercase italic ${
                                                isAvailable ? 'text-white group-hover:text-emerald-500' : 'text-zinc-600'
                                            }`}>{slot.startTime}</span>
                                            
                                            <div className={`mt-3 px-2 py-0.5 rounded-md font-black text-[8px] uppercase tracking-tighter flex items-center gap-1 ${
                                                hasMyBookingInSlot ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                                                isAvailable ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-800 text-zinc-600'
                                            }`}>
                                                {hasMyBookingInSlot ? 'YOUR SLOT' : 
                                                 isAvailable ? `${slot.capacity - slot.bookedCount} FREE` : 'BOOKED'}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Confirmed Reservations */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 px-2">
                             <CheckCircle2 size={18} className="text-emerald-500" /> 
                             <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">My Tomorrow Reservations</h3>
                             <div className="h-px flex-1 bg-zinc-900" />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {myBookings.some(b => b.date?.slice(0, 10) === tomorrowStr) ? (
                                myBookings
                                    .filter(b => b.date?.slice(0, 10) === tomorrowStr && b.status === 'BOOKED')
                                    .map((booking) => {
                                        const netEquipment = equipments.find(e => e.id === booking.equipmentId);
                                        return (
                                            <div key={booking.id} className="group bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 p-6 rounded-[2.5rem] flex items-center justify-between shadow-xl transition-all hover:border-emerald-500/30">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/5 flex items-center justify-center border border-emerald-500/10 transition-colors group-hover:bg-emerald-500/10">
                                                        <Dumbbell className="text-emerald-500" size={24} />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-base font-black uppercase italic text-white leading-none tracking-tight">{netEquipment?.name || 'Equipment'}</h4>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <div className="w-1 h-1 rounded-full bg-emerald-500" />
                                                            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Confirmed & Ready</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-3">
                                                    <div className="flex flex-col items-end">
                                                        <div className="px-4 py-1.5 bg-zinc-800 border border-zinc-700/50 rounded-xl text-sm font-black text-white uppercase italic shadow-lg group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                                                            {booking.startTime}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 mt-2">
                                                            <Clock size={10} className="text-zinc-600" />
                                                            <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-tighter">{booking.endTime}</span>
                                                        </div>
                                                    </div>
                                                    
                                                    <button 
                                                        onClick={() => handleCancelBooking(booking)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/5 border border-red-500/10 text-[9px] font-black text-red-500/60 uppercase tracking-widest hover:bg-red-500/10 hover:text-red-500 transition-all"
                                                    >
                                                        <AlertCircle size={10} />
                                                        CANCEL
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                            ) : (
                                <div className="md:col-span-2 p-12 bg-zinc-900/40 border-2 border-dashed border-zinc-800 rounded-[3rem] flex flex-col items-center justify-center group hover:border-zinc-700 transition-colors">
                                    <div className="w-16 h-16 rounded-3xl bg-zinc-900 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                                        <LayoutDashboard className="text-zinc-700" size={24} />
                                    </div>
                                    <p className="text-zinc-600 font-black text-[10px] uppercase tracking-[0.2em]">No slots reserved for tomorrow</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Today's Reservations */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 px-2">
                             <Calendar size={18} className="text-blue-500" /> 
                             <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">My Today's Reservations</h3>
                             <div className="h-px flex-1 bg-zinc-900" />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {myBookings.some(b => b.date?.slice(0, 10) === todayStr) ? (
                                myBookings
                                    .filter(b => b.date?.slice(0, 10) === todayStr && b.status === 'BOOKED')
                                    .map((booking) => {
                                        const netEquipment = equipments.find(e => e.id === booking.equipmentId);
                                        return (
                                            <div key={booking.id} className="group bg-gradient-to-br from-zinc-900/50 to-zinc-950/50 border border-zinc-900 p-6 rounded-[2.5rem] flex items-center justify-between shadow-xl transition-all hover:border-blue-500/30">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-14 h-14 rounded-2xl bg-blue-500/5 flex items-center justify-center border border-blue-500/10">
                                                        <Dumbbell className="text-blue-500" size={24} />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-base font-black uppercase italic text-white leading-none tracking-tight">{netEquipment?.name || 'Equipment'}</h4>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <div className="w-1 h-1 rounded-full bg-blue-500" />
                                                            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Active Today</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-3">
                                                    <div className="flex flex-col items-end">
                                                        <div className="px-4 py-1.5 bg-zinc-800 border border-zinc-700/50 rounded-xl text-sm font-black text-white uppercase italic shadow-lg">
                                                            {booking.startTime}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 mt-2">
                                                            <Clock size={10} className="text-zinc-600" />
                                                            <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-tighter">{booking.endTime}</span>
                                                        </div>
                                                    </div>
                                                    
                                                    <button 
                                                        onClick={() => handleCancelBooking(booking)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/5 border border-red-500/10 text-[9px] font-black text-red-500/60 uppercase tracking-widest hover:bg-red-500/10 hover:text-red-500 transition-all"
                                                    >
                                                        <AlertCircle size={10} />
                                                        CANCEL
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                            ) : (
                                <div className="md:col-span-2 p-12 bg-zinc-900/40 border border-zinc-900 rounded-[3rem] flex flex-col items-center justify-center">
                                    <p className="text-zinc-700 font-bold text-[10px] uppercase tracking-[0.2em]">No active sessions today</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            {isModalOpen && selectedEquipment && pendingSlot && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)} />
                    
                    <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-300">
                        {/* Modal Header Decoration */}
                        <div className="h-2 w-full bg-emerald-500" />
                        
                        <div className="p-10 pt-12 text-center space-y-8">
                            <div className="flex flex-col items-center">
                                <div className="w-20 h-20 rounded-[2rem] bg-emerald-500/10 flex items-center justify-center mb-6">
                                    <Dumbbell className="text-emerald-500" size={32} />
                                </div>
                                <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">Confirm Booking?</h2>
                                <p className="text-zinc-500 font-black text-[10px] uppercase tracking-[0.3em] mt-2 italic">Precision Gear Reservation</p>
                            </div>

                            <div className="bg-zinc-950/50 rounded-3xl p-8 space-y-4 border border-zinc-800/50">
                                <div className="flex justify-between items-center text-left">
                                    <div>
                                        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest leading-none mb-1">Equipment</p>
                                        <h4 className="text-xl font-black uppercase text-white truncate max-w-[200px]">{selectedEquipment.name}</h4>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest leading-none mb-1">Time Slot</p>
                                        <h4 className="text-xl font-black uppercase text-emerald-500 tracking-tighter">{pendingSlot.startTime}</h4>
                                    </div>
                                </div>
                                
                                <div className="h-px bg-zinc-800 w-full" />
                                
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <Calendar size={14} className="text-zinc-600" />
                                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{format(tomorrow, 'EEEE')}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{format(tomorrow, 'dd MMM yyyy')}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="py-5 px-8 rounded-2xl bg-zinc-800 border border-zinc-700 text-zinc-400 font-black text-xs uppercase tracking-widest hover:bg-zinc-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmBooking}
                                    disabled={isBooking}
                                    className="py-5 px-8 rounded-2xl bg-emerald-500 text-black font-black text-xs uppercase tracking-widest shadow-[0_10px_30px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    {isBooking ? 'Finalizing...' : 'Confirm Now'}
                                </button>
                            </div>
                            
                            <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.2em]">Please arrive 5 minutes before your session begins.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel Confirmation Modal */}
            {isCancelModalOpen && bookingToCancel && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsCancelModalOpen(false)} />
                    
                    <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-300">
                        <div className="h-2 w-full bg-red-500" />
                        
                        <div className="p-10 pt-12 text-center space-y-8">
                            <div className="flex flex-col items-center">
                                <div className="w-20 h-20 rounded-[2rem] bg-red-500/10 flex items-center justify-center mb-6 border border-red-500/20">
                                    <AlertCircle className="text-red-500" size={32} />
                                </div>
                                <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">Cancel Booking?</h2>
                                <p className="text-zinc-500 font-black text-[10px] uppercase tracking-[0.3em] mt-2 italic">This action will release your slot</p>
                            </div>

                            <div className="bg-zinc-950/50 rounded-3xl p-8 space-y-4 border border-zinc-800/50">
                                <div className="flex justify-between items-center text-left">
                                    <div>
                                        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest leading-none mb-1">Equipment</p>
                                        <h4 className="text-xl font-black uppercase text-white truncate max-w-[200px]">
                                            {equipments.find(e => e.id === bookingToCancel.equipmentId)?.name || 'Equipment'}
                                        </h4>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest leading-none mb-1">Time Slot</p>
                                        <h4 className="text-xl font-black uppercase text-red-500 tracking-tighter">{bookingToCancel.startTime}</h4>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setIsCancelModalOpen(false)}
                                    className="py-5 px-8 rounded-2xl bg-zinc-800 border border-zinc-700 text-zinc-400 font-black text-xs uppercase tracking-widest hover:bg-zinc-700 transition-colors"
                                >
                                    Go Back
                                </button>
                                <button
                                    onClick={confirmCancellation}
                                    disabled={isCancelling}
                                    className="py-5 px-8 rounded-2xl bg-red-500 text-white font-black text-xs uppercase tracking-widest shadow-[0_10px_30px_rgba(239,68,68,0.3)] hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    {isCancelling ? 'Cancelling...' : 'Confirm Cancel'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #27272a;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #3f3f46;
                }
            ` }} />
        </div>
    );
};

export default EquipmentBookingPage;
