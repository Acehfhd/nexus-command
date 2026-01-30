import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { NexusLayout } from "@/components/nexus/NexusLayout";
import { LoginScreen } from "@/components/nexus/LoginScreen";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import MissionControl from "./pages/MissionControl";
import { Intelligence } from "./pages/Intelligence";
import Memory from "./pages/Memory";
import Factory from "./pages/Factory";
import TradingFloor from "./pages/TradingFloor";
import Erebus from "./pages/Erebus";
import Workflow from "./pages/Workflow";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AnimatePresence mode="wait">
              {!isAuthenticated && (
                <LoginScreen onLogin={() => setIsAuthenticated(true)} />
              )}
            </AnimatePresence>
            {isAuthenticated && (
              <NexusLayout>
                <Routes>
                  <Route path="/" element={<MissionControl />} />
                  <Route path="/intelligence" element={<Intelligence />} />
                  <Route path="/memory" element={<Memory />} />
                  <Route path="/factory" element={<Factory />} />
                  <Route path="/trading" element={<TradingFloor />} />
                  <Route path="/erebus" element={<Erebus />} />
                  <Route path="/workflow" element={<Workflow />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </NexusLayout>
            )}
          </BrowserRouter>
        </TooltipProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  );
};

export default App;
