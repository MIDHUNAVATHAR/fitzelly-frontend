import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { socket } from '../config/socket';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

interface Message {
    id?: string;
    _id?: string;
    conversationId: string;
    senderId: string;
    receiverId: string;
    content: string;
    type: 'text' | 'image' | 'call';
    createdAt: string;
}

interface ChatContextType {
    messages: Message[];
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
    sendMessage: (data: any) => void;
    
    // Typing indicators
    typingStatus: Record<string, boolean>;
    sendTypingStatus: (conversationId: string, receiverId: string, isTyping: boolean) => void;

    // Call states
    isCalling: boolean;
    isIncomingCall: boolean;
    remoteStream: MediaStream | null;
    localStream: MediaStream | null;
    callData: any;
    initiateCall: (toPlayerId: string, name: string, type: 'video' | 'audio') => void;
    answerCall: () => void;
    endCall: () => void;
    toggleAudio: () => void;
    toggleVideo: () => void;
    isAudioMuted: boolean;
    isVideoOff: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [typingStatus, setTypingStatus] = useState<Record<string, boolean>>({});
    
    // WebRTC states
    const [isCalling, setIsCalling] = useState(false);
    const [isIncomingCall, setIsIncomingCall] = useState(false);
    const [callData, setCallData] = useState<any>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [isAudioMuted, setIsAudioMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);

    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const iceCandidateQueue = useRef<RTCIceCandidateInit[]>([]);

    const servers = {
        iceServers: [
            { urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'] }
        ]
    };

    useEffect(() => {
        if (!user) {
            if (socket.connected) socket.disconnect();
            return;
        }

        const handleConnect = () => {
             console.log("Socket connected/reconnected! Joining room: user_" + user.id);
             socket.emit('join', `user_${user.id}`);
        };

        // If socket is already connected, join immediately
        if (socket.connected) {
             handleConnect();
        } else {
             socket.connect();
        }

        socket.on('connect', handleConnect);

        socket.on('RECEIVE_MESSAGE', (message: Message) => {
            console.log("FRONTEND RECEIVED MESSAGE:", message);
            setMessages(prev => {
                if (prev.some(m => (message.id && m.id === message.id) || (message._id && m._id === message._id))) return prev;
                return [...prev, message];
            });
            // Automatically emit delivered receipt if socket is active
            if (message.senderId && message.id) {
                socket.emit("MESSAGE_DELIVERED", { senderId: message.senderId, messageId: message.id });
            }
        });

        socket.on('TYPING_START', (data: { conversationId: string }) => {
            setTypingStatus(prev => ({ ...prev, [data.conversationId]: true }));
        });

        socket.on('TYPING_STOP', (data: { conversationId: string }) => {
            setTypingStatus(prev => ({ ...prev, [data.conversationId]: false }));
        });

        socket.on('INCOMING_CALL', (data: any) => {
            console.log("Incoming call from:", data.from);
            setCallData(data);
            setIsIncomingCall(true);
        });

        socket.on('CALL_ACCEPTED', async (data: any) => {
            console.log("Call accepted, setting remote description");
            if (peerConnection.current) {
                await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.answer));
                await processIceQueue();
            }
        });

        socket.on('RECEIVE_ICE_CANDIDATE', async (data: any) => {
            if (peerConnection.current && peerConnection.current.remoteDescription) {
                try {
                    await peerConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate));
                } catch (e) {
                    console.error("Error adding ice candidate", e);
                }
            } else {
                console.log("Queuing ICE candidate...");
                iceCandidateQueue.current.push(data.candidate);
            }
        });

        socket.on('CALL_ENDED', () => {
             cleanupCall();
             toast.error("Call ended");
        });

        socket.on('CALL_FAILED', (data: { reason: string }) => {
            console.log("Call failed reason:", data.reason);
            cleanupCall();
            toast.error(`Call Failed: ${data.reason}`);
        });

        return () => {
            socket.off('connect', handleConnect);
            socket.off('RECEIVE_MESSAGE');
            socket.off('TYPING_START');
            socket.off('TYPING_STOP');
            socket.off('INCOMING_CALL');
            socket.off('CALL_ACCEPTED');
            socket.off('RECEIVE_ICE_CANDIDATE');
            socket.off('CALL_ENDED');
            socket.off('CALL_FAILED');
        };
    }, [user]);

    const cleanupCall = () => {
        if (peerConnection.current) {
            peerConnection.current.close();
            peerConnection.current = null;
        }
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
        }
        setLocalStream(null);
        setRemoteStream(null);
        setIsCalling(false);
        setIsIncomingCall(false);
        setCallData(null);
        iceCandidateQueue.current = [];
    };

    const processIceQueue = async () => {
        if (!peerConnection.current) return;
        console.log("Processing queued candidates:", iceCandidateQueue.current.length);
        while (iceCandidateQueue.current.length > 0) {
            const candidate = iceCandidateQueue.current.shift();
            try {
                await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (e) {
                console.error("Error adding queued candidate", e);
            }
        }
    };

    const setupPeerConnection = (stream: MediaStream, toId: string) => {
        const pc = new RTCPeerConnection(servers);
        
        stream.getTracks().forEach(track => {
            pc.addTrack(track, stream);
        });

        pc.ontrack = (event) => {
            console.log("Got remote track");
            setRemoteStream(event.streams[0]);
        };

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('ICE_CANDIDATE', { to: toId, candidate: event.candidate });
            }
        };

        peerConnection.current = pc;
        return pc;
    };

    const initiateCall = async (toPlayerId: string, name: string, type: 'video' | 'audio') => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            toast.error("Calling is not supported in this browser (requires HTTPS/Localhost)");
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: type === 'video', 
                audio: true 
            });
            
            setLocalStream(stream);
            localStreamRef.current = stream;
            setIsCalling(true);
            setCallData({ to: toPlayerId, name, type });

            const pc = setupPeerConnection(stream, toPlayerId);
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            socket.emit('CALL_USER', {
                to: toPlayerId,
                from: user?.id,
                callerName: user?.role === 'gym' ? 'Gym Admin' : (user as any)?.fullName || 'User',
                offer: offer,
                callType: type
            });
        } catch (err) {
            console.error("Failed to get media", err);
            const errorMsg = (err as any).name === 'NotAllowedError' ? "Permission denied" : "Camera/Mic not found";
            toast.error(errorMsg);
        }
    };

    const answerCall = async () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            socket.emit('CALL_FAILED', { to: callData.from, reason: "Insecure Context / No Support" });
            cleanupCall();
            toast.error("Permission Denied: Browser doesn't allow media on insecure backgrounds.");
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: callData.callType === 'video', 
                audio: true 
            });
            
            setLocalStream(stream);
            localStreamRef.current = stream;
            setIsIncomingCall(false);
            setIsCalling(true);

            const pc = setupPeerConnection(stream, callData.from);
            await pc.setRemoteDescription(new RTCSessionDescription(callData.offer));
            
            // Now that remote description is set, process any early ICE candidates
            await processIceQueue();

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            socket.emit('ANSWER_CALL', {
                to: callData.from,
                answer: answer
            });
        } catch (err) {
            console.error("Failed to answer call", err);
            const reason = (err as any).name === 'NotAllowedError' ? "Permission Denied" : "Hardware Error";
            socket.emit('CALL_FAILED', { to: callData?.from, reason });
            cleanupCall();
            toast.error(`Could not connect: ${reason}`);
        }
    };

    const endCall = () => {
        const targetId = callData?.to || callData?.from;
        if (targetId) {
            socket.emit('END_CALL', { to: targetId });
        }
        cleanupCall();
    };

    const sendMessage = (data: any) => {
        socket.emit('SEND_MESSAGE', data);
        setMessages(prev => [...prev, { ...data, createdAt: new Date().toISOString() }]);
    };

    const sendTypingStatus = (conversationId: string, receiverId: string, isTyping: boolean) => {
        if (isTyping) {
            socket.emit('TYPING_START', { receiverId, conversationId });
        } else {
            socket.emit('TYPING_STOP', { receiverId, conversationId });
        }
    };

    const toggleAudio = () => {
        if (localStreamRef.current) {
            const audioTrack = localStreamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsAudioMuted(!audioTrack.enabled);
            }
        }
    };

    const toggleVideo = () => {
        if (localStreamRef.current) {
            const videoTrack = localStreamRef.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoOff(!videoTrack.enabled);
            }
        }
    };

    return (
        <ChatContext.Provider value={{
            messages, setMessages, sendMessage,
            typingStatus, sendTypingStatus,
            isCalling, isIncomingCall, localStream, remoteStream, callData,
            initiateCall, answerCall, endCall,
            toggleAudio, toggleVideo, isAudioMuted, isVideoOff
        }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) throw new Error('useChat must be used within ChatProvider');
    return context;
};
