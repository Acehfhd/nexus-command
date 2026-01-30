import { motion } from "framer-motion";
import { useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Newspaper,
  Brain,
  Palette,
  TrendingUp,
  FlaskConical,
  Workflow,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Activity,
  User,
  Shield,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { AgentChat } from "./AgentChat";

const navItems = [
  { icon: LayoutDashboard, label: "Mission Control", path: "/" },
  { icon: Newspaper, label: "Intelligence", path: "/intelligence" },
  { icon: Brain, label: "Memory", path: "/memory" },
  { icon: Palette, label: "The Factory", path: "/factory" },
  { icon: TrendingUp, label: "Trading Floor", path: "/trading" },
  { icon: FlaskConical, label: "Erebus Sandbox", path: "/erebus" },
  { icon: Workflow, label: "Workflow", path: "/workflow" },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export const NexusSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  return (
    <motion.aside
      className="h-screen bg-sidebar border-r border-sidebar-border flex flex-col relative"
      animate={{ width: isCollapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-3">
          <motion.div
            className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center glow-border"
            whileHover={{ scale: 1.05 }}
          >
            <span className="font-orbitron font-bold text-primary text-lg">N</span>
          </motion.div>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h1 className="font-orbitron font-bold text-lg neon-text">NEXUS</h1>
              <p className="text-[10px] text-muted-foreground -mt-1">OS v1.0</p>
            </motion.div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path}>
              <motion.div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative",
                  isActive
                    ? "bg-primary/20 text-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                {isActive && (
                  <motion.div
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full"
                    layoutId="activeIndicator"
                  />
                )}
                <item.icon className={cn("w-5 h-5 shrink-0", isActive && "drop-shadow-[0_0_8px_hsl(156,100%,50%)]")} />
                {!isCollapsed && (
                  <motion.span
                    className="text-sm font-medium truncate"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* AI Chatbox Trigger */}
      <div className="p-2 border-t border-sidebar-border">
        <AgentChat isCollapsed={isCollapsed} />
      </div>

      {/* System Status Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <User className="w-4 h-4 text-muted-foreground" />
            </div>
            <motion.div
              className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-primary rounded-full border-2 border-sidebar"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Activity className="w-3 h-3 text-primary" />
                <span className="text-xs text-muted-foreground">SYS.LOAD</span>
              </div>
              <div className="text-xs font-orbitron text-primary">OPTIMAL</div>
            </div>
          )}
        </div>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-sidebar border border-sidebar-border flex items-center justify-center hover:bg-sidebar-accent transition-colors z-10"
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
    </motion.aside>
  );
};
