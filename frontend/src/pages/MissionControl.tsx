import { motion } from "framer-motion";
import {
  Cpu,
  HardDrive,
  Thermometer,
  Clock,
  Wifi,
  Container,
  Brain,
  Image,
  GitBranch,
  Database,
  Loader2,
  Lock,
} from "lucide-react";
import { CircularGauge } from "@/components/nexus/CircularGauge";
import { PodCard } from "@/components/nexus/PodCard";
import { Terminal } from "@/components/nexus/Terminal";
import { GlowingCard } from "@/components/nexus/GlowingCard";
import { StatusBadge } from "@/components/nexus/StatusBadge";
import { useMetrics } from "@/hooks/useMetrics";
import { useContainers, Container as ContainerType } from "@/hooks/useContainers";
import { useState } from "react";
import { useSystemLogs } from "@/hooks/useSystemLogs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Map container names to display info
const containerConfig: Record<string, { displayName: string; description: string; icon: any; port: number }> = {
  // NEXUS (Core)
  "nexus-ollama": { displayName: "OLLAMA", description: "LLM Inference Engine", icon: Brain, port: 11434 },
  "nexus-comfyui": { displayName: "COMFYUI", description: "Image Synthesis", icon: Image, port: 8188 },
  "nexus-n8n": { displayName: "N8N", description: "Workflow Automation", icon: GitBranch, port: 5678 },
  "nexus-open-webui": { displayName: "OPEN WEBUI", description: "Chat Interface", icon: Brain, port: 8080 },
  "nexus-console": { displayName: "CONSOLE", description: "Control Center", icon: Container, port: 8090 },
  "nexus-postgres": { displayName: "POSTGRES", description: "Database Engine", icon: Database, port: 5432 },
  "nexus-mcp": { displayName: "MCP BRIDGE", description: "Tool Integrator", icon: Wifi, port: 0 },

  // MCPs (Agents/Tools)
  "nexus-obsidian": { displayName: "OBSIDIAN", description: "Vault RAG Bridge", icon: Brain, port: 0 },
  "nexus-net-sentry": { displayName: "NET SENTRY", description: "Network Monitor", icon: Wifi, port: 0 },
  "net-sentry": { displayName: "NET SENTRY", description: "Network Monitor", icon: Wifi, port: 0 }, // Fallback name

  // PODS (On-Demand)
  "connect-core": { displayName: "CORE BOT", description: "Trading & Logic", icon: Cpu, port: 0 },
  "connect-arcade": { displayName: "ARCADE", description: "Game Dev Env", icon: Container, port: 0 },
  "connect-forge": { displayName: "FORGE", description: "AI Training & Rust", icon: HardDrive, port: 0 },
  "connect-web": { displayName: "WEB LAB", description: "Full Stack Dev", icon: Wifi, port: 3000 },
  "connect-data": { displayName: "DATA LAB", description: "Jupyter & Analysis", icon: Database, port: 8888 },
  "connect-go": { displayName: "GO LAB", description: "Backend Engineering", icon: Container, port: 0 },
};

const NEXUS_SERVICES = ['nexus-console', 'nexus-ollama', 'nexus-n8n', 'nexus-postgres', 'nexus-mcp', 'nexus-open-webui', 'nexus-comfyui'];
const MCP_SERVICES = ['nexus-obsidian', 'nexus-net-sentry'];
const POD_SERVICES = ['connect-core', 'connect-arcade', 'connect-forge', 'connect-web', 'connect-data', 'connect-go'];

// Protected containers that cannot be stopped via UI
const PROTECTED_CONTAINERS = ['nexus-console', 'nexus-dashboard', 'nexus-postgres', 'nexus-n8n', 'nexus-ollama', 'nexus-mcp'];

const MissionControl = () => {
  const { metrics, loading: metricsLoading, error: metricsError } = useMetrics(5000); // Poll every 5s
  const { containers, loading: containersLoading, startContainer, stopContainer, rebuildContainer, deleteContainer } = useContainers(10000); // Poll every 10s

  const [selectedLogContainer, setSelectedLogContainer] = useState("nexus-ollama");
  const { logs: systemLogs } = useSystemLogs(selectedLogContainer, 5000, 20); // Poll selected container logs every 5s

  const activePods = containers.filter((c) => c.is_running).length;

  const handleToggle = async (container: ContainerType) => {
    if (container.is_running) {
      await stopContainer(container.name);
    } else {
      await startContainer(container.name);
    }
  };

  // Get GPU vendor label
  const gpuLabel = metrics?.gpu.available
    ? (metrics.gpu.vendor === 'amd' ? 'AMD GPU' : 'NVIDIA')
    : 'No GPU';

  // Temperature status
  const getTempStatus = (temp: number) => {
    if (temp < 60) return "Cool";
    if (temp < 75) return "Optimal";
    if (temp < 85) return "Warm";
    return "Hot!";
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-orbitron font-bold neon-text">Mission Control</h1>
          <p className="text-sm text-muted-foreground mt-1">System Overview & Pod Management</p>
        </div>
        <StatusBadge
          status={metricsError ? "error" : "online"}
          label={containersLoading ? "Loading..." : `${activePods}/${containers.length} PODS ACTIVE`}
          size="lg"
        />
      </motion.div>

      {/* Top Stats Row - REAL DATA */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlowingCard>
          <div className="flex items-center gap-4">
            {metricsLoading ? (
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            ) : (
              <CircularGauge
                value={metrics?.gpu.vram_used_gb || 0}
                max={metrics?.gpu.vram_total_gb || 16}
                label="VRAM"
                unit="GB"
                color="primary"
                size={80}
                strokeWidth={6}
              />
            )}
            <div>
              <div className="text-xs text-muted-foreground">GPU Memory</div>
              <div className="font-orbitron text-lg">{gpuLabel}</div>
              <div className="text-xs text-primary">
                {metrics?.gpu.available ? `${metrics.gpu.vram_percent}% Utilized` : 'N/A'}
              </div>
            </div>
          </div>
        </GlowingCard>

        <GlowingCard glowColor="secondary">
          <div className="flex items-center gap-4">
            <CircularGauge
              value={metrics?.gpu.usage_percent || 0}
              max={100}
              label="GPU"
              unit="%"
              color="secondary"
              size={80}
              strokeWidth={6}
            />
            <div>
              <div className="text-xs text-muted-foreground">GPU Load</div>
              <div className="font-orbitron text-lg">
                {metrics?.gpu.usage_percent ? (metrics.gpu.usage_percent > 50 ? 'Active' : 'Idle') : 'N/A'}
              </div>
              <div className="text-xs text-secondary">
                {metrics?.gpu.available ? (metrics.gpu.usage_percent > 0 ? 'Processing' : 'Ready') : 'Unavailable'}
              </div>
            </div>
          </div>
        </GlowingCard>

        <GlowingCard>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-warning/20">
              <Thermometer className="w-8 h-8 text-warning" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Temperature</div>
              <div className="font-orbitron text-2xl">
                {metrics?.gpu.temperature_c ? `${Math.round(metrics.gpu.temperature_c)}°C` : '--'}
              </div>
              <div className="text-xs text-primary">
                {metrics?.gpu.temperature_c ? getTempStatus(metrics.gpu.temperature_c) : 'N/A'}
              </div>
            </div>
          </div>
        </GlowingCard>

        <GlowingCard glowColor="secondary">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-secondary/20">
              <Clock className="w-8 h-8 text-secondary" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Uptime</div>
              <div className="font-orbitron text-2xl">{metrics?.uptime.formatted || '--:--:--'}</div>
              <div className="text-xs text-secondary">
                {metrics?.uptime.days ? `${metrics.uptime.days} Days Active` : 'Just Started'}
              </div>
            </div>
          </div>
        </GlowingCard>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Tabs defaultValue="nexus" className="w-full">
            <div className="flex items-center justify-between mb-4">
              <TabsList className="grid w-[300px] grid-cols-3">
                <TabsTrigger value="nexus" className="font-orbitron text-xs">NEXUS</TabsTrigger>
                <TabsTrigger value="mcp" className="font-orbitron text-xs">MCPs</TabsTrigger>
                <TabsTrigger value="pods" className="font-orbitron text-xs">PODS</TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Wifi className="w-4 h-4" />
                <span>localhost network</span>
              </div>
            </div>

            <TabsContent value="nexus" className="space-y-4">
              {/* NEXUS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {containersLoading ? (
                  <div className="col-span-2 flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : (
                  NEXUS_SERVICES.map((name, index) => {
                    const container = containers.find(c => c.name === name) || {
                      name,
                      image: 'unknown',
                      is_running: false,
                      status: 'offline',
                      ports: '',
                      created: ''
                    };

                    const config = containerConfig[name] || {
                      displayName: name.toUpperCase(),
                      description: 'Service',
                      icon: Container,
                      port: 0
                    };

                    const isProtected = PROTECTED_CONTAINERS.includes(name);

                    return (
                      <motion.div
                        key={name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="relative"
                      >
                        {isProtected && (
                          <div className="absolute top-2 right-2 z-10 flex items-center gap-1 text-xs text-muted-foreground bg-background/80 px-2 py-0.5 rounded">
                            <Lock className="w-3 h-3" />
                            <span>System</span>
                          </div>
                        )}
                        <PodCard
                          name={config.displayName}
                          description={config.description}
                          icon={config.icon}
                          port={config.port}
                          isRunning={container.is_running}
                          onToggle={isProtected ? undefined : () => handleToggle(container as ContainerType)}
                          onRebuild={isProtected ? undefined : () => rebuildContainer(name)}
                          onDelete={isProtected ? undefined : () => deleteContainer(name)}
                        />
                      </motion.div>
                    );
                  })
                )}
              </div>
            </TabsContent>

            <TabsContent value="mcp" className="space-y-4">
              {/* MCP GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {MCP_SERVICES.map((name, index) => {
                  const container = containers.find(c => c.name === name) || {
                    name,
                    image: 'unknown',
                    is_running: false,
                    status: 'offline',
                    ports: '',
                    created: ''
                  };

                  const config = containerConfig[name] || {
                    displayName: name.toUpperCase(),
                    description: 'MCP Tool',
                    icon: Brain,
                    port: 0
                  };

                  return (
                    <motion.div
                      key={name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <PodCard
                        name={config.displayName}
                        description={config.description}
                        icon={config.icon}
                        port={config.port}
                        isRunning={container.is_running}
                        onToggle={() => handleToggle(container as ContainerType)}
                        onRebuild={() => rebuildContainer(name)}
                        onDelete={() => deleteContainer(name)}
                        onSummon={() => handleToggle(container as ContainerType)}
                      />
                    </motion.div>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="pods" className="space-y-4">
              {/* PODS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Summon Button Header */}
                <div className="col-span-1 sm:col-span-2 flex justify-end">
                  {/* Placeholder for future Summon UI */}
                </div>

                {POD_SERVICES.map((name, index) => {
                  const container = containers.find(c => c.name === name) || {
                    name,
                    image: 'unknown',
                    is_running: false,
                    status: 'offline',
                    ports: '',
                    created: ''
                  };

                  const config = containerConfig[name] || {
                    displayName: name.toUpperCase(),
                    description: 'DevPod',
                    icon: Container,
                    port: 0
                  };

                  return (
                    <motion.div
                      key={name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <PodCard
                        name={config.displayName}
                        description={config.description}
                        icon={config.icon}
                        port={config.port}
                        isRunning={container.is_running}
                        onToggle={() => handleToggle(container as ContainerType)}
                        onRebuild={() => rebuildContainer(name)}
                        onDelete={() => deleteContainer(name)}
                        onSummon={() => handleToggle(container as ContainerType)}
                      />
                    </motion.div>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Stats & Gauges - REAL DATA */}
        <div className="space-y-4">
          <GlowingCard className="text-center">
            <h3 className="font-orbitron text-sm text-muted-foreground mb-4">System Performance</h3>
            <div className="flex justify-center gap-6">
              <CircularGauge
                value={metrics?.memory.used_gb || 0}
                max={metrics?.memory.total_gb || 32}
                label="RAM"
                unit="GB"
                color="secondary"
              />
              <CircularGauge
                value={metrics?.cpu.usage_percent || 0}
                max={100}
                label="CPU"
                unit="%"
                color="primary"
              />
            </div>
          </GlowingCard>

          <GlowingCard glowColor="secondary">
            <div className="space-y-3">
              <h3 className="font-orbitron text-sm text-muted-foreground">System Info</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">CPU Cores</span>
                  <span className="text-xs text-primary font-mono">{metrics?.cpu.cores || '--'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Total RAM</span>
                  <span className="text-xs text-secondary font-mono">{metrics?.memory.total_gb || '--'} GB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">GPU Vendor</span>
                  <span className="text-xs text-primary font-mono">{metrics?.gpu.vendor?.toUpperCase() || 'NONE'}</span>
                </div>
              </div>
            </div>
          </GlowingCard>
        </div>
      </div>

      {/* Terminal - Real Logs */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 className="font-orbitron text-sm text-muted-foreground">System Logs</h3>
          <div className="w-[200px]">
            <Select value={selectedLogContainer} onValueChange={setSelectedLogContainer}>
              <SelectTrigger className="h-8 text-xs font-mono bg-background/50 border-primary/20">
                <SelectValue placeholder="Select Container" />
              </SelectTrigger>
              <SelectContent>
                {containers.map((c) => (
                  <SelectItem key={c.name} value={c.name} className="text-xs font-mono">
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Terminal
          title={`NEXUS_MAIN://${selectedLogContainer.toUpperCase().replace('-', '_')}`}
          logs={systemLogs.length > 0 ? systemLogs : undefined}
          maxLines={20}
        />
      </div>
    </div>
  );
};

export default MissionControl;
