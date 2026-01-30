import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FolderOpen,
  Shield,
  Lock,
  FileCode,
  Cpu,
} from "lucide-react";
import { GlowingCard } from "@/components/nexus/GlowingCard";

const Erebus = () => {
  const [typedText, setTypedText] = useState("");
  const fullText = "EREBUS SANDBOX ENVIRONMENT // ISOLATED CONTAINMENT PROTOCOL ACTIVE";

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      setTypedText(fullText.slice(0, index));
      index++;
      if (index > fullText.length) clearInterval(timer);
    }, 50);
    return () => clearInterval(timer);
  }, []);

  const [files, setFiles] = useState<{ name: string, size: any, type: string }[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

  useEffect(() => {
    const fetchFiles = async () => {
      setLoadingFiles(true);
      try {
        const res = await fetch('http://localhost:8090/files?path=/workspace');
        const data = await res.json();
        if (data.entries) {
          setFiles(data.entries.map((e: any) => ({
            name: e.name,
            size: e.size > 0 ? (e.size / 1024).toFixed(1) + 'KB' : '-',
            type: e.type === 'directory' ? 'folder' : e.name.split('.').pop() || 'file'
          })));
        }
      } catch (e) {
        console.error("Failed to fetch files", e);
      } finally {
        setLoadingFiles(false);
      }
    };
    fetchFiles();
  }, []);

  const mockFiles = files.length > 0 ? files : [
    { name: "agent_core.py", size: "24KB", type: "python" },
    { name: "memory_bank_v1.json", size: "1.2MB", type: "json" },
    { name: "neural_config.yaml", size: "4KB", type: "yaml" },
    { name: "swarm_protocols.md", size: "12KB", type: "markdown" },
  ];

  const neuralThoughts = [
    { id: 1, type: "system", content: "Initializing neural pathways...", time: "00:00:01" },
    { id: 2, type: "thought", content: "Analyzing user intent patterns...", time: "00:00:05" },
    { id: 3, type: "action", content: "Simulating outcome probability: 98.4%", time: "00:00:12" },
    { id: 4, type: "system", content: "Sandbox containment verified secure.", time: "00:00:15" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-orbitron font-bold text-destructive flex items-center gap-3">
            <Shield className="w-8 h-8" />
            <span className="tracking-widest">EREBUS</span>
          </h1>
          <p className="text-sm font-mono text-destructive/70 mt-1 min-h-[20px]">
            {typedText}<span className="animate-pulse">_</span>
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded bg-destructive/10 border border-destructive/30 text-xs font-mono text-destructive">
          <Lock className="w-3 h-3" />
          SECURE ENVIRONMENT
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Terminal Area */}
        <div className="lg:col-span-2">
          <GlowingCard glowColor="destructive" className="h-[500px] flex flex-col font-mono text-sm bg-black/90 p-0 overflow-hidden border-destructive/30">
            {/* Terminal Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-destructive/20 bg-destructive/5">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
              </div>
              <div className="text-xs text-destructive/60">root@erebus-sandbox:~</div>
            </div>

            {/* Terminal Content */}
            <div className="flex-1 p-4 space-y-2 overflow-y-auto text-green-500/80">
              {neuralThoughts.map((log) => (
                <div key={log.id} className="flex gap-3">
                  <span className="text-destructive/50 text-xs">[{log.time}]</span>
                  <span className={log.type === 'system' ? 'text-blue-400' : log.type === 'action' ? 'text-yellow-400' : 'text-green-400'}>
                    {log.type === 'system' ? '>' : log.type === 'action' ? '$' : '#'} {log.content}
                  </span>
                </div>
              ))}
              <div className="flex gap-2 animate-pulse mt-4">
                <span className="text-destructive">$</span>
                <span className="w-2 h-5 bg-destructive/50 block"></span>
              </div>
            </div>
          </GlowingCard>
        </div>

        {/* Sidebar Tools - Mock for now */}
        <div className="space-y-4">
          {/* File Browser */}
          <GlowingCard>
            <h3 className="flex items-center gap-2 text-sm font-orbitron mb-4 text-muted-foreground">
              <FolderOpen className="w-4 h-4" /> Attached Files
            </h3>
            <div className="space-y-2">
              {mockFiles.map((file) => (
                <div key={file.name} className="flex items-center justify-between p-2 rounded bg-muted/20 border border-white/5 text-xs group hover:border-primary/30 transition-colors cursor-pointer">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-blue-400 group-hover:text-primary transition-colors" />
                    <span className="font-mono">{file.name}</span>
                  </div>
                  <span className="text-muted-foreground">{file.size}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-white/5 mt-2">
                <div className="text-[10px] text-center text-muted-foreground italic">
                  (Read-Only Access)
                </div>
              </div>
            </div>
          </GlowingCard>

          {/* Resource Usage */}
          <GlowingCard>
            <h3 className="flex items-center gap-2 text-sm font-orbitron mb-4 text-muted-foreground">
              <Cpu className="w-4 h-4" /> Container Load
            </h3>
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>vCPU</span>
                  <span>12%</span>
                </div>
                <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-[12%]" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>RAM</span>
                  <span>248MB / 4GB</span>
                </div>
                <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 w-[6%]" />
                </div>
              </div>
            </div>
          </GlowingCard>
        </div>
      </div>
    </div>
  );
};

export default Erebus;
