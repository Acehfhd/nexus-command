import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "online" | "offline" | "warning" | "error" | "processing";
  label?: string;
  showPulse?: boolean;
  size?: "sm" | "md" | "lg";
}

export const StatusBadge = ({
  status,
  label,
  showPulse = true,
  size = "md",
}: StatusBadgeProps) => {
  const statusConfig = {
    online: {
      color: "bg-primary",
      text: "text-primary",
      glow: "shadow-[0_0_10px_hsl(156,100%,50%,0.5)]",
      label: label || "ONLINE",
    },
    offline: {
      color: "bg-muted-foreground",
      text: "text-muted-foreground",
      glow: "",
      label: label || "OFFLINE",
    },
    warning: {
      color: "bg-warning",
      text: "text-warning",
      glow: "shadow-[0_0_10px_hsl(38,92%,50%,0.5)]",
      label: label || "WARNING",
    },
    error: {
      color: "bg-destructive",
      text: "text-destructive",
      glow: "shadow-[0_0_10px_hsl(0,84%,60%,0.5)]",
      label: label || "ERROR",
    },
    processing: {
      color: "bg-secondary",
      text: "text-secondary",
      glow: "shadow-[0_0_10px_hsl(187,100%,50%,0.5)]",
      label: label || "PROCESSING",
    },
  };

  const sizeConfig = {
    sm: { dot: "w-1.5 h-1.5", text: "text-[10px]", gap: "gap-1", px: "px-1.5 py-0.5" },
    md: { dot: "w-2 h-2", text: "text-xs", gap: "gap-1.5", px: "px-2 py-1" },
    lg: { dot: "w-2.5 h-2.5", text: "text-sm", gap: "gap-2", px: "px-3 py-1.5" },
  };

  const config = statusConfig[status];
  const sizeStyles = sizeConfig[size];

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full bg-muted/50",
        sizeStyles.gap,
        sizeStyles.px
      )}
    >
      <div className="relative">
        <motion.div
          className={cn(
            "rounded-full",
            sizeStyles.dot,
            config.color,
            config.glow
          )}
          animate={
            showPulse && status !== "offline"
              ? { scale: [1, 1.2, 1], opacity: [1, 0.8, 1] }
              : {}
          }
          transition={{ repeat: Infinity, duration: 2 }}
        />
      </div>
      <span className={cn("font-orbitron font-medium", sizeStyles.text, config.text)}>
        {config.label}
      </span>
    </div>
  );
};
