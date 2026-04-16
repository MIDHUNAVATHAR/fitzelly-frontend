import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/useAuth';
import { getConversationWithUser, saveCallHistory } from '../../api/chat.api';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CallData {
    from: string;
    to: string;
    callerName?: string;
    name?: string;
    callType: 'video' | 'audio';
    offer?: RTCSessionDescriptionInit;
}

const CallOverlay: React.FC = () => {
    const { 
        isCalling, isIncomingCall, isCallAccepted, localStream, remoteStream, callData,
        answerCall, endCall, toggleAudio, toggleVideo, 
        isAudioMuted, isVideoOff 
    } = useChat();
    const { user } = useAuth();

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const [callDuration, setCallDuration] = useState(0);
    const [startTime, setStartTime] = useState<Date | null>(null);

    // Track when call actually starts for duration calculation
    useEffect(() => {
        if (isCallAccepted && !startTime) {
            // Using a timeout to avoid synchronous setState during effect synchronization
            const timer = setTimeout(() => {
                setStartTime(new Date());
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [isCallAccepted, startTime]);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (isCalling && isCallAccepted) {
            interval = setInterval(() => {
                setCallDuration(prev => prev + 1);
            }, 1000);
        } else {
            // Use deferred update to avoid cascading render issues
            const timer = setTimeout(() => {
                setCallDuration(0);
            }, 0);
            return () => {
                clearTimeout(timer);
                if (interval) clearInterval(interval);
            };
        }
        return () => clearInterval(interval);
    }, [isCalling, isCallAccepted]);

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const persistCallHistory = useCallback(async (status: 'completed' | 'missed' | 'rejected', duration: number, finalCallData: CallData) => {
        if (!user || user.id !== finalCallData?.from) return; // Only caller saves history log
        
        try {
            const targetId = finalCallData.to;
            const conv = await getConversationWithUser(targetId);
            const endTime = new Date();
            const actualStartTime = startTime || endTime;

            await saveCallHistory({
                callerId: user.id,
                receiverId: targetId,
                conversationId: conv.id,
                type: finalCallData.callType,
                status,
                duration,
                startTime: actualStartTime,
                endTime: endTime
            });
        } catch (err) {
            console.error("Failed to persist call history:", err);
        }
    }, [user, startTime]);

    const prevCallState = useRef({ isCalling, isIncomingCall, isCallAccepted, callDuration, callData });
    useEffect(() => {
        const wasInCall = prevCallState.current.isCalling || prevCallState.current.isIncomingCall;
        const nowNotInCall = !isCalling && !isIncomingCall;

        if (wasInCall && nowNotInCall && prevCallState.current.callData) {
            const fData = prevCallState.current.callData;
            const fAccepted = prevCallState.current.isCallAccepted;
            const fDuration = prevCallState.current.callDuration;
            
            const status = fAccepted ? 'completed' : 'missed';
            persistCallHistory(status, fDuration, fData);
            
            // Defers state update to avoid direct setState within effect warning
            const timer = setTimeout(() => {
                setStartTime(null);
            }, 0);
            return () => clearTimeout(timer);
        }
        
        prevCallState.current = { isCalling, isIncomingCall, isCallAccepted, callDuration, callData };
    }, [isCalling, isIncomingCall, isCallAccepted, callDuration, callData, persistCallHistory]);

    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    if (!isCalling && !isIncomingCall) return null;

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 lg:p-10"
            >
                {/* Incoming Call UI */}
                {isIncomingCall && (
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm w-full"
                    >
                        <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6 animate-pulse">
                            <User className="w-12 h-12 text-emerald-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">{callData?.callerName || "Someone"}</h2>
                        <p className="text-zinc-500 mb-8">Incoming {callData?.callType} call...</p>
                        
                        <div className="flex gap-6">
                            <button 
                                onClick={endCall}
                                className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-400 flex items-center justify-center text-white shadow-lg transition-transform hover:scale-110"
                            >
                                <PhoneOff className="w-8 h-8" />
                            </button>
                            <button 
                                onClick={answerCall}
                                className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-400 flex items-center justify-center text-black shadow-lg transition-transform hover:scale-110"
                            >
                                <Phone className="w-8 h-8" />
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Active Call UI */}
                {isCalling && (
                    <div className="relative w-full h-full max-w-6xl max-h-[85vh] bg-zinc-950 rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl flex flex-col">
                        {/* Remote Stream (Main) */}
                        <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
                            {/* Always render the video element to play audio, but hide it for audio-only calls */}
                            <video 
                                ref={remoteVideoRef} 
                                autoPlay 
                                playsInline 
                                className={`w-full h-full object-cover ${callData?.callType === 'video' ? 'block' : 'hidden'}`}
                            />

                            {/* Participant Profile Placeholder - Shown for audio calls or when waiting for video */}
                            {(callData?.callType === 'audio' || (callData?.callType === 'video' && !remoteStream)) && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/60 backdrop-blur-sm">
                                    <div className="w-32 h-32 lg:w-48 lg:h-48 rounded-full bg-zinc-800 flex items-center justify-center mb-6 border-4 border-zinc-700 shadow-2xl">
                                        <User className="w-16 h-16 lg:w-24 lg:h-24 text-zinc-600" />
                                    </div>
                                    <h3 className="text-zinc-200 text-xl lg:text-3xl font-bold">
                                        {callData?.name || callData?.callerName || "Participant"}
                                    </h3>
                                    <p className="text-zinc-500 text-sm lg:text-base mt-2 flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${isCallAccepted ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-pulse'}`} />
                                        {isCallAccepted ? (
                                            callData?.callType === 'audio' ? "Audio Call in progress" : "Connecting video..."
                                        ) : (
                                            "Ringing..."
                                        )}
                                    </p>
                                </div>
                            )}

                            {/* Local Video (PiP) */}
                            {callData?.callType === 'video' && (
                                <div className="absolute top-6 right-6 w-32 md:w-48 lg:w-64 aspect-video bg-zinc-900 rounded-2xl overflow-hidden border-2 border-zinc-800 shadow-2xl z-10">
                                    <div className="relative w-full h-full">

                                        <video 
                                            ref={localVideoRef} 
                                            autoPlay 
                                            muted 
                                            playsInline 
                                            className={`w-full h-full object-cover scale-x-[-1] ${isVideoOff ? 'hidden' : 'block'}`}
                                        />

                                        {isVideoOff && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
                                                <VideoOff className="w-8 h-8 text-zinc-700" />
                                            </div>
                                        )}

                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Controls Toolbar */}
                        <div className="h-24 lg:h-32 bg-zinc-900 border-t border-zinc-800 flex items-center justify-center gap-4 md:gap-6 px-4 flex-shrink-0">
                            <button 
                                onClick={toggleAudio}
                                className={`w-12 h-12 lg:w-16 lg:h-16 rounded-full flex items-center justify-center transition-all ${isAudioMuted ? 'bg-red-500/20 text-red-500' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'}`}
                                title={isAudioMuted ? "Unmute" : "Mute"}
                            >
                                {isAudioMuted ? <MicOff className="w-5 h-5 lg:w-7 lg:h-7" /> : <Mic className="w-5 h-5 lg:w-7 lg:h-7" />}
                            </button>
                            
                            {callData?.callType === 'video' && (
                                <button 
                                    onClick={toggleVideo}
                                    className={`w-12 h-12 lg:w-16 lg:h-16 rounded-full flex items-center justify-center transition-all ${isVideoOff ? 'bg-red-500/20 text-red-500' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'}`}
                                    title={isVideoOff ? "Start Video" : "Stop Video"}
                                >
                                    {isVideoOff ? <VideoOff className="w-5 h-5 lg:w-7 lg:h-7" /> : <Video className="w-5 h-5 lg:w-7 lg:h-7" />}
                                </button>
                            )}

                            <button 
                                onClick={endCall}
                                className="h-12 lg:h-16 px-6 lg:px-8 rounded-full lg:rounded-2xl bg-red-500 hover:bg-red-600 flex items-center justify-center gap-3 text-white shadow-lg transition-all active:scale-95"
                                title="End Call"
                            >
                                <PhoneOff className="w-6 h-6 lg:w-8 lg:h-8" />
                                <span className="hidden sm:inline font-bold text-sm lg:text-base">End Call</span>
                            </button>
                        </div>

                        {/* Header Info */}
                        <div className="absolute top-6 left-6 flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 z-20">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-[10px] lg:text-xs font-semibold text-white tracking-widest uppercase">
                                {callData?.callType} CALL
                                {isCallAccepted && ` • ${formatDuration(callDuration)}`}
                            </span>
                        </div>
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
    );
};

export default CallOverlay;
