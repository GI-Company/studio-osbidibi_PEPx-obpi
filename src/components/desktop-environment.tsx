"use client";

import type * as React from 'react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Globe, TerminalSquare, XIcon } from 'lucide-react';
import { MiniBrowser } from './mini-browser';
import { Separator } from './ui/separator';

interface DesktopEnvironmentProps {
  isOpen: boolean;
  onClose: () => void;
}

type ActiveApp = 'browser' | 'terminal' | null;

export function DesktopEnvironment({ isOpen, onClose }: DesktopEnvironmentProps) {
  const [activeApp, setActiveApp] = useState<ActiveApp>(null);
  const [showWelcome, setShowWelcome] = useState(true);

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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleDialogClose(); }}>
      <DialogContent className="max-w-none w-[95vw] h-[90vh] md:w-[90vw] md:h-[85vh] flex flex-col p-0 glassmorphic !bg-background/70">
        <DialogHeader className="p-4 border-b border-primary/20 flex-row items-center justify-between space-y-0">
          <DialogTitle className="text-lg font-semibold radiant-text">BinaryBlocksphere Desktop Environment</DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" onClick={handleDialogClose} aria-label="Close Desktop">
              <XIcon className="w-5 h-5" />
            </Button>
          </DialogClose>
        </DialogHeader>

        <div className="flex flex-grow min-h-0">
          {/* App Launcher / Dock */}
          <div className="w-20 p-3 border-r border-primary/20 flex flex-col items-center space-y-4 bg-black/20">
            <Button 
              variant="ghost" 
              size="lg"
              className="flex flex-col items-center justify-center h-auto p-2 space-y-1 text-foreground hover:bg-primary/20"
              onClick={() => openApp('browser')}
              aria-label="Launch Web Browser"
              data-ai-hint="web browser"
            >
              <Globe className="w-8 h-8 text-accent" />
              <span className="text-xs">Browser</span>
            </Button>
            <Button 
              variant="ghost" 
              size="lg" 
              className="flex flex-col items-center justify-center h-auto p-2 space-y-1 text-foreground hover:bg-primary/20"
              onClick={() => openApp('terminal')}
              aria-label="Launch Terminal (Placeholder)"
              data-ai-hint="command line"
            >
              <TerminalSquare className="w-8 h-8 text-accent" />
              <span className="text-xs">Terminal</span>
            </Button>
          </div>

          {/* App Display Area */}
          <div className="flex-grow p-4 overflow-auto bg-background/30 relative">
            {showWelcome && activeApp === null && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <h2 className="text-2xl font-semibold text-foreground radiant-text">Welcome to GDE</h2>
                <p className="text-muted-foreground">Select an application from the dock to launch it.</p>
              </div>
            )}

            {activeApp && (
                 <div className="absolute inset-0 flex flex-col p-1">
                    <div className="flex items-center justify-between p-2 mb-2 rounded-t-md bg-secondary/50">
                        <span className="font-medium text-foreground">
                            {activeApp === 'browser' ? 'Web Browser' : 'Terminal'}
                        </span>
                        <Button variant="ghost" size="icon" onClick={closeApp} aria-label="Close App">
                            <XIcon className="w-4 h-4" />
                        </Button>
                    </div>
                    <div className="flex-grow overflow-hidden rounded-b-md bg-card">
                        {activeApp === 'browser' && <MiniBrowser />}
                        {activeApp === 'terminal' && (
                            <div className="flex items-center justify-center h-full p-4">
                                <p className="text-muted-foreground">Terminal application placeholder. <br/>The main terminal is available outside the GDE.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
          </div>
        </div>
        <Separator className="my-0 bg-primary/20" />
         <DialogDescription className="p-2 text-xs text-center text-muted-foreground/70">
            BinaryBlocksphere GDE v0.2-alpha. Applications run in a sandboxed environment.
          </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
