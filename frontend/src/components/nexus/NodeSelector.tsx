import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Server, Check } from "lucide-react";

interface Node {
  id: string;
  name: string;
  description: string;
  status: "online" | "offline" | "maintenance";
}

const nodes: Node[] = [
  { id: "nexus_main", name: "NEXUS_MAIN", description: "AMD 7900 GRE Primary", status: "online" },
  { id: "watchtower", name: "WATCHTOWER", description: "Monitoring Node", status: "online" },
  { id: "forge", name: "FORGE", description: "Training Cluster", status: "maintenance" },
];

export const NodeSelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState(nodes[0]);

  const statusColors = {
    online: "bg-primary",
    offline: "bg-muted-foreground",
    maintenance: "bg-warning",
  };

  return (
    <div className="relative">
      <motion.button
        className="flex items-center gap-2 px-3 py-2 glass-panel hover:bg-muted/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        whileTap={{ scale: 0.98 }}
      >
        <Server className="w-4 h-4 text-secondary" />
        <span className="font-orbitron text-sm">{selectedNode.name}</span>
        <div className={`w-2 h-2 rounded-full ${statusColors[selectedNode.status]}`} />
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              className="absolute top-full mt-2 right-0 z-50 w-64 glass-panel glow-border overflow-hidden"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {nodes.map((node) => (
                <motion.button
                  key={node.id}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left ${
                    selectedNode.id === node.id ? "bg-muted/30" : ""
                  }`}
                  onClick={() => {
                    setSelectedNode(node);
                    setIsOpen(false);
                  }}
                  whileHover={{ x: 4 }}
                >
                  <div className={`w-2 h-2 rounded-full ${statusColors[node.status]}`} />
                  <div className="flex-1">
                    <div className="font-orbitron text-sm">{node.name}</div>
                    <div className="text-xs text-muted-foreground">{node.description}</div>
                  </div>
                  {selectedNode.id === node.id && (
                    <Check className="w-4 h-4 text-primary" />
                  )}
                </motion.button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
