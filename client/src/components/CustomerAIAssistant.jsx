import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Bot, User, Loader2, Sparkles, ShoppingBag } from 'lucide-react';
import axios from 'axios';

const CustomerAIAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [history, setHistory] = useState([
        { role: 'model', content: "Hello! I'm your Apex Assistant. How can I help you discover our authentic African collections today?" }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef(null);

    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [history]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim() || isLoading) return;

        const userMsg = { role: 'user', content: message };
        setHistory(prev => [...prev, userMsg]);
        setMessage('');
        setIsLoading(true);

        try {
            const { data } = await axios.post(`${API_URL}/ai/chat`, {
                message,
                history: history,
                context: {
                    page: window.location.pathname,
                    productName: document.title // Best effort context
                }
            });

            if (data.success) {
                setHistory(prev => [...prev, { role: 'model', content: data.reply }]);
            }
        } catch (error) {
            console.error("Chat Error:", error);
            const errorMsg = error.response?.status === 429
                ? "I'm receiving too many requests right now. Please try again in a minute!"
                : "I'm sorry, I encountered an error. Please try again in a moment.";
            setHistory(prev => [...prev, { role: 'model', content: errorMsg }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999]">
            {/* Chat Bubble Toggle */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 ${isOpen ? 'bg-gray-800 rotate-90' : 'bg-gradient-to-r from-orange-500 to-pink-600'
                    }`}
            >
                {isOpen ? <X className="text-white" size={28} /> : <MessageSquare className="text-white" size={28} />}
                {!isOpen && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-orange-500"></span>
                    </span>
                )}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="absolute bottom-20 right-0 w-[90vw] sm:w-[380px] h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-orange-500 to-pink-600 p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                            <Bot className="text-white" size={24} />
                        </div>
                        <div>
                            <h3 className="text-white font-bold leading-none">Apex Assistant</h3>
                            <span className="text-xs text-orange-100 flex items-center gap-1 mt-1">
                                <Sparkles size={10} /> AI Powered Guide
                            </span>
                        </div>
                    </div>

                    {/* Messages */}
                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
                    >
                        {history.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-orange-100' : 'bg-white shadow-sm border border-gray-100'
                                        }`}>
                                        {msg.role === 'user' ? <User size={16} className="text-orange-600" /> : <Bot size={16} className="text-pink-600" />}
                                    </div>
                                    <div className={`p-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                        ? 'bg-orange-600 text-white rounded-tr-none'
                                        : 'bg-white text-gray-700 shadow-sm border border-gray-100 rounded-tl-none'
                                        }`}>
                                        {msg.content}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="flex gap-2 max-w-[85%]">
                                    <div className="w-8 h-8 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center">
                                        <Bot size={16} className="text-pink-600" />
                                    </div>
                                    <div className="p-3 bg-white shadow-sm border border-gray-100 rounded-2xl rounded-tl-none flex items-center gap-2">
                                        <Loader2 className="animate-spin text-orange-500" size={16} />
                                        <span className="text-sm text-gray-400">Thinking...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <form
                        onSubmit={handleSendMessage}
                        className="p-4 bg-white border-t border-gray-100 flex gap-2"
                    >
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Ask about our products..."
                            className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-orange-500 transition-all"
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !message.trim()}
                            className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
                        >
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default CustomerAIAssistant;
