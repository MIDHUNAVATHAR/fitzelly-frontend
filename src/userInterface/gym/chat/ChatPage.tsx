import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../../../context/ChatProvider';
import { useAuth } from '../../../context/useAuth';
import { getConversations, getMessages, sendMessage, markAsRead, getConversationWithUser } from '../../../api/chat.api';
import { Send, Phone, Video, MoreVertical, Search, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useLocation } from 'react-router-dom';

const ChatPage: React.FC = () => {
    const { user } = useAuth();
    const location = useLocation();
    const { messages, setMessages, sendMessage: sendSocketMessage, initiateCall, typingStatus, sendTypingStatus } = useChat();
    const [conversations, setConversations] = useState<any[]>([]);
    const [selectedConv, setSelectedConv] = useState<any>(null);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const initializeChat = async () => {
            console.log("initializeChat started. state:", location.state);
            setIsLoading(true);
            try {
                const data = await getConversations();
                console.log("Fetched conversations:", data);
                setConversations(data);

                if (location.state?.selectUserId) {
                    const existing = data.find((c: any) => c.otherUser?.id === location.state.selectUserId);
                    console.log("Existing conversation found:", existing);
                    if (existing) {
                        setSelectedConv(existing);
                    } else {
                        try {
                            console.log("Fetching new conversation for:", location.state.selectUserId);
                            const newConv = await getConversationWithUser(location.state.selectUserId);
                            console.log("New conversation received:", newConv);
                            if (newConv) {
                                setSelectedConv(newConv);
                                setConversations(prev => {
                                    const exists = prev.find(c => c.id === newConv.id);
                                    return exists ? prev : [newConv, ...prev];
                                });
                            }
                        } catch (err) {
                            console.error("Failed to auto-select client:", err);
                        }
                    }
                }
            } catch (e) {
                console.error("Failed to load conversations:", e);
            } finally {
                setIsLoading(false);
            }
        };

        initializeChat();
    }, [location.state?.selectUserId]);

    useEffect(() => {
        if (selectedConv) {
            fetchMessages(selectedConv.id);
            markAsRead(selectedConv.id);
        }
    }, [selectedConv]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);


    const fetchMessages = async (convId: string) => {
        try {
            const data = await getMessages(convId);
            setMessages(data);
        } catch (e) {
            console.error(e);
        }
    };

    let typingTimeout: ReturnType<typeof setTimeout>;
    const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
        if (selectedConv) {
            sendTypingStatus(selectedConv.id, selectedConv.otherUser.id, true);
            clearTimeout(typingTimeout);
            typingTimeout = setTimeout(() => {
                sendTypingStatus(selectedConv.id, selectedConv.otherUser.id, false);
            }, 2000);
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || !selectedConv) return;
        
        // Stop typing immediately upon send
        sendTypingStatus(selectedConv.id, selectedConv.otherUser.id, false);

        const messageData = {
            conversationId: selectedConv.id,
            receiverId: selectedConv.otherUser.id,
            content: inputValue,
            type: 'text'
        };

        try {
            const savedMessage = await sendMessage(messageData);
            sendSocketMessage(savedMessage);
            setInputValue('');
        } catch (e) {
            console.error(e);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    if (isLoading) {
        return <div className="h-full flex items-center justify-center text-zinc-500">Loading chats...</div>;
    }

    return (
        <div className="h-[calc(100vh-180px)] flex bg-zinc-900/50 rounded-2xl border border-zinc-800 overflow-hidden backdrop-blur-sm shadow-2xl">
            {/* Sidebar */}
            <div className="w-80 border-r border-zinc-800 flex flex-col bg-zinc-900/30">
                <div className="p-4 border-b border-zinc-800">
                    <h2 className="text-xl font-bold text-white mb-4">Messages</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                            type="text"
                            placeholder="Search clients..."
                            className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {conversations.length === 0 ? (
                        <div className="p-8 text-center text-zinc-500 text-sm">
                            No conversations yet. Open chat from Clients list.
                        </div>
                    ) : (
                        conversations.map(conv => (
                            <button
                                key={conv.id}
                                onClick={() => setSelectedConv(conv)}
                                className={`w-full p-4 flex gap-3 hover:bg-zinc-800/50 transition-colors border-b border-zinc-800/50 text-left ${selectedConv?.id === conv.id ? 'bg-zinc-800/80' : ''}`}
                            >
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-full bg-zinc-800 flex-shrink-0 overflow-hidden border border-zinc-700">
                                        {conv.otherUser.avatar ? (
                                            <img src={conv.otherUser.avatar} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-emerald-400 font-bold bg-emerald-500/5">
                                                {conv.otherUser.name[0]}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-semibold text-white truncate">{conv.otherUser.name}</h3>
                                        <span className="text-[10px] text-zinc-500">
                                            {format(new Date(conv.updatedAt), 'HH:mm')}
                                        </span>
                                    </div>
                                    <p className="text-xs text-zinc-400 truncate">{conv.lastMessage || 'Start a conversation'}</p>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            {selectedConv ? (
                <div className="flex-1 flex flex-col bg-black/20">
                    {/* Header */}
                    <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/40">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-emerald-400 font-bold">
                                {selectedConv.otherUser.avatar ? (
                                    <img src={selectedConv.otherUser.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    selectedConv.otherUser.name[0]
                                )}
                            </div>
                            <div>
                                <h3 className="font-semibold text-white leading-tight">{selectedConv.otherUser.name}</h3>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">
                                        {typingStatus[selectedConv.id] ? "Typing..." : "Active Now"}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button 
                             onClick={() => initiateCall(selectedConv.otherUser.id, selectedConv.otherUser.name, 'audio')}
                             className="p-2.5 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors border border-transparent hover:border-zinc-700">
                                <Phone className="w-5 h-5" />
                            </button>
                            <button 
                             onClick={() => initiateCall(selectedConv.otherUser.id, selectedConv.otherUser.name, 'video')}
                             className="p-2.5 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors border border-transparent hover:border-zinc-700">
                                <Video className="w-5 h-5" />
                            </button>
                            <button className="p-2.5 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
                                <MoreVertical className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-zinc-950/20">
                        {messages.filter(m => m.conversationId === selectedConv?.id).map((msg, idx) => {
                            const isMine = msg.senderId === user?.id;
                            return (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    key={idx}
                                    className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-[13px] shadow-sm ${
                                        isMine 
                                            ? 'bg-emerald-500 text-black font-medium rounded-tr-none' 
                                            : 'bg-zinc-800 text-white rounded-tl-none border border-zinc-700/50'
                                    }`}>
                                        <p className="leading-relaxed">{msg.content}</p>
                                        <p className={`text-[9px] mt-1.5 text-right font-medium ${isMine ? 'text-black/50' : 'text-zinc-500'}`}>
                                            {format(new Date(msg.createdAt), 'HH:mm')}
                                        </p>
                                    </div>
                                </motion.div>
                            );
                        })}
                        {typingStatus[selectedConv?.id] && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                                <div className="px-4 py-3 rounded-2xl bg-zinc-800 border border-zinc-700/50 flex space-x-1">
                                    <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"></div>
                                    <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                </div>
                            </motion.div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSend} className="p-4 bg-zinc-900 border-t border-zinc-800">
                        <div className="flex items-center gap-3">
                            <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={inputValue}
                                        onChange={handleTyping}
                                        placeholder="Type your message..."
                                    className="w-full bg-zinc-800/80 border border-zinc-700/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-zinc-600"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={!inputValue.trim()}
                                className="p-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 disabled:hover:bg-emerald-500 text-black rounded-xl transition-all shadow-lg hover:shadow-emerald-500/10"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 p-8 text-center bg-zinc-950/20">
                    <div className="w-24 h-24 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 shadow-xl">
                        <MessageCircle className="w-10 h-10 text-emerald-500/20" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Platform Support</h3>
                    <p className="max-w-xs text-sm text-zinc-400">Communicating with your clients is better than ever. Select a client to start a conversation or initiate a call.</p>
                </div>
            )}
        </div>
    );
};

export default ChatPage;
