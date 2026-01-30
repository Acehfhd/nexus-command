import { motion } from "framer-motion";

interface CircularGaugeProps {
  value: number;
  max: number;
  label: string;
  unit?: string;
  size?: number;
  strokeWidth?: number;
  color?: "primary" | "secondary" | "warning" | "destructive";
}

export const CircularGauge = ({
  value,
  max,
  label,
  unit = "",
  size = 120,
  strokeWidth = 8,
  color = "primary",
}: CircularGaugeProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min((value / max) * 100, 100);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const colorClasses = {
    primary: "stroke-primary",
    secondary: "stroke-secondary",
    warning: "stroke-warning",
    destructive: "stroke-destructive",
  };

  const glowColors = {
    primary: "drop-shadow-[0_0_10px_hsl(156,100%,50%,0.5)]",
    secondary: "drop-shadow-[0_0_10px_hsl(187,100%,50%,0.5)]",
    warning: "drop-shadow-[0_0_10px_hsl(38,92%,50%,0.5)]",
    destructive: "drop-shadow-[0_0_10px_hsl(0,84%,60%,0.5)]",
  };

  return (
    <div className="relative flex flex-col items-center">
      <svg
        width={size}
        height={size}
        className={`-rotate-90 ${glowColors[color]}`}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          className="opacity-30"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className={colorClasses[color]}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-xl font-bold font-orbitron text-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {value}
          {unit && <span className="text-sm text-muted-foreground ml-0.5">{unit}</span>}
        </motion.span>
        <span className="text-xs text-muted-foreground mt-1">{label}</span>
      </div>
    </div>
  );
};
