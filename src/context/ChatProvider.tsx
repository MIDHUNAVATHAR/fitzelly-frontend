import React, { useState, useEffect, useRef, useCallback } from 'react';
import { socket } from '../config/socket';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';
import { deleteChatMessage, getConversations } from '../api/chat.api';
import { ChatContext, type Message, type Conversation, type CallData } from './ChatContext';

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [typingStatus, setTypingStatus] = useState<Record<string, boolean>>({});
    
    // WebRTC states
    const [isCalling, setIsCalling] = useState(false);
    const [isIncomingCall, setIsIncomingCall] = useState(false);
    const [isCallAccepted, setIsCallAccepted] = useState(false);
    const [callData, setCallData] = useState<CallData | null>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [isAudioMuted, setIsAudioMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);

    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const iceCandidateQueue = useRef<RTCIceCandidateInit[]>([]);

    const cleanupCall = useCallback(() => {
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
        setIsCallAccepted(false);
        setCallData(null);
        iceCandidateQueue.current = [];
    }, []);

    const processIceQueue = useCallback(async () => {
        if (!peerConnection.current) return;
        console.log("Processing queued candidates:", iceCandidateQueue.current.length);
        while (iceCandidateQueue.current.length > 0) {
            const candidate = iceCandidateQueue.current.shift();
            if (!candidate) continue;
            try {
                await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (e) {
                console.error("Error adding queued candidate", e);
            }
        }
    }, []);

    const setupPeerConnection = useCallback((stream: MediaStream, toId: string) => {
        const pc = new RTCPeerConnection({
            iceServers: [
                { urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'] }
            ]
        });
        
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
    }, []);

    useEffect(() => {
        if (!user) {
            if (socket.connected) socket.disconnect();
            return;
        }

        const handleConnect = () => {
             const userId = user.id;
             if (userId) {
                 console.log("Socket connected! Joining room: user_" + userId);
                 socket.emit('join', `user_${userId}`);
             }
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
                // Check if message is already in state (to prevent duplicates from sender side manually adding + socket)
                const isDuplicate = prev.some(m => (m.id && m.id === message.id) || (m._id && m._id === message._id));
                if (isDuplicate) return prev;

                // Add message to state. The ChatPage filters these by selectedConv.id anyway.
                // This ensures that if we switch to this conversation later, we have the message.
                // It also prevents losing messages that arrive during the transition between conversations.
                return [...prev, message];
            });

            // Update conversations list: move to top and update last message
            setConversations(prev => {
                const existingIndex = prev.findIndex(c => c.id === message.conversationId);
                
                if (existingIndex !== -1) {
                    const existing = prev[existingIndex];
                    const updated = {
                        ...existing,
                        lastMessage: message.content,
                        updatedAt: message.createdAt || new Date().toISOString()
                    };
                    const rest = prev.filter((_, i) => i !== existingIndex);
                    return [updated, ...rest];
                } else {
                    // If it's a new conversation not in our current list, we should probably fetch it
                    // For now, we'll just let it stay as is, but a refresh of conversations might be better.
                    // This case happens when receiving a first message from someone new.
                    console.log("Received message for a conversation not in list:", message.conversationId);
                    // To handle this properly, maybe we should trigger a full refresh of conversations
                    getConversations().then(data => setConversations(data)).catch(console.error);
                    return prev;
                }
            });

            // Automatically emit delivered receipt if socket is active
            if (message.senderId && (message.id || message._id)) {
                socket.emit("MESSAGE_DELIVERED", { 
                    senderId: message.senderId, 
                    messageId: message.id || message._id 
                });
            }
        });

        socket.on('TYPING_START', (data: { conversationId: string }) => {
            setTypingStatus(prev => ({ ...prev, [data.conversationId]: true }));
        });

        socket.on('TYPING_STOP', (data: { conversationId: string }) => {
            setTypingStatus(prev => ({ ...prev, [data.conversationId]: false }));
        });

        socket.on('INCOMING_CALL', (data: CallData) => {
            console.log("Incoming call from:", data.from);
            setCallData(data);
            setIsIncomingCall(true);
        });

        socket.on('CALL_ACCEPTED', async (data: { answer: RTCSessionDescriptionInit }) => {
            console.log("Call accepted, setting remote description");
            setIsCallAccepted(true);
            if (peerConnection.current) {
                await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.answer));
                await processIceQueue();
            }
        });

        socket.on('RECEIVE_ICE_CANDIDATE', async (data: { candidate: RTCIceCandidateInit }) => {
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

        socket.on('MESSAGE_DELETED', (data: { messageId: string }) => {
            setMessages(prev => prev.filter(m => m.id !== data.messageId && m._id !== data.messageId));
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
            socket.off('MESSAGE_DELETED');
        };
    }, [user, cleanupCall, processIceQueue]);



    const initiateCall = async (toPlayerId: string, name: string, type: 'video' | 'audio') => {
        if (!user?.id) {
            toast.error("You must be logged in to make a call");
            return;
        }

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
            setCallData({ to: toPlayerId, from: user.id, name, callType: type });

            const pc = setupPeerConnection(stream, toPlayerId);
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            socket.emit('CALL_USER', {
                to: toPlayerId,
                from: user.id,
                callerName: user.role === 'gym' ? 'Gym Admin' : (user as { fullName?: string }).fullName || 'User',
                offer: offer,
                callType: type
            });
        } catch (err) {
            console.error("Failed to get media", err);
            const errorMsg = (err as Error).name === 'NotAllowedError' ? "Permission denied" : "Camera/Mic not found";
            toast.error(errorMsg);
        }
    };

    const answerCall = async () => {
        if (!callData) return;

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
            setIsCallAccepted(true);

            const pc = setupPeerConnection(stream, callData.from);
            
            if (!callData.offer) {
                throw new Error("Missing call offer description from caller");
            }
            
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
            const reason = (err as Error).name === 'NotAllowedError' ? "Permission Denied" : "Hardware Error";
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

    const sendMessage = useCallback((data: Partial<Message>) => {
        const now = new Date().toISOString();
        const fullMessage = { ...data, createdAt: now };
        socket.emit('SEND_MESSAGE', fullMessage);
        
        setMessages(prev => [...prev, fullMessage as Message]);

        // Update conversations list for the sender too
        setConversations(prev => {
            const existing = prev.find(c => c.id === data.conversationId);
            if (existing) {
                const updated = {
                    ...existing,
                    lastMessage: data.content || '',
                    updatedAt: now
                };
                return [updated, ...prev.filter(c => c.id !== data.conversationId)];
            }
            return prev;
        });
    }, [setMessages, setConversations]);

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

    const handleDeleteMessage = async (messageId: string) => {
        try {
            await deleteChatMessage(messageId);
            setMessages(prev => prev.filter(m => m.id !== messageId && m._id !== messageId));
        } catch (err) {
            console.error("Delete failed", err);
            toast.error("Failed to delete message");
        }
    };

    return (
        <ChatContext.Provider value={{
            messages, setMessages, 
            conversations, setConversations,
            sendMessage,
            typingStatus, sendTypingStatus,
            isCalling, isIncomingCall, isCallAccepted, localStream, remoteStream, callData,
            initiateCall, answerCall, endCall,
            toggleAudio, toggleVideo, isAudioMuted, isVideoOff,
            deleteMessage: handleDeleteMessage
        }}>
            {children}
        </ChatContext.Provider>
    );
};
