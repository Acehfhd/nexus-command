import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronDown,
    ChevronUp,
    Clock,
    Bitcoin,
    Terminal,
    Bell,
    Users
} from "lucide-react";
import { GlowingCard } from "./GlowingCard";
import { cn } from "@/lib/utils";
import { MemoryEvent } from "@/hooks/useMemory";

interface MemoryCardProps {
    event: MemoryEvent;
}

export const MemoryCard = ({ event }: MemoryCardProps) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const typeIcons = {
        crypto: Bitcoin,
        leads: Users,
        system: Terminal,
        logs: Bell,
    };

    const levelColors = {
        success: "primary" as const,
        warning: "warning" as const,
        error: "destructive" as const,
        info: "secondary" as const,
    };

    const levelBgColors = {
        success: "bg-primary/20 text-primary",
        warning: "bg-warning/20 text-warning",
        error: "bg-destructive/20 text-destructive",
        info: "bg-secondary/20 text-secondary",
    };

    const Icon = typeIcons[event.type] || Terminal;

    return (
        <GlowingCard
            glowColor={levelColors[event.level]}
            className="cursor-pointer relative overflow-hidden"
            hover={!isExpanded}
        >
            <motion.div
                onClick={() => setIsExpanded(!isExpanded)}
                className="relative z-10"
            >
                {/* Header Row */}
                <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={cn("p-2 rounded-lg shrink-0", levelBgColors[event.level])}>
                        <Icon className="w-4 h-4" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-medium text-sm">{event.title}</h3>
                            <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                                {event.type}
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                            {event.message}
                        </p>
                    </div>

                    {/* Timestamp & Expand */}
                    <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {event.timestamp_human || event.timestamp}
                        </div>
                        <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-muted-foreground" />
                            ) : (
                                <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            )}
                        </motion.div>
                    </div>
                </div>

                {/* Expandable Content */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            <div className="mt-4 pt-4 border-t border-border/50">
                                {/* Full Message */}
                                <div className="mb-3">
                                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Full Message</span>
                                    <p className="text-sm mt-1">{event.message}</p>
                                </div>

                                {/* Metadata Grid */}
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-xs text-muted-foreground uppercase tracking-wider">Type</span>
                                        <p className="font-medium capitalize">{event.type}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-muted-foreground uppercase tracking-wider">Level</span>
                                        <p className={cn("font-medium capitalize",
                                            event.level === 'success' && 'text-primary',
                                            event.level === 'warning' && 'text-warning',
                                            event.level === 'error' && 'text-destructive',
                                            event.level === 'info' && 'text-secondary'
                                        )}>
                                            {event.level}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-muted-foreground uppercase tracking-wider">Event ID</span>
                                        <p className="font-mono text-xs">{event.id}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-muted-foreground uppercase tracking-wider">Timestamp</span>
                                        <p className="font-mono text-xs">{event.timestamp}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </GlowingCard>
    );
};
