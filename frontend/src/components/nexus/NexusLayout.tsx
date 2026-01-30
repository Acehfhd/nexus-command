import { ReactNode } from "react";
import { NexusSidebar } from "./NexusSidebar";
import { NexusHeader } from "./NexusHeader";

interface NexusLayoutProps {
  children: ReactNode;
}

export const NexusLayout = ({ children }: NexusLayoutProps) => {
  return (
    <div className="min-h-screen flex w-full bg-background grid-bg relative">
      {/* Ambient glow effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-[100px]" />
      </div>

      {/* Sidebar */}
      <NexusSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <NexusHeader />
        <main className="flex-1 overflow-auto p-6 relative">
          {children}
        </main>
      </div>
    </div>
  );
};
