import { motion } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { LucideIcon } from "lucide-react";

interface PodCardProps {
  name: string;
  description: string;
  icon: LucideIcon;
  port: number;
  isRunning: boolean;
  onToggle: () => void;
  onRebuild?: () => void;
  onDelete?: () => void;
  onSummon?: () => void;
  status?: "healthy" | "warning" | "error" | "offline";
}

export const PodCard = ({
  name,
  description,
  icon: Icon,
  port,
  isRunning,
  onToggle,
  onRebuild,
  onDelete,
  onSummon,
  status = isRunning ? "healthy" : "offline",
}: PodCardProps) => {
  const statusColors = {
    healthy: "bg-primary",
    warning: "bg-warning",
    error: "bg-destructive",
    offline: "bg-muted-foreground",
  };

  const statusGlow = {
    healthy: "shadow-[0_0_10px_hsl(156,100%,50%,0.5)]",
    warning: "shadow-[0_0_10px_hsl(38,92%,50%,0.5)]",
    error: "shadow-[0_0_10px_hsl(0,84%,60%,0.5)]",
    offline: "",
  };

  return (
    <motion.div
      className={`glass-panel p-4 relative overflow-hidden ${isRunning ? "glow-border" : ""
        }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {/* Status indicator */}
      <motion.div
        className={`absolute top-3 right-3 w-2 h-2 rounded-full ${statusColors[status]} ${statusGlow[status]}`}
        animate={isRunning ? { scale: [1, 1.2, 1] } : {}}
        transition={{ repeat: Infinity, duration: 2 }}
      />

      <div className="flex items-start gap-3">
        <div
          className={`p-2 rounded-lg ${isRunning ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
            }`}
        >
          <Icon className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-orbitron font-semibold text-sm truncate">{name}</h3>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {description}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-muted-foreground">
              :{port}
            </span>
            <span
              className={`text-xs px-1.5 py-0.5 rounded ${isRunning
                ? "bg-primary/20 text-primary"
                : "bg-muted text-muted-foreground"
                }`}
            >
              {isRunning ? "ACTIVE" : "STOPPED"}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            {onSummon && !isRunning && (
              <button
                onClick={onSummon}
                className="px-2 py-1 text-[10px] font-orbitron font-bold tracking-wider text-primary border border-primary/30 rounded hover:bg-primary/20 transition-colors shadow-[0_0_10px_rgba(16,185,129,0.2)]"
              >
                SUMMON
              </button>
            )}
            <Switch
              checked={isRunning}
              onCheckedChange={onToggle}
              className="data-[state=checked]:bg-primary"
            />
          </div>

          {onRebuild && (
            <button
              onClick={onRebuild}
              className="px-2 py-0.5 text-[10px] font-mono text-muted-foreground hover:text-primary border border-transparent hover:border-primary/20 rounded transition-all uppercase tracking-wider"
            >
              REBUILD
            </button>
          )}
          {onDelete && !isRunning && (
            <button
              onClick={onDelete}
              className="px-2 py-0.5 text-[10px] font-mono text-red-500 border border-red-500/20 hover:bg-red-500/10 rounded transition-all uppercase tracking-wider"
            >
              DELETE
            </button>
          )}
        </div>
      </div>

      {/* Animated border effect when running */}
      {isRunning && (
        <motion.div
          className="absolute inset-0 border border-primary/20 rounded-lg pointer-events-none"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: 2 }}
        />
      )}
    </motion.div>
  );
};
