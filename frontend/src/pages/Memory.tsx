import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Brain,
    Search,
    Filter,
    RefreshCw,
    Database,
    Activity,
    AlertCircle,
    Loader2,
    HardDrive,
    Archive,
    History,
    Zap,
    Terminal,
    Info,
    Shield
} from "lucide-react";
import { GlowingCard } from "@/components/nexus/GlowingCard";
import { MemoryCard } from "@/components/nexus/MemoryCard";
import { StatusBadge } from "@/components/nexus/StatusBadge";
import { Input } from "@/components/ui/input";
import { useMemory } from "@/hooks/useMemory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const filterOptions = [
    { value: "all", label: "All" },
    { value: "system", label: "System" },
    { value: "crypto", label: "Crypto" },
    { value: "leads", label: "Leads" },
    { value: "logs", label: "Logs" },
];


const Memory = () => {
    const {
        sessions,
        isLoading,
        error,
        refresh
    } = useMemory();

    const [search, setSearch] = useState("");

    // Mock data for the swarm agents (from SwarmStatus)
    const [agents] = useState([
        {
            id: 'lead',
            name: "Antigravity (Lead)",
            icon: Zap,
            status: "Online",
            activity: "Orchestrating Swarm Merge",
            lastUpdated: "Just now",
            role: "Architect & PM"
        },
        {
            id: 'ui',
            name: "Roo (UI Specialist)",
            icon: Shield,
            status: "Online",
            activity: "Merging UI into Memory Vault",
            lastUpdated: "Just now",
            role: "Frontend & Aesthetics"
        },
        {
            id: 'logic',
            name: "Gemini (Logic)",
            icon: Terminal,
            status: "Idle",
            activity: "Bus verification complete",
            lastUpdated: "8m ago",
            role: "Backend & Orchestration"
        },
        {
            id: 'test',
            name: "OpenCode (Tests)",
            icon: Activity,
            status: "Idle",
            activity: "Latency baseline: 136ms",
            lastUpdated: "12m ago",
            role: "Verification & Audit"
        }
    ]);

    // Filter sessions
    const filteredSessions = sessions.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.id.includes(search)
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div>
                    <h1 className="text-2xl font-orbitron font-bold neon-text flex items-center gap-3 text-purple-400">
                        <Brain className="w-8 h-8" />
                        AGENT MEMORY
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Active Swarm Thoughts & Session Archives
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <StatusBadge
                        status={isLoading ? "processing" : error ? "error" : "online"}
                        label={isLoading ? "SYNCING" : error ? "ERROR" : "SWARM_LINKED"}
                    />
                </div>
            </motion.div>

            <Tabs defaultValue="swarm" className="w-full">
                <TabsList className="bg-black/20 border border-white/5 mb-6">
                    <TabsTrigger value="swarm" className="font-orbitron text-xs">ACTIVE SWARM</TabsTrigger>
                    <TabsTrigger value="vault" className="font-orbitron text-xs">STORAGE VAULT</TabsTrigger>
                </TabsList>

                <TabsContent value="swarm" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {agents.map((agent) => (
                            <motion.div
                                key={agent.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="group"
                            >
                                <GlowingCard className="h-full border-white/5 hover:border-purple-500/30 transition-all duration-300">
                                    <div className="space-y-4">
                                        <div className="flex items-start justify-between">
                                            <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                                                <agent.icon className="w-5 h-5 text-purple-400" />
                                            </div>
                                            <div className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${agent.status === 'Online' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                                }`}>
                                                {agent.status}
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="font-orbitron font-bold text-sm tracking-tight">{agent.name}</h3>
                                            <p className="text-[9px] text-purple-400/70 font-mono uppercase tracking-widest">{agent.role}</p>
                                        </div>
                                        <div className="pt-3 border-t border-white/5">
                                            <p className="text-[11px] leading-relaxed italic text-gray-400 line-clamp-2">"{agent.activity}"</p>
                                        </div>
                                    </div>
                                </GlowingCard>
                            </motion.div>
                        ))}
                    </div>

                    <GlowingCard className="bg-black/40 border-white/5">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                                <Terminal className="w-4 h-4 text-purple-400" />
                                <h2 className="font-orbitron font-bold text-xs uppercase tracking-widest">Thought Stream</h2>
                            </div>
                            <div className="font-mono text-[10px] space-y-1.5 opacity-70">
                                <p className="text-green-400">[16:12:35] MEMORY: Syncing with Intelligence feeds...</p>
                                <p className="text-blue-400">[16:13:20] LEAD: Re-orienting UI architecture based on user feedback.</p>
                                <p className="text-purple-400">[16:14:10] UI: Consolidating SwarmStatus into Memory Vault.</p>
                                <p className="text-gray-500">[16:15:00] SYSTEM: 100% Signal Integrity verified on Radical Bus.</p>
                            </div>
                        </div>
                    </GlowingCard>
                </TabsContent>

                <TabsContent value="vault" className="space-y-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <GlowingCard>
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/20">
                                    <Database className="w-5 h-5 text-primary" />
                                </div>
                                kernel<div>
                                    <div className="text-2xl font-orbitron font-bold">{sessions.length}</div>
                                    <div className="text-xs text-muted-foreground">Total Sessions</div>
                                </div>
                            </div>
                        </GlowingCard>
                        <GlowingCard glowColor="secondary">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-secondary/20">
                                    <Archive className="w-5 h-5 text-secondary" />
                                </div>
                                <div>
                                    <div className="text-2xl font-orbitron font-bold">
                                        {sessions.reduce((acc, s) => acc + s.message_count, 0)}
                                    </div>
                                    <div className="text-xs text-muted-foreground">Total Messages</div>
                                </div>
                            </div>
                        </GlowingCard>
                        <GlowingCard>
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/20 text-right">
                                    <motion.button
                                        onClick={refresh}
                                        className="p-1.5 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors"
                                        disabled={isLoading}
                                    >
                                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                                    </motion.button>
                                </div>
                                <div className="flex-1">
                                    <div className="text-2xl font-orbitron font-bold">{filteredSessions.length}</div>
                                    <div className="text-xs text-muted-foreground">Results</div>
                                </div>
                            </div>
                        </GlowingCard>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search archive..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 bg-muted/50 border-border"
                        />
                    </div>

                    {/* Session List */}
                    <div className="grid grid-cols-1 gap-3">
                        <AnimatePresence>
                            {filteredSessions.map((session, index) => (
                                <motion.div
                                    key={session.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <GlowingCard className="hover:bg-muted/10 transition-colors cursor-pointer group py-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2.5 rounded-full bg-primary/10 text-primary">
                                                    <History className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-sm">{session.name}</h3>
                                                    <div className="text-[10px] text-muted-foreground flex items-center gap-2">
                                                        <span>{new Date(session.created_at).toLocaleDateString()}</span>
                                                        <span>•</span>
                                                        <span>{session.message_count} msgs</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-muted-foreground font-mono text-[10px] opacity-30 px-3">
                                                ID: {session.id.slice(0, 4)}
                                            </div>
                                        </div>
                                    </GlowingCard>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {filteredSessions.length === 0 && !isLoading && (
                            <div className="text-center py-12 text-muted-foreground text-sm font-mono opacity-50">
                                NO ARCHIVES FOUND
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};


export default Memory;
