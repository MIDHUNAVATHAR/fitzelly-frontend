import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useChat, type Conversation } from '../../../context/ChatContext';
import { useAuth } from '../../../context/useAuth';
import { getConversations, getMessages, sendMessage, markAsRead, getConversationWithUser, uploadAttachment } from '../../../api/chat.api';
import { Send, Phone, Video, Search, MessageCircle, Clock, Paperclip, FileText, Download, Trash2, Loader2, Smile } from 'lucide-react';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import CallHistoryModal from '../../../components/ui/CallHistoryModal';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useLocation } from 'react-router-dom';

const ChatPage: React.FC = () => {
    const { user } = useAuth();
    const location = useLocation();
    const {
        messages, setMessages, sendMessage: sendSocketMessage,
        initiateCall, typingStatus, sendTypingStatus,
        conversations, setConversations, deleteMessage
    } = useChat();
    const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
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
                    const existing = data.find((c: Conversation) => c.otherUser?.id === location.state.selectUserId);
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
    }, [location.state, setConversations]);

    const fetchMessages = useCallback(async (convId: string) => {
        try {
            const data = await getMessages(convId);
            setMessages(data);
        } catch (e) {
            console.error(e);
        }
    }, [setMessages]);

    useEffect(() => {
        if (selectedConv) {
            fetchMessages(selectedConv.id);
            markAsRead(selectedConv.id);
        }
    }, [selectedConv, fetchMessages]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);




    const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
        triggerTypingIndicator();
    };

    const triggerTypingIndicator = () => {
        if (selectedConv) {
            sendTypingStatus(selectedConv.id, selectedConv.otherUser.id, true);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                sendTypingStatus(selectedConv.id, selectedConv.otherUser.id, false);
            }, 3000);
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

    const handleAttachment = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedConv) return;

        setIsUploading(true);
        try {
            const { url } = await uploadAttachment(file);

            let type: 'image' | 'video' | 'audio' | 'file' = 'file';
            if (file.type.startsWith('image/')) type = 'image';
            else if (file.type.startsWith('video/')) type = 'video';
            else if (file.type.startsWith('audio/')) type = 'audio';

            const messageData = {
                conversationId: selectedConv.id,
                receiverId: selectedConv.otherUser.id,
                content: url, // Store S3 URL as content
                type: type
            };

            const savedMessage = await sendMessage(messageData);
            sendSocketMessage(savedMessage);
        } catch (err) {
            console.error("Upload failed", err);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
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
                        [...conversations]
                            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                            .map(conv => (
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
                                                {format(new Date(conv.updatedAt), 'h:mm a')}
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
                            <button
                                onClick={() => setIsHistoryOpen(true)}
                                title="Call History"
                                className="p-2.5 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors border border-transparent hover:border-zinc-700"
                            >
                                <Clock className="w-5 h-5" />
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
                                    onDoubleClick={() => isMine && setMessageToDelete(msg.id || msg._id || null)}
                                    className={`flex ${isMine ? 'justify-end' : 'justify-start'} relative group/msg`}
                                >
                                    <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-[13px] shadow-sm relative ${isMine
                                            ? 'bg-emerald-500 text-black font-medium rounded-tr-none'
                                            : 'bg-zinc-800 text-white rounded-tl-none border border-zinc-700/50'
                                        }`}>
                                        {messageToDelete === (msg.id || msg._id) && isMine && (
                                            <button
                                                onClick={() => {
                                                    deleteMessage(msg.id || msg._id || '');
                                                    setMessageToDelete(null);
                                                }}
                                                className="absolute -left-10 top-1/2 -translate-y-1/2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all shadow-lg z-20"
                                                title="Delete for everyone"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                        {msg.type === 'text' && <p className="leading-relaxed">{msg.content}</p>}

                                        {msg.type === 'image' && (
                                            <div className="relative group">
                                                <img
                                                    src={msg.content}
                                                    alt="attachment"
                                                    className="max-w-[240px] w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                                    onClick={() => window.open(msg.content, '_blank')}
                                                />
                                                <a
                                                    href={msg.content}
                                                    download
                                                    className="absolute bottom-2 right-2 p-1.5 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title="Download Image"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </a>
                                            </div>
                                        )}

                                        {msg.type === 'video' && (
                                            <div className="max-w-[240px]">
                                                <video src={msg.content} controls className="w-full rounded-lg" />
                                            </div>
                                        )}

                                        {msg.type === 'audio' && (
                                            <div className="flex flex-col gap-1">
                                                <audio src={msg.content} controls className="max-w-full" />
                                            </div>
                                        )}

                                        {msg.type === 'file' && (
                                            <a
                                                href={msg.content}
                                                download
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 p-2 bg-black/20 rounded-lg hover:bg-black/30 transition-colors"
                                            >
                                                <FileText className="w-5 h-5 text-emerald-400" />
                                                <span className="truncate text-xs underline">Download Document</span>
                                                <Download className="w-4 h-4 ml-auto text-emerald-400 font-bold" />
                                            </a>
                                        )}

                                        <p className={`text-[9px] mt-1.5 text-right font-medium ${isMine ? 'text-black/50' : 'text-zinc-500'}`}>
                                            {format(new Date(msg.createdAt), 'h:mm a')}
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
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handleAttachment}
                                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx"
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                                className="p-3 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all border border-zinc-700/50"
                            >
                                {isUploading ? (
                                    <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                                ) : (
                                    <Paperclip className="w-5 h-5" />
                                )}
                            </button>

                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    className={`p-3 rounded-xl bg-zinc-800 transition-all border ${showEmojiPicker ? 'text-emerald-500 bg-zinc-700 border-emerald-500/30' : 'text-zinc-400 hover:text-white hover:bg-zinc-700 border-zinc-700/50'}`}
                                >
                                    <Smile className="w-5 h-5" />
                                </button>
                                {showEmojiPicker && (
                                    <div className="absolute bottom-full mb-4 left-0 z-50">
                                        <div 
                                            className="fixed inset-0" 
                                            onClick={() => setShowEmojiPicker(false)}
                                        ></div>
                                        <div className="relative">
                                            <EmojiPicker
                                                theme={Theme.DARK}
                                                onEmojiClick={(emojiData) => {
                                                    setInputValue(prev => prev + emojiData.emoji);
                                                    setShowEmojiPicker(false);
                                                    triggerTypingIndicator();
                                                }}
                                                autoFocusSearch={false}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={handleTyping}
                                    placeholder={isUploading ? "Uploading attachment..." : "Type your message..."}
                                    disabled={isUploading}
                                    className="w-full bg-zinc-800/80 border border-zinc-700/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-zinc-600"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={!inputValue.trim() || isUploading}
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

            <CallHistoryModal
                isOpen={isHistoryOpen}
                onClose={() => setIsHistoryOpen(false)}
            />
        </div>
    );
};

export default ChatPage;
