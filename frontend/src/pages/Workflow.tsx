import { useState, useEffect } from "react";
import { motion, Reorder } from "framer-motion";
import {
  Workflow as WorkflowIcon,
  Plus,
  Play,
  Pause,
  CheckCircle,
  Clock,
  AlertCircle,
  MoreHorizontal,
  Calendar,
  Zap,
  GitBranch,
  RefreshCw,
  Loader2,
  ExternalLink,
  Box,
} from "lucide-react";
import { GlowingCard } from "@/components/nexus/GlowingCard";
import { StatusBadge } from "@/components/nexus/StatusBadge";
import { Button } from "@/components/ui/button";
import { useN8n } from "@/hooks/useN8n";

interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  workflow?: string;
}

const initialTasks: Task[] = [
  { id: "1", title: "Lead Qualification Bot", description: "Auto-qualify leads from Apollo", status: "done", priority: "high", workflow: "lead-gen-v2" },
  { id: "2", title: "Daily Market Summary", description: "Generate crypto market report", status: "in_progress", priority: "medium", workflow: "market-watch" },
  { id: "3", title: "Website Screenshot Service", description: "Capture competitor sites", status: "in_progress", priority: "low", workflow: "scraper-v1" },
  { id: "4", title: "Email Outreach Campaign", description: "Personalized cold emails", status: "todo", priority: "high", workflow: "outreach-auto" },
  { id: "5", title: "Social Media Monitor", description: "Track brand mentions", status: "todo", priority: "medium" },
  { id: "6", title: "Invoice Generator", description: "Auto-create client invoices", status: "done", priority: "low", workflow: "billing" },
];

const ganttData = [
  { name: "lead-gen-v2", start: 0, duration: 4, color: "primary" },
  { name: "market-watch", start: 2, duration: 3, color: "secondary" },
  { name: "scraper-v1", start: 4, duration: 5, color: "warning" },
  { name: "outreach-auto", start: 6, duration: 4, color: "primary" },
];

const Workflow = () => {
  const [tasks, setTasks] = useState(initialTasks);
  const { workflows, loading, error, fetchWorkflows, triggerWorkflow } = useN8n();

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  const getTasksByStatus = (status: Task["status"]) => tasks.filter((t) => t.status === status);

  const handleTrigger = async (id: string) => {
    await triggerWorkflow(id);
    // Optionally refresh history or show notification
  };

  const priorityColors = {
    low: "bg-muted text-muted-foreground",
    medium: "bg-warning/20 text-warning",
    high: "bg-destructive/20 text-destructive",
  };

  const statusIcons = {
    todo: Clock,
    in_progress: RefreshCw,
    done: CheckCircle,
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
          <h1 className="text-2xl font-orbitron font-bold">
            <span className="neon-text">Workflow</span>
            <span className="text-foreground"> Hub</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Automation Control via n8n</p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={error ? "offline" : "online"} label={error ? "N8N ERROR" : "N8N CONNECTED"} />
          <Button className="gap-2 font-orbitron" onClick={() => window.open('http://localhost:5678', '_blank')}>
            <ExternalLink className="w-4 h-4" />
            Open n8n
          </Button>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GlowingCard>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-orbitron font-bold">{workflows.length}</div>
              <div className="text-xs text-muted-foreground">Workflows Found</div>
            </div>
          </div>
        </GlowingCard>
        <GlowingCard glowColor="secondary">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary/20">
              <Play className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <div className="text-2xl font-orbitron font-bold">
                {workflows.filter(w => w.active).length}
              </div>
              <div className="text-xs text-muted-foreground">Active Autonomously</div>
            </div>
          </div>
        </GlowingCard>
        <GlowingCard>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <CheckCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-orbitron font-bold">99.2%</div>
              <div className="text-xs text-muted-foreground">Success Rate</div>
            </div>
          </div>
        </GlowingCard>
        <GlowingCard glowColor="warning">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/20">
              <AlertCircle className="w-5 h-5 text-warning" />
            </div>
            <div>
              <div className="text-2xl font-orbitron font-bold">0</div>
              <div className="text-xs text-muted-foreground">System Alerts</div>
            </div>
          </div>
        </GlowingCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real n8n Workflows */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-orbitron text-sm flex items-center gap-2">
              <WorkflowIcon className="w-4 h-4 text-primary" />
              Live n8n Automation
            </h3>
            <Button variant="ghost" size="sm" onClick={fetchWorkflows} disabled={loading}>
              {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.open('http://localhost:5678', '_blank')} className="gap-2">
              <Plus className="w-3 h-3" /> Create Workflow
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {workflows.map((wf) => (
              <GlowingCard key={wf.id} glowColor={wf.active ? "primary" : "none"} className="relative">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-sm font-bold truncate pr-8">{wf.name}</h4>
                  <StatusBadge status={wf.active ? "online" : "offline"} />
                </div>
                <div className="flex items-center gap-4 mt-4">
                  <Button
                    size="sm"
                    className="flex-1 gap-2"
                    variant="secondary"
                    onClick={() => handleTrigger(wf.id)}
                  >
                    <Play className="w-3 h-3" /> Execute
                  </Button>
                  <Button size="sm" variant="outline" className="px-2" title="Settings">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </GlowingCard>
            ))}
            {workflows.length === 0 && !loading && (
              <div className="col-span-2 py-12 text-center glass-panel italic text-muted-foreground flex flex-col items-center gap-4">
                <Box className="w-12 h-12 text-muted-foreground/50" />
                <div>
                  <h3 className="font-bold text-lg mb-1">No Workflows Active</h3>
                  <p className="text-sm">Create a new agentic loop in n8n to see it here.</p>
                </div>
                <Button onClick={() => window.open('http://localhost:5678', '_blank')}>
                  Open Automation Editor
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Kanban Stand-in or Task List */}
        <div className="space-y-4">
          <h3 className="font-orbitron text-sm flex items-center gap-2">
            <Zap className="w-4 h-4 text-secondary" />
            Manual Tasks (Mock Data)
          </h3>
          <div className="space-y-2">
            {tasks.slice(0, 5).map((task) => (
              <div key={task.id} className="glass-panel p-3 border-l-2 border-primary">
                <div className="flex justify-between items-start text-xs mb-1">
                  <span className="font-bold">{task.title}</span>
                  <span className={`px-1 rounded text-[8px] ${priorityColors[task.priority]}`}>
                    {task.priority.toUpperCase()}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-tight">{task.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gantt Chart (Legacy visualization) */}
      <GlowingCard glowColor="secondary">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-orbitron text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4 text-secondary" />
            Agent Runtime Schedule (Mock Data)
          </h3>
        </div>
        <div className="space-y-2">
          {ganttData.map((item, index) => (
            <div key={item.name} className="flex items-center gap-2">
              <span className="w-24 text-xs text-muted-foreground truncate">{item.name}</span>
              <div className="flex-1 h-3 bg-muted/30 rounded relative">
                <div
                  className={`absolute h-full rounded ${item.color === "primary" ? "bg-primary/60" :
                    item.color === "secondary" ? "bg-secondary/60" :
                      "bg-warning/60"
                    }`}
                  style={{ left: `${(item.start / 12) * 100}%`, width: `${(item.duration / 12) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </GlowingCard>
    </div >
  );
};

export default Workflow;
