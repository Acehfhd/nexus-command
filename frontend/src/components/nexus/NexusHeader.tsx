import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Bell, Cpu, Thermometer, ExternalLink } from "lucide-react";
import { NodeSelector } from "./NodeSelector";
import { StatusBadge } from "./StatusBadge";
import { useMetrics } from "@/hooks/useMetrics";
import { useNavigate } from "react-router-dom";

export const NexusHeader = () => {
  const { metrics } = useMetrics(5000);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  // Mock notifications - in future could come from a real alerts hook
  const notifications = [
    { id: 1, type: "info", message: "System running normally", time: "2m ago" },
    { id: 2, type: "success", message: "ComfyUI ready", time: "5m ago" },
    { id: 3, type: "warning", message: "VRAM usage high", time: "10m ago" },
  ];

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-6 relative z-50">
      {/* Left - Branding */}
      <div className="flex items-center gap-4">
        <motion.div
          className="font-orbitron text-lg font-bold"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <span className="text-foreground">NEXUS OS</span>
          <span className="text-primary ml-2">v1.0</span>
        </motion.div>
        <StatusBadge status="online" label="SYSTEM ACTIVE" size="sm" />
      </div>

      {/* Center - Node Selector */}
      <div className="absolute left-1/2 -translate-x-1/2">
        <NodeSelector />
      </div>

      {/* Right - Agent Zero HUD */}
      <div className="flex items-center gap-4">
        {/* Quick Stats - REAL DATA */}
        <div className="hidden md:flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Cpu className="w-4 h-4 text-secondary" />
            <span>{metrics?.cpu.usage_percent?.toFixed(0) || '--'}%</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Thermometer className="w-4 h-4 text-warning" />
            <span>{metrics?.gpu.temperature_c ? `${Math.round(metrics.gpu.temperature_c)}°C` : '--'}</span>
          </div>
        </div>

        {/* Notifications - FUNCTIONAL DROPDOWN */}
        <div className="relative">
          <motion.button
            className="relative p-2 rounded-lg hover:bg-muted transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell className="w-5 h-5 text-muted-foreground" />
            <motion.div
              className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          </motion.button>

          {/* Dropdown */}
          <AnimatePresence>
            {showNotifications && (
              <>
                {/* Click-outside overlay */}
                <motion.div
                  className="fixed inset-0 z-40"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowNotifications(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute right-0 top-12 w-72 glass-panel border border-primary/20 rounded-lg shadow-xl z-50"
                >
                  <div className="p-3 border-b border-border">
                    <div className="flex items-center justify-between">
                      <span className="font-orbitron text-xs text-muted-foreground">NOTIFICATIONS</span>
                      <button
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                        onClick={() => { navigate('/intelligence'); setShowNotifications(false); }}
                      >
                        View All <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.map((notif) => (
                      <div key={notif.id} className="p-3 border-b border-border/50 hover:bg-muted/30 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <span className={`text-xs ${notif.type === 'warning' ? 'text-warning' :
                            notif.type === 'success' ? 'text-primary' : 'text-muted-foreground'
                            }`}>
                            {notif.message}
                          </span>
                          <span className="text-[10px] text-muted-foreground">{notif.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Agent Zero Avatar - CLICKABLE PROFILE */}
        <div className="relative">
          <motion.button
            className="flex items-center gap-3 glass-panel px-3 py-2 cursor-pointer"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate('/settings')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="relative">
              <motion.div
                className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center border border-primary/30"
                animate={{
                  boxShadow: [
                    "0 0 10px hsl(156, 100%, 50%, 0.2)",
                    "0 0 20px hsl(156, 100%, 50%, 0.4)",
                    "0 0 10px hsl(156, 100%, 50%, 0.2)",
                  ]
                }}
                transition={{ repeat: Infinity, duration: 3 }}
              >
                <User className="w-5 h-5 text-primary" />
              </motion.div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center text-[8px] font-bold text-primary-foreground">
                0
              </div>
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-sm font-orbitron">Agent Zero</div>
              <div className="text-[10px] text-muted-foreground">Click for Settings</div>
            </div>
          </motion.button>
        </div>
      </div>
    </header>
  );
};
