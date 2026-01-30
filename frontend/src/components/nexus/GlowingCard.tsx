import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlowingCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: "primary" | "secondary" | "warning" | "destructive";
  hover?: boolean;
  animate?: boolean;
}

export const GlowingCard = ({
  children,
  className,
  glowColor = "primary",
  hover = true,
  animate = false,
}: GlowingCardProps) => {
  const glowClasses = {
    primary: "glow-border",
    secondary: "glow-border-secondary",
    warning: "border-warning/30 shadow-[0_0_10px_hsl(38,92%,50%,0.2)]",
    destructive: "border-destructive/30 shadow-[0_0_10px_hsl(0,84%,60%,0.2)]",
  };

  return (
    <motion.div
      className={cn(
        "glass-panel p-4",
        glowClasses[glowColor],
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { scale: 1.02, y: -2 } : undefined}
      transition={{ duration: 0.2 }}
    >
      {animate && (
        <motion.div
          className="absolute inset-0 rounded-lg pointer-events-none"
          style={{
            background: `linear-gradient(90deg, transparent, hsl(var(--${glowColor}) / 0.1), transparent)`,
          }}
          animate={{ x: ["-100%", "100%"] }}
          transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
        />
      )}
      {children}
    </motion.div>
  );
};
