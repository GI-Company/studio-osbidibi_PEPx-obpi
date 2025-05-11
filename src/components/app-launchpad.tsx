
"use client";
import type * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { XIcon, Globe, TerminalSquare, HardDrive, Layers3, Lightbulb, Grid3X3 } from 'lucide-react';

interface AppInfo {
  id: string;
  name: string;
  icon: React.ElementType;
  action: () => void;
  dataAiHint?: string;
}

interface AppLaunchpadProps {
  isOpen: boolean;
  onClose: () => void;
  apps: AppInfo[]; // Apps to display, passed from DesktopEnvironment
}

export function AppLaunchpad({ isOpen, onClose, apps }: AppLaunchpadProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-2xl w-[90vw] md:w-[60vw] h-auto max-h-[80vh] flex flex-col p-0 glassmorphic !bg-card/80 backdrop-blur-xl">
        <DialogHeader className="p-4 border-b border-primary/20 flex-row items-center justify-between space-y-0">
          <div className="flex items-center">
            <Grid3X3 className="w-6 h-6 mr-2 text-primary" />
            <DialogTitle className="text-lg font-semibold radiant-text">Application Launchpad</DialogTitle>
          </div>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close Launchpad" className="button-3d-interactive">
              <XIcon className="w-5 h-5" />
            </Button>
          </DialogClose>
        </DialogHeader>
        <div className="flex-grow p-6 overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {apps.map((app) => (
              <Button
                key={app.id}
                variant="ghost"
                className="flex flex-col items-center justify-center h-32 p-4 space-y-2 text-foreground hover:bg-primary/20 button-3d-interactive glassmorphic !bg-card/50 hover:!bg-primary/30"
                onClick={() => {
                  app.action();
                  onClose(); // Close launchpad after launching app
                }}
                aria-label={`Launch ${app.name}`}
                data-ai-hint={app.dataAiHint || app.name.toLowerCase()}
              >
                <app.icon className="w-12 h-12 text-accent" />
                <span className="text-sm text-center radiant-text">{app.name}</span>
              </Button>
            ))}
          </div>
        </div>
        <DialogDescription className="p-3 text-xs text-center text-muted-foreground/70 radiant-text border-t border-primary/20">
          Click an application to launch it in the GDE.
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
