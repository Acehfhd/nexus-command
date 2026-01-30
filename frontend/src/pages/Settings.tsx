import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Settings as SettingsIcon,
  User,
  Shield,
  Cpu,
  Network,
  Save,
  RotateCcw,
  Volume2,
  Eye,
  Lock,
  Wifi,
  Server,
  Check,
  X,
  Loader2,
  Wallet,
  Plus,
  Trash2,
  Brain,
  MessageSquareCode,
  GraduationCap,
  Microscope,
  Paintbrush,
  Sparkles,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { GlowingCard } from "@/components/nexus/GlowingCard";
import { StatusBadge } from "@/components/nexus/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useHealth } from "@/hooks/useHealth";
import { useMetrics } from "@/hooks/useMetrics";
import { useContainers } from "@/hooks/useContainers";
import { getWallets, saveWallets, WalletEntry, ChainType } from "@/hooks/useWalletBalances";


import { useConfig } from "@/hooks/useConfig";

const Settings = () => {
  // Use the central config hook
  const { config, updateConfig, isLoading: configLoading } = useConfig();

  // Local UI state mapping (for instant feedback before save)
  const [localhostLock, setLocalhostLock] = useState(true);
  const [vpnTunneling, setVpnTunneling] = useState(false);
  const [vramLimit, setVramLimit] = useState([14]);

  const { health, loading: healthLoading, refresh } = useHealth(15000);
  const { metrics } = useMetrics(10000);
  const { containers, startContainer, stopContainer } = useContainers(5000);

  // Sync from config when loaded
  useEffect(() => {
    if (config?.net_sec) {
      setLocalhostLock(config.net_sec.localhost_lock ?? true);
      setVpnTunneling(config.net_sec.vpn_tunneling ?? false);
    }
  }, [config]);

  // Use values from config with fallbacks to ensure object types
  const themeConfig = config.theme || { background: "cyberpunk", effects: "high", neon: true };
  const councilConfig = config.council || { homework: "deepseek-r1:14b", coding: "qwen/qwen-3-coder-480b-instruct:free", research: "google/gemini-2.0-flash-exp:free" };

  // Derived state updates (Council)
  const handleCouncilChange = (role: string, model: string) => {
    const newCouncil = { ...councilConfig, [role]: model };
    updateConfig({ council: newCouncil });
  };

  // Derived state updates (Theme)
  const handleThemeChange = (key: string, value: any) => {
    const newTheme = { ...themeConfig, [key]: value };
    // Local storage for immediate boot
    localStorage.setItem('nexus_theme_config', JSON.stringify(newTheme));
    updateConfig({ theme: newTheme });
  };

  // Connection Modal State
  const [isConnectionModalOpen, setIsConnectionModalOpen] = useState(false);
  const [newConnection, setNewConnection] = useState({ name: "", endpoint: "", key: "" });
  const [connections, setConnections] = useState([
    { name: "Ollama", endpoint: "nexus-ollama:11434", key: "Ollama" },
    { name: "ComfyUI", endpoint: "nexus-comfyui:8188", key: "ComfyUI" },
    { name: "n8n", endpoint: "nexus-n8n:5678", key: "n8n" },
  ]);

  const handleAddConnection = () => {
    if (newConnection.name && newConnection.endpoint) {
      setConnections([...connections, { ...newConnection, key: newConnection.name }]);
      setNewConnection({ name: "", endpoint: "", key: "" });
      setIsConnectionModalOpen(false);
      // Persist to config
      updateConfig({ connections: [...connections, { ...newConnection, key: newConnection.name }] });
    }
  };

  // Dynamic wallet list
  const [wallets, setWallets] = useState<WalletEntry[]>(getWallets());
  const [walletSaved, setWalletSaved] = useState(false);
  const [newChain, setNewChain] = useState<ChainType>('sol');
  const [newAddress, setNewAddress] = useState('');

  const handleSaveWallets = () => {
    saveWallets(wallets);
    setWalletSaved(true);
    setTimeout(() => setWalletSaved(false), 2000);
  };

  const handleAddWallet = () => {
    if (!newAddress.trim()) return;
    const newWallet: WalletEntry = { id: Date.now().toString(), chain: newChain, address: newAddress.trim() };
    setWallets([...wallets, newWallet]);
    setNewAddress('');
  };

  const handleRemoveWallet = (id: string) => {
    setWallets(wallets.filter(w => w.id !== id));
  };

  const handleUpdateWallet = (id: string, address: string) => {
    setWallets(wallets.map(w => w.id === id ? { ...w, address } : w));
  };

  const handleSaveConfig = async () => {
    // Trigger manual save if needed, though updateConfig handles it
    // This button can now be a "Force Sync" or "Save All"
    alert('Config synced!');
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
            <span className="neon-text">Settings</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">System Configuration & Preferences</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2" onClick={refresh} disabled={healthLoading}>
            {healthLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
            Refresh Stats
          </Button>
          <Button className="gap-2 font-orbitron" onClick={handleSaveConfig}>
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Identity Module */}
        <GlowingCard>
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-primary" />
            <h3 className="font-orbitron text-sm">Identity Module</h3>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Profile Alias</label>
              <Input defaultValue="Agent Zero" className="bg-background/50" />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Voice Synthesis Model</label>
              <Select defaultValue="eleven-v2">
                <SelectTrigger className="bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="eleven-v2">ElevenLabs v2</SelectItem>
                  <SelectItem value="coqui">Coqui TTS</SelectItem>
                  <SelectItem value="bark">Bark</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Avatar Rendering Style</label>
              <Select defaultValue="cyberpunk">
                <SelectTrigger className="bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cyberpunk">Cyberpunk</SelectItem>
                  <SelectItem value="minimal">Minimal</SelectItem>
                  <SelectItem value="hologram">Hologram</SelectItem>
                  <SelectItem value="realistic">Realistic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </GlowingCard>

        {/* Theme Module */}
        <GlowingCard>
          <div className="flex items-center gap-2 mb-4">
            <Paintbrush className="w-5 h-5 text-primary" />
            <h3 className="font-orbitron text-sm">Theme Matrix</h3>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground flex items-center gap-2">
                <Sparkles className="w-3 h-3" /> Background Reality
              </label>
              <Select value={themeConfig.background} onValueChange={(v) => handleThemeChange('background', v)}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cyberpunk">Cyberpunk Default</SelectItem>
                  <SelectItem value="oled">OLED Black</SelectItem>
                  <SelectItem value="matrix">Matrix Rain</SelectItem>
                  <SelectItem value="nebula">Deep Nebula</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Visual Fidelity</label>
              <Select value={themeConfig.effects} onValueChange={(v) => handleThemeChange('effects', v)}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">Glassmorphism (Ultra)</SelectItem>
                  <SelectItem value="medium">Balanced</SelectItem>
                  <SelectItem value="low">Solid (Performance)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <div className="text-sm">Neon Glows</div>
              </div>
              <Switch checked={themeConfig.neon} onCheckedChange={(v) => handleThemeChange('neon', v)} />
            </div>
          </div>
        </GlowingCard>

        {/* Net_Sec_Protocols */}
        <GlowingCard glowColor="destructive">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-destructive" />
            <h3 className="font-orbitron text-sm">Net_Sec_Protocols</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-muted-foreground" />
                <div>
                  <div className="text-sm">Localhost Lock</div>
                  <div className="text-xs text-muted-foreground">Restrict all connections to localhost</div>
                </div>
              </div>
              <Switch checked={localhostLock} onCheckedChange={setLocalhostLock} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4 text-muted-foreground" />
                <div>
                  <div className="text-sm">VPN Tunneling</div>
                  <div className="text-xs text-muted-foreground">Route traffic through secure tunnel</div>
                </div>
              </div>
              <Switch checked={vpnTunneling} onCheckedChange={setVpnTunneling} />
            </div>
            <div className="p-3 rounded-lg bg-muted/30 border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Password Hash Rotation</span>
                <StatusBadge status="online" label="ENABLED" size="sm" />
              </div>
              <div className="text-xs text-muted-foreground">Last rotation: 2 hours ago</div>
            </div>
          </div>
        </GlowingCard>

        {/* Hardware Registry */}
        <GlowingCard glowColor="secondary">
          <div className="flex items-center gap-2 mb-4">
            <Cpu className="w-5 h-5 text-secondary" />
            <h3 className="font-orbitron text-sm">Hardware Registry</h3>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-muted/30">
                <div className="text-xs text-muted-foreground mb-1">CPU</div>
                <div className="text-sm font-orbitron">
                  {metrics?.cpu.cores ? `${metrics.cpu.cores} Cores` : 'Loading...'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {metrics?.cpu.usage_percent ? `${metrics.cpu.usage_percent.toFixed(0)}% Usage` : ''}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-muted/30">
                <div className="text-xs text-muted-foreground mb-1">GPU</div>
                <div className="text-sm font-orbitron">
                  {metrics?.gpu.available
                    ? (metrics.gpu.vendor === 'amd' ? 'AMD GPU' : 'NVIDIA')
                    : 'N/A'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {metrics?.gpu.vram_total_gb ? `${metrics.gpu.vram_total_gb.toFixed(0)}GB VRAM` : ''}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-muted-foreground">VRAM Safety Limit</label>
                <span className="text-xs font-orbitron text-primary">{vramLimit[0]} GB</span>
              </div>
              <Slider
                value={vramLimit}
                onValueChange={setVramLimit}
                max={16}
                min={8}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        </GlowingCard>



        {/* API Uplinks */}
        <GlowingCard>
          <div className="flex items-center gap-2 mb-4">
            <Network className="w-5 h-5 text-primary" />
            <h3 className="font-orbitron text-sm">API Uplinks</h3>
          </div>
          <div className="space-y-3">
            {connections.map((api) => (
              <motion.div
                key={api.name}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center gap-3">
                  <Server className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">{api.name}</div>
                    <div className="text-xs text-muted-foreground font-mono">{api.endpoint}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge
                    status={health?.services[api.key] || "offline"}
                    size="sm"
                  />
                  <button className="p-1.5 rounded hover:bg-muted">
                    <SettingsIcon className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </motion.div>
            ))}

            <Dialog open={isConnectionModalOpen} onOpenChange={setIsConnectionModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full gap-2 mt-2">
                  <Plus className="w-4 h-4" />
                  Add New Connection
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-panel border-primary/20">
                <DialogHeader>
                  <DialogTitle className="font-orbitron text-primary">Add API Connection</DialogTitle>
                  <DialogDescription>
                    Connect an external service or MCP to the Nexus Dashboard.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Service Name</Label>
                    <Input
                      placeholder="e.g. OpenRouter"
                      value={newConnection.name}
                      onChange={(e) => setNewConnection({ ...newConnection, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Endpoint URL</Label>
                    <Input
                      placeholder="https://openrouter.ai/api/v1"
                      value={newConnection.endpoint}
                      onChange={(e) => setNewConnection({ ...newConnection, endpoint: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>API Key (Optional)</Label>
                    <Input
                      type="password"
                      placeholder="sk-or-..."
                      value={newConnection.key}
                      onChange={(e) => setNewConnection({ ...newConnection, key: e.target.value })}
                    />
                    <p className="text-[10px] text-muted-foreground">Keys are stored locally in browser session.</p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsConnectionModalOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddConnection}>Connect</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </GlowingCard>

        {/* Wallet Addresses */}
        <GlowingCard glowColor="warning">
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="w-5 h-5 text-warning" />
            <h3 className="font-orbitron text-sm">Wallet Addresses</h3>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {wallets.map((wallet) => (
              <div key={wallet.id} className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-10 uppercase">{wallet.chain}</span>
                <Input
                  value={wallet.address}
                  onChange={(e) => handleUpdateWallet(wallet.id, e.target.value)}
                  className="bg-background/50 font-mono text-xs flex-1"
                />
                <Button variant="ghost" size="sm" onClick={() => handleRemoveWallet(wallet.id)} className="p-1 h-8 w-8">
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>

          {/* Add new wallet */}
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
            <Select value={newChain} onValueChange={(v) => setNewChain(v as ChainType)}>
              <SelectTrigger className="w-20 bg-background/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sol">SOL</SelectItem>
                <SelectItem value="eth">ETH</SelectItem>
                <SelectItem value="btc">BTC</SelectItem>
              </SelectContent>
            </Select>
            <Input
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              className="bg-background/50 font-mono text-xs flex-1"
              placeholder="Enter wallet address..."
            />
            <Button variant="outline" size="sm" onClick={handleAddWallet} className="gap-1">
              <Plus className="w-4 h-4" /> Add
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2 mt-3"
            onClick={handleSaveWallets}
          >
            {walletSaved ? <Check className="w-4 h-4 text-primary" /> : <Save className="w-4 h-4" />}
            {walletSaved ? 'Saved!' : 'Save All Wallets'}
          </Button>
        </GlowingCard>
      </div>
    </div>
  );
};

export default Settings;
