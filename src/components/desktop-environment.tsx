
"use client";

import type * as React from 'react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Globe, TerminalSquare, XIcon, HardDrive, Layers3, Lightbulb, PanelLeftOpen, PanelRightOpen, LayoutGrid } from 'lucide-react';
import { MiniBrowser } from './mini-browser';
import { Separator } from './ui/separator';
import { VirtualPartitionApp } from './virtual-partition-app';
import { PixelStoreApp } from './pixel-store-app';
import { CodingAssistantApp } from './coding-assistant-app';
import { AppLaunchpad } from './app-launchpad'; // New Launchpad

interface DesktopEnvironmentProps {
  isOpen: boolean;
  onClose: () => void;
}

type ActiveApp = 'browser' | 'terminal' | 'virtualPartition' | 'pixelStore' | 'codingAssistant' | null;

export function DesktopEnvironment({ isOpen, onClose }: DesktopEnvironmentProps) {
  const [activeApp, setActiveApp] = useState<ActiveApp>(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [isDockVisible, setIsDockVisible] = useState(true);
  const [isLaunchpadOpen, setIsLaunchpadOpen] = useState(false);

  const appsList = [
    { id: 'browser', name: 'Browser', icon: Globe, action: () => openApp('browser'), dataAiHint: "web browser" },
    { id: 'terminal', name: 'Terminal', icon: TerminalSquare, action: () => openApp('terminal'), dataAiHint: "command line" },
    { id: 'virtualPartition', name: 'V-Partition', icon: HardDrive, action: () => openApp('virtualPartition'), dataAiHint: "virtual machine disk" },
    { id: 'pixelStore', name: 'PixelStore', icon: Layers3, action: () => openApp('pixelStore'), dataAiHint: "data storage concept" },
    { id: 'codingAssistant', name: 'AI Assist', icon: Lightbulb, action: () => openApp('codingAssistant'), dataAiHint: "AI assistant code" },
  ];

  const openApp = (app: ActiveApp) => {
    setActiveApp(app);
    setShowWelcome(false);
  };

  const closeApp = () => {
    setActiveApp(null);
    setShowWelcome(true);
  };

  const handleDialogClose = () => {
    closeApp();
    onClose();
  };

  const getAppTitle = () => {
    switch (activeApp) {
      case 'browser': return 'Web Browser';
      case 'terminal': return 'Terminal';
      case 'virtualPartition': return 'Virtual Partition Environment';
      case 'pixelStore': return 'BBS PixelStore Interface';
      case 'codingAssistant': return 'AI Coding Assistant / Chat';
      default: return '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleDialogClose(); }}>
      <DialogContent className="max-w-none w-[95vw] h-[90vh] md:w-[90vw] md:h-[85vh] flex flex-col p-0 glassmorphic !bg-card/80 backdrop-blur-xl">
        <DialogHeader className="p-4 border-b border-primary/20 flex-row items-center justify-between space-y-0">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" onClick={() => setIsDockVisible(!isDockVisible)} className="button-3d-interactive" aria-label={isDockVisible ? "Hide Dock" : "Show Dock"}>
                {isDockVisible ? <PanelLeftOpen className="w-5 h-5"/> : <PanelRightOpen className="w-5 h-5"/>}
            </Button>
             <Button variant="ghost" size="icon" onClick={() => setIsLaunchpadOpen(true)} className="button-3d-interactive" aria-label="Open Launchpad">
                <LayoutGrid className="w-5 h-5"/>
            </Button>
            <DialogTitle className="text-lg font-semibold radiant-text">BinaryBlocksphere Desktop Environment</DialogTitle>
          </div>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" onClick={handleDialogClose} aria-label="Close Desktop" className="button-3d-interactive">
              <XIcon className="w-5 h-5" />
            </Button>
          </DialogClose>
        </DialogHeader>

        <div className="flex flex-grow min-h-0">
          {/* App Launcher / Dock - Draggable/repositionable is a conceptual future enhancement. */}
          {isDockVisible && (
            <div className="w-20 p-3 border-r border-primary/20 flex flex-col items-center space-y-4 bg-black/30 overflow-y-auto transition-all duration-300 ease-in-out">
              {appsList.map(app => (
                 <Button 
                    key={app.id}
                    variant="ghost" 
                    size="lg"
                    className="flex flex-col items-center justify-center h-auto p-2 space-y-1 text-foreground hover:bg-primary/20 button-3d-interactive"
                    onClick={app.action}
                    aria-label={`Launch ${app.name}`}
                    data-ai-hint={app.dataAiHint}
                  >
                    <app.icon className="w-8 h-8 text-accent" />
                    <span className="text-xs radiant-text">{app.name}</span>
                  </Button>
              ))}
            </div>
          )}

          {/* App Display Area */}
          <div className="flex-grow p-4 overflow-auto bg-background/50 relative">
            {showWelcome && activeApp === null && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <h2 className="text-2xl font-semibold text-foreground radiant-text">Welcome to GDE</h2>
                <p className="text-muted-foreground radiant-text">Select an application from the dock or launchpad.</p>
              </div>
            )}

            {activeApp && (
                 <div className="absolute inset-0 flex flex-col p-1">
                    <div className="flex items-center justify-between p-2 mb-2 rounded-t-md bg-secondary/60">
                        <span className="font-medium text-foreground radiant-text">
                          {getAppTitle()}
                        </span>
                        <Button variant="ghost" size="icon" onClick={closeApp} aria-label="Close App" className="button-3d-interactive">
                            <XIcon className="w-4 h-4" />
                        </Button>
                    </div>
                    <div className="flex-grow overflow-hidden rounded-b-md bg-card">
                        {activeApp === 'browser' && <MiniBrowser />}
                        {activeApp === 'terminal' && (
                            <div className="flex items-center justify-center h-full p-4">
                                <p className="text-muted-foreground radiant-text">Terminal application placeholder. <br/>The main terminal is available outside the GDE.</p>
                            </div>
                        )}
                        {activeApp === 'virtualPartition' && <VirtualPartitionApp />}
                        {activeApp === 'pixelStore' && <PixelStoreApp />}
                        {activeApp === 'codingAssistant' && <CodingAssistantApp />}
                    </div>
                </div>
            )}
          </div>
        </div>
        <Separator className="my-0 bg-primary/20" />
         <DialogDescription className="p-2 text-xs text-center text-muted-foreground/70 radiant-text">
            BinaryBlocksphere GDE v0.6.0-alpha. AI Chat integrated. Dock can be hidden. Launchpad available.
          </DialogDescription>
      </DialogContent>
      <AppLaunchpad isOpen={isLaunchpadOpen} onClose={() => setIsLaunchpadOpen(false)} apps={appsList} />
    </Dialog>
  );
}
