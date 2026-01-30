import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Send,
    Bot,
    X,
    Maximize2,
    MessageSquare,
    Sparkles,
    Loader2,
    ChevronDown,
    Mic,
    MicOff,
    Volume2,
    Save,
    FolderOpen,
    Trash2
} from "lucide-react";
import { useAgent } from "@/hooks/useAgent";
import { GlowingCard } from "./GlowingCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Available models from nexus-ollama (update via: docker exec nexus-ollama ollama list)
const AVAILABLE_MODELS = [
    { id: 'nexus-swarm', name: 'Nexus Swarm', description: 'Multi-agent routing' },
    { id: 'nexus-ollama-qwen3:8b', name: 'Qwen3 8B', description: 'Local Fast general purpose' },
    { id: 'nexus-ollama-ministral-3:8b', name: 'Ministral 3', description: 'Local Compact reasoning' },
    { id: 'openrouter-deepseek-v3', name: 'DeepSeek V3', description: 'Cloud SOTA (Datasets)' },
];

export const AgentChat = ({ isCollapsed = false }: { isCollapsed?: boolean }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0]);
    const [showModelPicker, setShowModelPicker] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [visualProcessing, setVisualProcessing] = useState(false);
    const [showSessionPicker, setShowSessionPicker] = useState(false);
    const { messages, isProcessing, sendMessage, clearChat, sessions, saveSession, loadSession, deleteSession } = useAgent();
    const scrollRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const recognitionRef = useRef<any>(null);

    // Session Deletion State
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);

    const handleDeleteSession = async (sessionId: string) => {
        setDeletingSessionId(sessionId);
        await deleteSession(sessionId);
        setDeletingSessionId(null);
        setConfirmDeleteId(null);
    };

    // Persist processing visual for at least 1.5s to prevent flickering
    useEffect(() => {
        if (isProcessing) {
            setVisualProcessing(true);
        } else {
            const timer = setTimeout(() => setVisualProcessing(false), 1500);
            return () => clearTimeout(timer);
        }
    }, [isProcessing]);

    // Voice Input Logic (Browser Native)
    const toggleVoice = () => {
        if (!('webkitSpeechRecognition' in window)) {
            alert("Voice input not supported in this browser.");
            return;
        }

        if (isListening) {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            setIsListening(false);
        } else {
            setIsListening(true);
            const recognition = new (window as any).webkitSpeechRecognition();
            recognitionRef.current = recognition;
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onresult = (event: any) => {
                const text = event.results[0][0].transcript;
                setInput(text);
                setIsListening(false);
                // Auto-submit after voice capture
                if (text.trim()) {
                    sendMessage(text, selectedModel.id);
                    setInput("");
                }
            };

            recognition.onerror = () => setIsListening(false);
            recognition.onend = () => setIsListening(false);
            recognition.start();
        }
    };

    // Agent Voice Output (TTS)
    const speakText = (text: string) => {
        if (!('speechSynthesis' in window)) return;

        // Cancel existing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US'; // Hard lock to English
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);

        // Find a cool English voice
        const voices = window.speechSynthesis.getVoices();
        const nexusVoice = voices.find(v =>
            (v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('English')) &&
            v.lang.startsWith('en')
        ) || voices.find(v => v.lang.startsWith('en')) || voices[0];

        if (nexusVoice) {
            utterance.voice = nexusVoice;
            utterance.lang = nexusVoice.lang; // Match the voice specifically
        }

        window.speechSynthesis.speak(utterance);
    };

    // Auto-speak new assistant messages
    useEffect(() => {
        const lastMsg = messages[messages.length - 1];
        if (lastMsg && lastMsg.role === 'assistant' && !isProcessing) {
            speakText(lastMsg.content);
        }
    }, [messages, isProcessing]);

    useEffect(() => {
        if (isProcessing && videoRef.current) {
            videoRef.current.play();
            setIsSpeaking(true);
        } else if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
            setIsSpeaking(false);
        }
    }, [isProcessing]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isProcessing) {
            sendMessage(input, selectedModel.id);
            setInput("");
        }
    };

    return (
        <>
            {/* Trigger Button (Sidebar Mini) */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group relative",
                    isOpen ? "bg-primary/20 text-primary" : "text-sidebar-foreground hover:bg-sidebar-accent"
                )}
                whileHover={{ x: 4 }}
            >
                <div className="relative">
                    <MessageSquare className="w-5 h-5" />
                    {isProcessing && (
                        <motion.div
                            className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ repeat: Infinity, duration: 1 }}
                        />
                    )}
                </div>
                {!isCollapsed && (
                    <span className="text-sm font-medium">Link with Swarm</span>
                )}
            </motion.button>

            {/* Chat Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Click-outside overlay */}
                        <motion.div
                            className="fixed inset-0 z-40"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, x: 20, y: 20 }}
                            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, x: 20, y: 20 }}
                            className="fixed bottom-24 left-64 w-96 h-[500px] z-50 flex flex-col glass-panel shadow-2xl border border-primary/20 rounded-xl overflow-hidden"
                        >
                            {/* Header */}
                            <div className="p-3 border-b border-primary/20 bg-background/50 flex items-center justify-between">
                                <div className="flex items-center gap-2 relative">
                                    <div className="p-1.5 rounded-lg bg-primary/20">
                                        <Sparkles className="w-4 h-4 text-primary" />
                                    </div>
                                    <button
                                        onClick={() => setShowModelPicker(!showModelPicker)}
                                        className="flex items-center gap-1 hover:bg-muted/50 rounded px-1 py-0.5 transition-colors"
                                    >
                                        <h3 className="font-orbitron text-xs font-bold neon-text">{selectedModel.name.toUpperCase()}</h3>
                                        <ChevronDown className="w-3 h-3 text-muted-foreground" />
                                    </button>

                                    {/* Model Picker Dropdown */}
                                    {showModelPicker && (
                                        <div className="absolute top-full left-0 mt-2 w-48 glass-panel border border-primary/20 rounded-lg shadow-xl z-50">
                                            {AVAILABLE_MODELS.map((model) => (
                                                <button
                                                    key={model.id}
                                                    onClick={() => { setSelectedModel(model); setShowModelPicker(false); }}
                                                    className={`w-full text-left px-3 py-2 hover:bg-muted/50 transition-colors ${selectedModel.id === model.id ? 'bg-muted/30' : ''}`}
                                                >
                                                    <div className="text-xs font-medium">{model.name}</div>
                                                    <div className="text-[10px] text-muted-foreground">{model.description}</div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 w-7 p-0"
                                        onClick={() => saveSession()}
                                        title="Save conversation"
                                    >
                                        <Save className="w-3.5 h-3.5" />
                                    </Button>

                                    <div className="relative">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 w-7 p-0"
                                            onClick={() => setShowSessionPicker(!showSessionPicker)}
                                            title="Load conversation"
                                        >
                                            <FolderOpen className="w-3.5 h-3.5" />
                                        </Button>

                                        {/* Session picker dropdown */}
                                        {showSessionPicker && sessions.length > 0 && (
                                            <div className="absolute top-full right-0 mt-2 w-64 glass-panel border border-primary/20 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto">
                                                {sessions.map((session) => (
                                                    <div key={session.id} className="group flex items-center justify-between hover:bg-primary/10 transition-colors border-b border-primary/5 last:border-0 pr-2">
                                                        <button
                                                            onClick={() => {
                                                                loadSession(session.id);
                                                                setShowSessionPicker(false);
                                                            }}
                                                            className="flex-1 text-left px-3 py-2"
                                                        >
                                                            <div className="text-xs font-medium text-foreground">{session.name}</div>
                                                            <div className="text-[10px] text-muted-foreground mt-0.5">
                                                                {session.message_count} messages • {new Date(session.created_at).toLocaleDateString()}
                                                            </div>
                                                        </button>
                                                        {confirmDeleteId === session.id ? (
                                                            <div className="flex items-center gap-1">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDeleteSession(session.id);
                                                                    }}
                                                                    className="p-1 text-red-500 hover:bg-red-500/10 rounded"
                                                                    title="Confirm delete"
                                                                >
                                                                    {deletingSessionId === session.id ? (
                                                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                                    ) : (
                                                                        <span className="text-[10px] font-bold">SURE?</span>
                                                                    )}
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setConfirmDeleteId(null);
                                                                    }}
                                                                    className="p-1 text-muted-foreground hover:text-foreground hover:bg-white/10 rounded"
                                                                    title="Cancel"
                                                                >
                                                                    <X className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setConfirmDeleteId(session.id);
                                                                }}
                                                                className="p-1.5 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                title="Delete chat"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Empty state */}
                                        {showSessionPicker && sessions.length === 0 && (
                                            <div className="absolute top-full right-0 mt-2 w-48 glass-panel border border-primary/20 rounded-lg shadow-xl z-50 p-3 text-center">
                                                <p className="text-xs text-muted-foreground">No saved chats</p>
                                            </div>
                                        )}
                                    </div>

                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setIsOpen(false)}>
                                        <ChevronDown className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Avatar / Visuals Area (Full Box Background) */}
                            {visualProcessing && (
                                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                                    <video
                                        ref={videoRef}
                                        src="/assets/videos/nexus_avatar.mp4"
                                        loop
                                        muted
                                        playsInline
                                        className="w-full h-full object-cover opacity-80"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background/90" />
                                </div>
                            )}

                            {/* Messages Area */}
                            <div
                                ref={scrollRef}
                                className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide bg-transparent relative z-10"
                            >
                                {messages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-50">
                                        <Bot className="w-8 h-8 text-primary" />
                                        <p className="text-xs text-muted-foreground font-mono">LINK ESTABLISHED.<br />AWAITING COMMANDS.</p>
                                    </div>
                                ) : (
                                    messages.map((msg, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={cn(
                                                "flex flex-col max-w-[85%]",
                                                msg.role === 'user' ? "ml-auto items-end" : "items-start"
                                            )}
                                        >
                                            <div className={cn(
                                                "px-3 py-2 rounded-lg text-xs leading-relaxed",
                                                msg.role === 'user'
                                                    ? "bg-primary/20 text-primary border border-primary/10 rounded-br-none"
                                                    : "bg-muted/30 text-foreground border border-white/5 rounded-bl-none"
                                            )}>
                                                {msg.content}
                                                {msg.isStreaming && (
                                                    <motion.span
                                                        className="inline-block w-1.5 h-3 bg-primary ml-1 align-middle"
                                                        animate={{ opacity: [1, 0, 1] }}
                                                        transition={{ repeat: Infinity, duration: 0.8 }}
                                                    />
                                                )}
                                            </div>
                                            <span className="text-[8px] text-muted-foreground mt-1 px-1">
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </motion.div>
                                    ))
                                )}
                                {isProcessing && (
                                    <div className="flex items-center gap-2 text-primary opacity-60">
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                        <span className="text-[10px] font-mono">RELAYING THROUGH SWARM...</span>
                                    </div>
                                )}
                            </div>

                            {/* Input Area */}
                            <form onSubmit={handleSubmit} className="p-3 bg-background/50 border-t border-primary/20 relative">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder={isListening ? "Listening..." : "Direct command to swarm..."}
                                    className={cn(
                                        "w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary/50 font-mono transition-colors pr-20",
                                        isListening && "border-primary animate-pulse"
                                    )}
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={toggleVoice}
                                        className={cn(
                                            "p-1.5 rounded-md transition-colors",
                                            isListening ? "text-red-500 bg-red-500/10" : "text-muted-foreground hover:text-primary"
                                        )}
                                    >
                                        {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isProcessing || !input.trim()}
                                        className="p-1.5 text-primary hover:text-primary-foreground disabled:opacity-30 transition-colors"
                                    >
                                        <Send className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};
