import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import {
  Palette,
  Wand2,
  ImageIcon,
  Download,
  Maximize2,
  Play,
  Square,
  Cpu,
  HardDrive,
  Zap,
  Settings,
  RefreshCw,
  Loader2,
  Upload,
  X,
  Trash2,
  Check,
  Ban,
  DownloadCloud,
} from "lucide-react";
import { GlowingCard } from "@/components/nexus/GlowingCard";
import { CircularGauge } from "@/components/nexus/CircularGauge";
import { StatusBadge } from "@/components/nexus/StatusBadge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useComfyUI } from "@/hooks/useComfyUI";
import { useMetrics } from "@/hooks/useMetrics";

// Utility: Resize image using canvas and trigger download
const resizeAndDownload = (img: HTMLImageElement, width: number, height: number, filename: string) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Draw image scaled to fit (may crop edges to fill exactly)
  const scale = Math.max(width / img.width, height / img.height);
  const x = (width - img.width * scale) / 2;
  const y = (height - img.height * scale) / 2;
  ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

  // Trigger download
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, 'image/png');
};

const Factory = () => {
  // Initialize state from localStorage directly to avoid race conditions
  const [prompt, setPrompt] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('nexus_factory_prompt') || "";
    }
    return "";
  });
  const [negativePrompt, setNegativePrompt] = useState("");
  const { metrics } = useMetrics(5000);

  const {
    generateImage,
    getQueue,
    queueStatus,
    loading,
    error,
    getHistory,
    getImageUrl,
    uploadImage
  } = useComfyUI();

  // Initialize history from localStorage
  const [historyImages, setHistoryImages] = useState<Array<{
    id: string,
    url: string,
    prompt: string,
    status?: 'pending' | 'accepted' | 'denied'
  }>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nexus_factory_history');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return [];
        }
      }
    }
    return [];
  });

  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [lastDeleted, setLastDeleted] = useState<any>(null);

  // Reference image for img2img
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [referenceFileName, setReferenceFileName] = useState<string>('');

  // Controls State
  const [selectedStyle, setSelectedStyle] = useState("cinematic");
  const [selectedAspect, setSelectedAspect] = useState("1:1");
  const [selectedModel, setSelectedModel] = useState("juggernaut_xl");
  const [selectedSteps, setSelectedSteps] = useState("30");

  // Refresh queue status periodically
  useEffect(() => {
    getQueue();
    const interval = setInterval(getQueue, 3000);
    return () => clearInterval(interval);
  }, [getQueue]);

  // Track mounted state to prevent polling after unmount
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  // Random cyberpunk/futuristic prompts for inspiration
  const RANDOM_PROMPTS = [
    "Neon-lit cyberpunk street market at midnight, holographic signs, rain reflections, blade runner aesthetic",
    "Futuristic AI datacenter with floating holographic displays, chrome and glass architecture, volumetric lighting",
    "Cybernetic warrior in tactical gear, neon blue accents, dystopian cityscape background",
    "Abandoned space station overgrown with bioluminescent plants, cosmic nebula visible through windows",
    "Neural interface hacker in VR goggles, streams of data flowing around them, matrix aesthetic",
    "Quantum computer core room with swirling energy patterns, scientists in hazmat suits observing",
    "Megacity skyline at sunset, flying vehicles, massive corporate towers with holographic advertisements",
    "Underground resistance base, makeshift tech equipment, rebels planning digital infiltration",
    "Alien artifact floating in zero gravity, ancient glyphs glowing, astronaut reaching toward it",
    "Biomechanical dragon hybrid, chrome scales, plasma breath, cyberpunk city as backdrop"
  ];

  const handleRandom = () => {
    const randomPrompt = RANDOM_PROMPTS[Math.floor(Math.random() * RANDOM_PROMPTS.length)];
    setPrompt(randomPrompt);
  };

  // Persist prompt to localStorage immediately on change
  useEffect(() => {
    localStorage.setItem('nexus_factory_prompt', prompt);
  }, [prompt]);

  const [referenceFile, setReferenceFile] = useState<File | null>(null);

  // Smart Mode State
  const [isSmartMode, setIsSmartMode] = useState(true);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    // Check if we have a reference image to upload first
    let uploadedImageName = undefined;
    if (referenceFile) {
      const name = await uploadImage(referenceFile);
      if (name) uploadedImageName = name;
    }

    if (isSmartMode) {
      // Smart Mode: Trigger n8n workflow (Qwen VL -> ComfyUI)
      try {
        // Create a temporary "queue" item to show UI feedback immediately
        const fakePromptId = `smart-${Date.now()}`;
        // We might need a way to track this in the UI if n8n takes time

        await fetch('/api/workflow/trigger', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workflow: 'smart-factory-v1', // The n8n workflow name/id
            payload: {
              prompt: prompt,
              negative_prompt: negativePrompt,
              model: selectedModel,
              steps: selectedSteps,
              aspect: selectedAspect,
              input_image: uploadedImageName, // Filename in ComfyUI input
              style: selectedStyle
            }
          })
        });

        // In a real implementation, we'd want to subscribe to the result
        // For now, let's start polling the history assuming n8n will eventually spawn a Comfy job
        // Or just wait for the output directory to update.
        // Let's rely on standard history polling.

      } catch (e) {
        console.error("Smart trigger failed", e);
      }
    } else {
      // Direct Mode: ComfyUI API
      const styledPrompt = `${prompt}, ${selectedStyle} style, high quality, 8k`;

      const result = await generateImage(styledPrompt, negativePrompt, {
        model: selectedModel,
        steps: selectedSteps,
        aspect: selectedAspect,
        inputImage: uploadedImageName
      });

      if (result && result.prompt_id) {
        startPolling(result.prompt_id);
      }
    }
  };

  const startPolling = (promptId: string) => {
    let attempts = 0;
    const maxAttempts = 60; // 1 minute timeout

    const poll = async () => {
      if (attempts >= maxAttempts || !isMountedRef.current) return;
      attempts++;

      const history = await getHistory(promptId);

      // Check if history exists AND has actual image data in outputs
      const hasImages = history?.outputs && Object.values(history.outputs).some(
        (nodeOutput: any) => nodeOutput.images && nodeOutput.images.length > 0
      );

      if (hasImages) {
        // Found it! Extract images
        const collectedImages: Array<any> = [];
        Object.values(history.outputs).forEach((nodeOutput: any) => {
          if (nodeOutput.images) {
            nodeOutput.images.forEach((img: any) => {
              collectedImages.push({
                url: getImageUrl(img.filename, img.subfolder, img.type),
                prompt: prompt,
                asset_id: img.asset_id,
                asset_status: img.asset_status
              });
            });
          }
        });

        if (collectedImages.length > 0) {
          // Map new images to the expected structure using backend IDs
          const newImages = collectedImages.map((img) => ({
            id: img.asset_id || crypto.randomUUID(), // Use persistent ID from backend
            url: img.url,
            prompt: img.prompt,
            status: img.asset_status || 'pending'
          }));

          setHistoryImages(prev => {
            // Deduplicate based on ID to be safe
            const existingIds = new Set(prev.map(p => p.id));
            const uniqueNew = newImages.filter(n => !existingIds.has(n.id));

            if (uniqueNew.length === 0) return prev;

            const updated = [...uniqueNew, ...prev].slice(0, 50);
            localStorage.setItem('nexus_factory_history', JSON.stringify(updated));
            return updated;
          });
        }
      } else {
        // Keep polling
        setTimeout(poll, 1000);
      }
    };

    setTimeout(poll, 1000);
  };

  const refreshHistory = async () => {
    // This is a simplified history fetch. Ideally we'd map prompt IDs to their results.
    // For now, let's just say we'll fetch the last few history items if possible.
    // In a real app, you'd use a WebSocket or poll /history
  };

  const isGenerating = loading || (queueStatus?.queue_running || 0) > 0;

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
            <span className="text-foreground">The </span>
            <span className="neon-text">Factory</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Image Synthesis via ComfyUI</p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={isGenerating ? "processing" : "online"} label={isGenerating ? "GENERATING" : "READY"} />
          <Button variant="outline" size="sm" className="gap-2">
            <Settings className="w-4 h-4" />
            ComfyUI
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Prompt & Controls */}
        <div className="lg:col-span-2 space-y-4">
          {/* Prompt Input */}
          <GlowingCard className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-orbitron text-sm flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-primary" />
                Prompt Command
              </h2>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-2 py-1 rounded bg-background/30 border border-white/5">
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${isSmartMode ? "text-primary" : "text-muted-foreground"}`}>Smart Mode</span>
                  <Switch
                    checked={isSmartMode}
                    onCheckedChange={setIsSmartMode}
                    className="data-[state=checked]:bg-primary h-4 w-7"
                    thumbClassName="h-3 w-3 translate-x-0.5 data-[state=checked]:translate-x-3.5"
                  />
                </div>
                <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={handleRandom}>
                  <RefreshCw className="w-3 h-3" />
                  Random
                </Button>
              </div>
            </div>
            <Textarea
              placeholder="Enter your image generation prompt..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px] bg-background/50 border-border resize-none font-mono text-sm"
            />

            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Negative Prompt</label>
              <Textarea
                placeholder="What to exclude..."
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                className="min-h-[60px] bg-background/50 border-border resize-none font-mono text-sm"
              />
            </div>

            {/* Reference Image Upload (for img2img) */}
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground flex items-center gap-2">
                <Upload className="w-3 h-3" />
                Reference Image (Optional - for img2img)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  id="reference-upload"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setReferenceFile(file);
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        setReferenceImage(event.target?.result as string);
                        setReferenceFileName(file.name);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-xs"
                  onClick={() => document.getElementById('reference-upload')?.click()}
                >
                  <Upload className="w-3 h-3" />
                  {referenceImage ? 'Change Image' : 'Upload Image'}
                </Button>
                {referenceImage && (
                  <div className="flex items-center gap-2 flex-1">
                    <img
                      src={referenceImage}
                      alt="Reference"
                      className="w-12 h-12 object-cover rounded border border-primary/30"
                    />
                    <span className="text-xs text-muted-foreground truncate flex-1">
                      {referenceFileName}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 h-6 w-6"
                      onClick={() => {
                        setReferenceImage(null);
                        setReferenceFileName('');
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Controls Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Style</label>
                <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cinematic">Cinematic</SelectItem>
                    <SelectItem value="anime">Anime</SelectItem>
                    <SelectItem value="photorealistic">Photorealistic</SelectItem>
                    <SelectItem value="abstract">Abstract</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Aspect</label>
                <Select value={selectedAspect} onValueChange={setSelectedAspect}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1:1">1:1 Square</SelectItem>
                    <SelectItem value="16:9">16:9 Wide</SelectItem>
                    <SelectItem value="9:16">9:16 Portrait</SelectItem>
                    <SelectItem value="4:3">4:3 Standard</SelectItem>
                    <SelectItem value="dex-logo">DexScreener Logo (512x512)</SelectItem>
                    <SelectItem value="dex-banner">DexScreener Banner (1200x400)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Model</label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="juggernaut_xl">Juggernaut XL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Steps</label>
                <Select value={selectedSteps} onValueChange={setSelectedSteps}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="20">20 Steps</SelectItem>
                    <SelectItem value="30">30 Steps</SelectItem>
                    <SelectItem value="50">50 Steps</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Generate Button */}
            <motion.button
              className={`w-full py-3 rounded-lg font-orbitron font-semibold flex items-center justify-center gap-2 transition-all ${isGenerating
                ? "bg-secondary/20 text-secondary border border-secondary/30"
                : "bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30"
                }`}
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              whileHover={{ scale: isGenerating ? 1 : 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {queueStatus && queueStatus.queue_pending > 0
                    ? `Queue Position: ${queueStatus.queue_pending}`
                    : "Synthesizing..."}
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  SYNTHESIZE
                </>
              )}
            </motion.button>
            {error && <p className="text-xs text-destructive mt-2">{error}</p>}
          </GlowingCard>

          {/* Output Gallery */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-orbitron text-sm flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-secondary" />
                Output Stream
              </h2>
              <span className="text-xs text-muted-foreground">{historyImages.length} images</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {historyImages.length === 0 ? (
                <div className="col-span-4 py-12 text-center glass-panel rounded-lg">
                  <ImageIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-20" />
                  <p className="text-xs text-muted-foreground">No images generated yet</p>
                </div>
              ) : (
                historyImages.map((img, index) => (
                  <motion.div
                    key={img.id || index}
                    className={`relative group aspect-square rounded-lg overflow-hidden glass-panel border border-white/5 ${img.status === 'denied' ? 'opacity-40 grayscale pointer-events-none' : ''
                      } ${img.status === 'pending' ? 'ring-1 ring-primary/30' : ''}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setSelectedImage(img)}
                  >
                    <img
                      src={img.url}
                      alt={img.prompt}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />

                    {/* Status Indicator */}
                    {img.status === 'pending' && (
                      <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 text-[10px] text-primary font-orbitron">
                        PENDING
                      </div>
                    )}

                    {/* Hover Overlay - Management Cluster */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-between">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const a = document.createElement('a');
                            a.href = img.url;
                            a.download = `nexus-${img.id || 'gen'}.png`;
                            a.click();
                            toast.success("Download started");
                          }}
                          className="p-1.5 rounded bg-black/50 hover:bg-white/20 text-white/70 hover:text-white transition-all backdrop-blur-md border border-white/10"
                          title="Download"
                        >
                          <DownloadCloud className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            const deletedImg = historyImages[index];

                            try {
                              // Call backend to purge
                              if (deletedImg.id) {
                                await fetch(`/api/factory/assets/${deletedImg.id}`, { method: 'DELETE' });
                              }

                              const newHistory = historyImages.filter((_, i) => i !== index);
                              setHistoryImages(newHistory);
                              localStorage.setItem('nexus_factory_history', JSON.stringify(newHistory));
                              toast.success("Asset purged from disk and database");
                            } catch (err) {
                              console.error("Purge failed", err);
                              toast.error("Failed to purge asset");
                            }
                          }}
                          className="p-1.5 rounded bg-black/50 hover:bg-red-500/80 text-white/70 hover:text-white transition-all backdrop-blur-md border border-white/10"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="space-y-2">
                        <p className="text-[10px] text-white/80 line-clamp-2 leading-tight">{img.prompt}</p>

                        {/* Accept/Deny Buttons */}
                        {img.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                try {
                                  if (img.id) {
                                    await fetch(`/api/factory/assets/${img.id}/accept`, { method: 'POST' });
                                  }
                                  const newHistory = [...historyImages];
                                  newHistory[index].status = 'accepted';
                                  setHistoryImages(newHistory);
                                  localStorage.setItem('nexus_factory_history', JSON.stringify(newHistory));
                                  toast.success("Asset Accepted & Secured");
                                } catch (err) {
                                  console.error("Accept failed", err);
                                  toast.error("Failed to secure asset");
                                }
                              }}
                              className="flex-1 py-1 rounded bg-primary/20 hover:bg-primary/40 text-primary text-[10px] font-orbitron border border-primary/30 transition-all flex items-center justify-center gap-1"
                            >
                              <Check className="w-3 h-3" />
                              ACCEPT
                            </button>
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                try {
                                  if (img.id) {
                                    await fetch(`/api/factory/assets/${img.id}`, { method: 'DELETE' });
                                  }
                                  const newHistory = historyImages.filter((_, i) => i !== index);
                                  setHistoryImages(newHistory);
                                  localStorage.setItem('nexus_factory_history', JSON.stringify(newHistory));
                                  toast("Asset Denied", { description: "Purged from volatile storage" });
                                } catch (err) {
                                  console.error("Deny failed", err);
                                }
                              }}
                              className="flex-1 py-1 rounded bg-black/40 hover:bg-red-500/20 text-white/60 hover:text-red-400 text-[10px] font-orbitron border border-white/10 hover:border-red-400/30 transition-all flex items-center justify-center gap-1"
                            >
                              <Ban className="w-3 h-3" />
                              DENY
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Lightbox Modal */}
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black/90 backdrop-blur-2xl border-white/10">
            <DialogHeader className="p-4 border-b border-white/5 flex flex-row items-center justify-between">
              <div>
                <DialogTitle className="text-sm font-orbitron text-primary">Asset Inspection</DialogTitle>
                <p className="text-[10px] text-muted-foreground mt-1">ID: {selectedImage?.id}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs gap-2"
                  onClick={() => {
                    const a = document.createElement('a');
                    a.href = selectedImage.url;
                    a.download = `nexus-full-${selectedImage.id}.png`;
                    a.click();
                  }}
                >
                  <Download className="w-3.5 h-3.5" /> High-Res
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setSelectedImage(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </DialogHeader>
            <div className="relative aspect-video bg-black flex items-center justify-center">
              <img
                src={selectedImage?.url}
                className="max-w-full max-h-[70vh] object-contain"
                alt="High res preview"
              />
            </div>
            <div className="p-6 bg-white/5">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Prompt Command</h4>
              <p className="text-sm text-white/90 leading-relaxed font-mono bg-black/30 p-4 rounded-lg border border-white/5">
                {selectedImage?.prompt}
              </p>
            </div>
          </DialogContent>
        </Dialog>

        {/* Right Column - System Resources */}
        <div className="space-y-4">
          <GlowingCard glowColor="secondary">
            <h3 className="font-orbitron text-sm text-muted-foreground mb-4">System Resources</h3>
            <div className="flex justify-center gap-4">
              <CircularGauge
                value={metrics?.cpu.usage_percent || 0}
                max={100}
                label="CPU"
                unit="%"
                color="secondary"
                size={90}
                strokeWidth={6}
              />
              <CircularGauge
                value={metrics?.gpu.vram_used_gb || 0}
                max={metrics?.gpu.vram_total_gb || 16}
                label="VRAM"
                unit="GB"
                color="primary"
                size={90}
                strokeWidth={6}
              />
            </div>
          </GlowingCard>

          <GlowingCard>
            <h3 className="font-orbitron text-sm text-muted-foreground mb-3">Queue Status</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Pending</span>
                <span className="text-xs text-primary font-mono">
                  {queueStatus?.queue_pending || 0} jobs
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Processing</span>
                <span className="text-xs text-secondary font-mono">
                  {queueStatus?.queue_running || 0} active
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">GPU Temperature</span>
                <span className="text-xs text-primary font-mono">
                  {metrics?.gpu.temperature_c ? `${metrics.gpu.temperature_c}°C` : 'N/A'}
                </span>
              </div>
            </div>
          </GlowingCard>

          <GlowingCard>
            <h3 className="font-orbitron text-sm text-muted-foreground mb-3">🔧 Image Resizer</h3>
            <div className="space-y-3">
              <input
                type="file"
                accept="image/*"
                id="resizer-input"
                className="w-full text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-primary/20 file:text-primary hover:file:bg-primary/30 file:cursor-pointer cursor-pointer"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const img = new Image();
                      img.onload = () => {
                        // Store image for resizing
                        (window as any).__resizerImage = img;
                        (window as any).__resizerOriginalSize = `${img.width}x${img.height}`;
                        const sizeDisplay = document.getElementById('original-size');
                        if (sizeDisplay) sizeDisplay.textContent = `Original: ${img.width}x${img.height}`;
                      };
                      img.src = event.target?.result as string;
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
              <p id="original-size" className="text-[10px] text-muted-foreground">Upload an image to resize</p>

              {/* Preset Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    const img = (window as any).__resizerImage;
                    if (!img) return alert('Upload an image first');
                    resizeAndDownload(img, 512, 512, 'dex-logo-512x512.png');
                  }}
                >
                  DexScreener Logo
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    const img = (window as any).__resizerImage;
                    if (!img) return alert('Upload an image first');
                    resizeAndDownload(img, 1200, 400, 'dex-banner-1200x400.png');
                  }}
                >
                  DexScreener Banner
                </Button>
              </div>

              {/* Custom Size */}
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  placeholder="Width"
                  id="custom-width"
                  className="w-20 px-2 py-1 text-xs bg-black/50 border border-white/10 rounded"
                  defaultValue={1024}
                />
                <span className="text-xs text-muted-foreground">×</span>
                <input
                  type="number"
                  placeholder="Height"
                  id="custom-height"
                  className="w-20 px-2 py-1 text-xs bg-black/50 border border-white/10 rounded"
                  defaultValue={1024}
                />
                <Button
                  variant="secondary"
                  size="sm"
                  className="text-xs flex-1"
                  onClick={() => {
                    const img = (window as any).__resizerImage;
                    if (!img) return alert('Upload an image first');
                    const w = parseInt((document.getElementById('custom-width') as HTMLInputElement)?.value || '1024');
                    const h = parseInt((document.getElementById('custom-height') as HTMLInputElement)?.value || '1024');
                    resizeAndDownload(img, w, h, `resized-${w}x${h}.png`);
                  }}
                >
                  Resize
                </Button>
              </div>
            </div>
          </GlowingCard>

          <GlowingCard glowColor="warning">
            <h3 className="font-orbitron text-sm text-muted-foreground mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs opacity-50" disabled>
                <Palette className="w-4 h-4" />
                Print Shop (Coming Soon)
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs opacity-50" disabled>
                <Play className="w-4 h-4" />
                Video Stitcher (Coming Soon)
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs opacity-50" disabled>
                <Square className="w-4 h-4" />
                Batch Process (Coming Soon)
              </Button>
            </div>
          </GlowingCard>
        </div>
      </div>
    </div>
  );
};

export default Factory;
