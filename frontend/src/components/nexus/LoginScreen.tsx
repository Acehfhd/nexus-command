import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Lock, Wifi, Server, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface LoginScreenProps {
  onLogin: () => void;
}

export const LoginScreen = ({ onLogin }: LoginScreenProps) => {
  const [password, setPassword] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setTimeout(() => {
      onLogin();
    }, 1500);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-background grid-bg flex items-center justify-center"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 text-[20vw] font-orbitron font-black text-primary/5 select-none"
          animate={{ opacity: [0.03, 0.08, 0.03] }}
          transition={{ repeat: Infinity, duration: 4 }}
        >
          NEXUS
        </motion.div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[150px]" />
      </div>

      {/* Login Panel */}
      <motion.div
        className="relative glass-panel glow-border p-8 w-full max-w-md mx-4"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            className="w-16 h-16 mx-auto mb-4 rounded-xl bg-primary/20 flex items-center justify-center glow-border"
            animate={{ boxShadow: ["0 0 20px hsl(156,100%,50%,0.3)", "0 0 40px hsl(156,100%,50%,0.5)", "0 0 20px hsl(156,100%,50%,0.3)"] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Shield className="w-8 h-8 text-primary" />
          </motion.div>
          <h1 className="font-orbitron text-2xl font-bold neon-text">CENTRAL COMMAND</h1>
          <p className="text-sm text-muted-foreground mt-2">Authentication Required</p>
        </div>

        {/* Status Indicators */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {[
            { icon: Server, label: "Hardware", status: "Verified" },
            { icon: Wifi, label: "Connection", status: "Secure" },
            { icon: Zap, label: "Latency", status: "0.8ms" },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              className="p-2 rounded bg-muted/30 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
            >
              <item.icon className="w-4 h-4 mx-auto text-primary mb-1" />
              <div className="text-[10px] text-muted-foreground">{item.label}</div>
              <div className="text-xs text-primary font-mono">{item.status}</div>
            </motion.div>
          ))}
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="password"
              placeholder="Enter access code..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 bg-background/50 border-border font-mono"
              autoFocus
            />
          </div>
          <Button
            type="submit"
            className="w-full font-orbitron gap-2"
            disabled={isAuthenticating}
          >
            {isAuthenticating ? (
              <motion.div
                className="flex items-center gap-2"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
              >
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                AUTHENTICATING...
              </motion.div>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                INITIALIZE ACCESS
              </>
            )}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-6">
          NEXUS OS v1.0 • Secure Terminal
        </p>
      </motion.div>
    </motion.div>
  );
};
