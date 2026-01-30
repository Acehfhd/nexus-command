import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal as TerminalIcon, Minus, Square, X } from "lucide-react";

interface LogEntry {
  timestamp: string;
  level: "info" | "success" | "warning" | "error";
  message: string;
}

interface TerminalProps {
  logs?: LogEntry[];
  title?: string;
  maxLines?: number;
}

const mockLogs: LogEntry[] = [
  { timestamp: "00:00:01", level: "info", message: "[NEXUS] System initialization sequence started..." },
  { timestamp: "00:00:02", level: "success", message: "[NEXUS] Core modules loaded successfully" },
  { timestamp: "00:00:03", level: "info", message: "[OLLAMA] Loading neural network weights..." },
  { timestamp: "00:00:04", level: "success", message: "[OLLAMA] Model 'llama3.1:70b' ready" },
  { timestamp: "00:00:05", level: "info", message: "[COMFYUI] Initializing image synthesis pipeline..." },
  { timestamp: "00:00:06", level: "success", message: "[COMFYUI] VRAM allocated: 14.2GB / 16GB" },
  { timestamp: "00:00:07", level: "info", message: "[N8N] Workflow automation engine starting..." },
  { timestamp: "00:00:08", level: "success", message: "[N8N] 12 workflows loaded, 3 active triggers" },
  { timestamp: "00:00:09", level: "warning", message: "[MONITOR] GPU temperature: 72°C (threshold: 85°C)" },
  { timestamp: "00:00:10", level: "info", message: "[NEXUS] All systems operational. Awaiting commands..." },
];

export const Terminal = ({
  logs: externalLogs,
  title = "SYSTEM_LOG",
  maxLines = 10,
}: TerminalProps) => {
  const [logs, setLogs] = useState<LogEntry[]>(externalLogs || []);
  const [isMinimized, setIsMinimized] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Simulate log streaming if no external logs provided
  useEffect(() => {
    if (externalLogs) {
      setLogs(externalLogs);
      return;
    }

    let index = 0;
    const interval = setInterval(() => {
      if (index < mockLogs.length) {
        setLogs((prev) => [...prev.slice(-maxLines + 1), mockLogs[index]]);
        index++;
      } else {
        // Generate random activity logs
        const activities = [
          { level: "info" as const, message: "[NEXUS] Heartbeat check: all nodes responsive" },
          { level: "success" as const, message: "[COMFYUI] Image generation complete: batch_0x3f2a" },
          { level: "info" as const, message: "[OLLAMA] Processing inference request..." },
          { level: "warning" as const, message: "[MONITOR] Memory usage: 78%" },
          { level: "success" as const, message: "[N8N] Workflow 'lead-gen-v2' executed successfully" },
        ];
        const randomLog = activities[Math.floor(Math.random() * activities.length)];
        const now = new Date();
        const timestamp = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
        setLogs((prev) => [...prev.slice(-maxLines + 1), { ...randomLog, timestamp }]);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [externalLogs, maxLines]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  const levelColors = {
    info: "text-secondary",
    success: "text-primary",
    warning: "text-warning",
    error: "text-destructive",
  };

  return (
    <motion.div
      className="glass-panel overflow-hidden relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      layout
    >
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-background/50">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-4 h-4 text-primary" />
          <span className="font-orbitron text-xs text-muted-foreground">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-muted rounded transition-colors"
          >
            <Minus className="w-3 h-3 text-muted-foreground" />
          </button>
          <button className="p-1 hover:bg-muted rounded transition-colors">
            <Square className="w-3 h-3 text-muted-foreground" />
          </button>
          <button className="p-1 hover:bg-destructive/20 rounded transition-colors">
            <X className="w-3 h-3 text-muted-foreground hover:text-destructive" />
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            ref={terminalRef}
            className="p-4 h-48 overflow-y-auto bg-background/80 relative scanlines"
            initial={{ height: 0 }}
            animate={{ height: 192 }}
            exit={{ height: 0 }}
          >
            {logs.map((log, index) => (
              <motion.div
                key={`${log.timestamp}-${index}`}
                className="flex gap-2 text-xs font-mono leading-relaxed"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
              >
                <span className="text-muted-foreground">[{log.timestamp}]</span>
                <span className={levelColors[log.level]}>{log.message}</span>
              </motion.div>
            ))}
            {/* Blinking cursor */}
            <div className="flex items-center gap-1 mt-1">
              <span className="text-primary text-xs">{">"}</span>
              <motion.span
                className="w-2 h-4 bg-primary"
                animate={{ opacity: [1, 0] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
