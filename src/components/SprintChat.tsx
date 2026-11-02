"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, X, Send, Loader2, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Message = {
    role: "user" | "assistant";
    content: string;
};

export default function SprintChat() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "¡Hola! Soy SprintBot, el asistente virtual de Lsprint. ¿En qué te puedo ayudar hoy? Puedo cotizarte trabajos o darte información sobre nuestros servicios." }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    if (pathname?.startsWith("/admin") || pathname?.startsWith("/muestra")) {
        return null;
    }

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg: Message = { role: "user", content: input.trim() };
        const newMessages = [...messages, userMsg];

        setMessages(newMessages);
        setInput("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: newMessages })
            });

            if (!res.ok) {
                throw new Error("Network response was not ok");
            }

            const data = await res.json();
            if (data.error) throw new Error(data.error);

            setMessages([...newMessages, { role: "assistant", content: data.content }]);
        } catch (error) {
            console.error(error);
            setMessages([...newMessages, { role: "assistant", content: "Ups, tuve un problema al procesar tu solicitud. Por favor intenta de nuevo en un momento." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleSend();
        }
    };

    return (
        <>
            {/* Botón flotante */}
            <button
                onClick={() => setIsOpen(true)}
                aria-label="Abrir asistente virtual"
                className={`fixed bottom-6 right-6 z-[90] w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00CFFF] to-[#E91E8C] text-white shadow-[0_8px_28px_rgba(0,207,255,0.35)] border border-white/20 flex items-center justify-center hover:scale-105 transition-transform ${isOpen ? "hidden" : "flex"}`}
            >
                <MessageCircle size={26} />
            </button>

            {/* Ventana del Chat */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.94 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.94 }}
                        transition={{ duration: 0.2 }}
                        className="fixed bottom-6 right-6 z-[100] w-[92vw] sm:w-[390px] h-[550px] max-h-[85vh] bg-[#0d121c] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Cabecera */}
                        <div className="flex items-center justify-between px-5 py-3.5 bg-[#121927] border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#00CFFF] to-[#E91E8C] flex items-center justify-center shadow-md">
                                    <Bot size={18} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-sm">SprintBot IA</h3>
                                    <p className="text-[#00CFFF] text-[10px] font-semibold flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                        Asistente en línea
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-white/50 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Mensajes */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#07090f]">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                    <div
                                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                                            msg.role === "user"
                                                ? "bg-[#00CFFF] text-[#05080f] rounded-br-sm font-semibold"
                                                : "bg-[#121927] text-slate-100 border border-white/10 rounded-bl-sm"
                                        }`}
                                    >
                                        <div dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, "<br/>").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-[#121927] border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
                                        <Loader2 size={16} className="text-[#00CFFF] animate-spin" />
                                        <span className="text-xs text-white/50">SprintBot está escribiendo...</span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-3 bg-[#121927] border-t border-white/10">
                            <div className="flex items-center gap-2 bg-[#07090f] border border-white/10 rounded-full pl-4 pr-1.5 py-1.5 focus-within:border-[#00CFFF]/50 transition-colors">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Consultá por lonas, vinilos, cartelería..."
                                    className="flex-1 bg-transparent text-sm text-white placeholder-white/30 outline-none"
                                    disabled={isLoading}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim() || isLoading}
                                    className="w-8 h-8 rounded-full bg-[#00CFFF] text-[#05080f] flex items-center justify-center flex-shrink-0 disabled:opacity-40 disabled:bg-white/10 disabled:text-white/30 transition-colors"
                                >
                                    <Send size={14} className="ml-0.5" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
