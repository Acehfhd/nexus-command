import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Newspaper,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  Search,
  Bitcoin,
  Users,
  Terminal,
  Bell,
} from "lucide-react";
import { GlowingCard } from "@/components/nexus/GlowingCard";
import { StatusBadge } from "@/components/nexus/StatusBadge";
import { Input } from "@/components/ui/input";
import { useIntelligence, IntelligenceEvent } from "@/hooks/useIntelligence";
import { useTickets } from "@/hooks/useTickets";

interface Alert {
  id: string;
  type: "crypto" | "leads" | "system" | "logs";
  level: "success" | "warning" | "error" | "info";
  title: string;
  message: string;
  timestamp: string;
}

const mockAlerts: Alert[] = [
  { id: "1", type: "crypto", level: "success", title: "BTC Breakout Detected", message: "Price crossed 20 DMA with volume spike", timestamp: "2 min ago" },
  { id: "2", type: "leads", level: "info", title: "New Lead Captured", message: "techstartup.io - High intent signals detected", timestamp: "5 min ago" },
  { id: "3", type: "system", level: "warning", title: "VRAM Threshold", message: "Usage at 89% - consider batch optimization", timestamp: "12 min ago" },
  { id: "4", type: "crypto", level: "info", title: "Whale Movement", message: "500 BTC moved from Binance to cold storage", timestamp: "18 min ago" },
  { id: "5", type: "logs", level: "success", title: "Workflow Complete", message: "lead-gen-v2 executed successfully - 47 leads", timestamp: "25 min ago" },
  { id: "6", type: "system", level: "success", title: "Backup Complete", message: "Daily snapshot saved to NAS", timestamp: "1 hour ago" },
  { id: "7", type: "crypto", level: "warning", title: "Market Volatility", message: "Fear & Greed Index dropped to 32", timestamp: "1 hour ago" },
  { id: "8", type: "leads", level: "info", title: "Outreach Sent", message: "12 personalized emails dispatched", timestamp: "2 hours ago" },
];

const filterOptions = ["All Activity", "Crypto", "Leads", "System", "Logs"];

const Intelligence = () => {
  const [activeFilter, setActiveFilter] = useState("All Activity");
  const [searchQuery, setSearchQuery] = useState("");

  // Real events & tickets
  const { events, stats, loading } = useIntelligence(10000);
  const { tickets, updateTicket } = useTickets();

  const pendingTickets = tickets?.filter(t => t.status !== "resolved");

  const filteredAlerts = (events || []).filter((alert) => {
    const matchesFilter = activeFilter === "All Activity" || alert.type.toLowerCase() === activeFilter.toLowerCase();
    const matchesSearch = alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const typeIcons: Record<string, any> = {
    crypto: Bitcoin,
    leads: Users,
    system: Terminal,
    logs: Bell,
    architect: Terminal, // Fallback for architect events
  };

  const levelColors = {
    success: "border-l-primary",
    warning: "border-l-warning",
    error: "border-l-destructive",
    info: "border-l-secondary",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-orbitron font-bold neon-text-secondary">Intelligence</h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time Activity Stream & Alerts</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status="processing" label="LIVE FEED" />
          <span className="text-xs text-muted-foreground">{filteredAlerts.length} events</span>
        </div>
      </motion.div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-muted-foreground" />
          {filterOptions.map((filter) => (
            <motion.button
              key={filter}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${activeFilter === filter
                ? "bg-primary/20 text-primary border border-primary/30"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
                }`}
              onClick={() => setActiveFilter(filter)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {filter}
            </motion.button>
          ))}
        </div>
        <div className="relative flex-1 max-w-sm ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search alerts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted/50 border-border"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GlowingCard>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-orbitron font-bold">{stats?.signalsToday || 0}</div>
              <div className="text-xs text-muted-foreground">Events Today</div>
            </div>
          </div>
        </GlowingCard>
        <GlowingCard glowColor="secondary">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary/20">
              <Bell className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <div className="text-2xl font-orbitron font-bold">{pendingTickets?.length || 0}</div>
              <div className="text-xs text-muted-foreground">Active Incidents</div>
            </div>
          </div>
        </GlowingCard>
        <GlowingCard glowColor="warning">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/20">
              <AlertTriangle className="w-5 h-5 text-warning" />
            </div>
            <div>
              <div className="text-2xl font-orbitron font-bold">{stats?.warnings || 0}</div>
              <div className="text-xs text-muted-foreground">Warnings</div>
            </div>
          </div>
        </GlowingCard>
        <GlowingCard>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <CheckCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-orbitron font-bold">{stats?.uptime || 'N/A'}</div>
              <div className="text-xs text-muted-foreground">Uptime</div>
            </div>
          </div>
        </GlowingCard>
      </div>

      {/* 🎟️ Active Incidents (Terry System) */}
      {pendingTickets && pendingTickets.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-orbitron text-lg flex items-center gap-2 text-warning">
            <AlertTriangle className="w-5 h-5" />
            Active Incident Tickets
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingTickets.map((ticket) => (
              <motion.div
                key={ticket.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-panel p-4 border-l-4 border-warning bg-warning/5 relative"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-warning/20 text-warning">
                    {ticket.severity}
                  </span>
                  <span className="text-[9px] text-muted-foreground uppercase">{ticket.source}</span>
                </div>
                <h3 className="text-sm font-semibold mb-1">Incident Record</h3>
                <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{ticket.description}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateTicket(ticket.id, { status: "investigating" })}
                    disabled={ticket.status === "investigating"}
                    className="flex-1 text-[10px] py-1 rounded bg-secondary/20 hover:bg-secondary/30 transition-colors"
                  >
                    INVESTIGATE
                  </button>
                  <button
                    onClick={() => updateTicket(ticket.id, { status: "resolved" })}
                    className="flex-1 text-[10px] py-1 rounded bg-primary/20 hover:bg-primary/30 text-primary transition-colors"
                  >
                    RESOLVE
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Activity Feed */}
      <div className="space-y-3">
        <h2 className="font-orbitron text-lg flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-secondary" />
          Activity Stream
        </h2>
        <AnimatePresence>
          {filteredAlerts.map((alert, index) => {
            const Icon = typeIcons[alert.type.toLowerCase()] || typeIcons.logs; // Fallback to logs icon
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className={`glass-panel p-4 border-l-4 ${levelColors[alert.level] || "border-l-primary"} hover:bg-muted/30 transition-colors cursor-pointer`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${alert.level === "success" ? "bg-primary/20 text-primary" :
                    alert.level === "warning" ? "bg-warning/20 text-warning" :
                      alert.level === "error" ? "bg-destructive/20 text-destructive" :
                        "bg-secondary/20 text-secondary"
                    }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-sm">{alert.title}</h3>
                      <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                        {alert.type}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{alert.message}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                    <Clock className="w-3 h-3" />
                    {alert.timestamp}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export { Intelligence };
