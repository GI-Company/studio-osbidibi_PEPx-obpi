"use client";

import type * as React from 'react';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Globe, TerminalSquare, XIcon, HardDrive, Layers3, Lightbulb, PanelLeftOpen, PanelRightOpen, LayoutGrid, BotMessageSquare, LogOut } from 'lucide-react';
import { MiniBrowser } from './mini-browser';
import { Separator } from './ui/separator';
import { VirtualPartitionApp } from './virtual-partition-app';
import { PixelStoreApp } from './pixel-store-app';
import { CodingAssistantApp } from './coding-assistant-app';
import { AppLaunchpad } from './app-launchpad'; 
import { AgenticTerminalApp } from './agentic-terminal-app';
import { ShellEmulator } from './shell-emulator'; // For OSbidibi Shell
import { BinaryBlocksphereIcon } from '@/components/icons/BinaryBlocksphereIcon';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';

type ActiveApp = 'browser' | 'osbidibiShell' | 'virtualPartition' | 'pixelStore' | 'codingAssistant' | 'agenticTerminal' | null;

export function DesktopEnvironment() {
  const { currentUser, logout } = useAuth(); // Removed appMode as it's not directly used here
  const [activeApp, setActiveApp] = useState<ActiveApp>(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [isDockVisible, setIsDockVisible] = useState(true);
  const [isLaunchpadOpen, setIsLaunchpadOpen] = useState(false);

  const appsList = [
    { id: 'osbidibiShell', name: 'OSbidibi Shell', icon: TerminalSquare, action: () => openApp('osbidibiShell'), dataAiHint: "OS command line" },
    { id: 'browser', name: 'Browser', icon: Globe, action: () => openApp('browser'), dataAiHint: "web browser" },
    { id: 'agenticTerminal', name: 'Agent Terminal', icon: BotMessageSquare, action: () => openApp('agenticTerminal'), dataAiHint: "AI agent terminal" },
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

  const handleFullLogout = () => {
    closeApp(); 
    logout(); 
  };

  const getAppTitle = () => {
    switch (activeApp) {
      case 'browser': return 'Web Browser';
      case 'osbidibiShell': return 'OSbidibi-PEPX0.0.1 Shell (bidibi)';
      case 'virtualPartition': return 'Virtual Partition Environment';
      case 'pixelStore': return 'BBS PixelStore Interface';
      case 'codingAssistant': return 'AI Coding Assistant / Chat';
      case 'agenticTerminal': return 'Agentic Coding Terminal';
      default: return 'OSbidibi GDE Central';
    }
  };

  return (
    <div className="flex flex-col w-full h-full overflow-hidden bg-card/70 backdrop-blur-lg shadow-xl border border-primary/20">
      {/* Global OS Header */}
      <header className="flex items-center justify-between p-2 md:p-3 border-b shrink-0 border-primary/30 bg-black/50 shadow-lg">
        <div className="flex items-center space-x-2 md:space-x-3">
          <BinaryBlocksphereIcon className="w-6 h-6 md:w-7 md:h-7 text-primary" />
          <h1 className="text-md md:text-lg font-semibold tracking-tight text-foreground radiant-text">OSbidibi-PEPX</h1>
        </div>
        <div className="flex items-center space-x-2 md:space-x-3">
            {currentUser && (
              <div className="hidden sm:flex items-center text-xs text-muted-foreground space-x-2">
                <span className="radiant-text">User: <span className="font-medium text-accent">{currentUser.username} ({currentUser.role})</span></span>
                {currentUser.isTrialActive && currentUser.role === 'user' && (
                    <Badge variant="default" className="text-xs font-normal px-1.5 py-0.5 bg-accent/80 text-accent-foreground">
                      <Sparkles className="w-3 h-3 mr-1"/> Trial
                    </Badge>
                )}
              </div>
            )}
            <Button variant="ghost" size="icon" onClick={handleFullLogout} title="Logout / Exit GDE" className="button-3d-interactive">
                <LogOut className="w-4 h-4 md:w-5 md:h-5 text-destructive" />
            </Button>
        </div>
      </header>
      
      {/* GDE Core Layout */}
      <div className="flex flex-col flex-grow min-h-0">
        {/* GDE Controls Bar */}
        <div className="p-1.5 md:p-2 border-b border-primary/20 flex items-center justify-between space-x-2 bg-black/40 shrink-0">
            <div className="flex items-center space-x-1">
                <Button variant="ghost" size="icon" onClick={() => setIsDockVisible(!isDockVisible)} className="button-3d-interactive w-8 h-8 md:w-9 md:h-9" aria-label={isDockVisible ? "Hide Dock" : "Show Dock"}>
                    {isDockVisible ? <PanelLeftOpen className="w-4 h-4 md:w-5 md:h-5"/> : <PanelRightOpen className="w-4 h-4 md:w-5 md:h-5"/>}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setIsLaunchpadOpen(true)} className="button-3d-interactive w-8 h-8 md:w-9 md:h-9" aria-label="Open Launchpad">
                    <LayoutGrid className="w-4 h-4 md:w-5 md:h-5"/>
                </Button>
            </div>
            <span className="text-sm font-semibold text-center text-primary radiant-text truncate px-2 flex-grow mx-2">
              {getAppTitle()}
            </span>
            <div className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center"> {/* Fixed width for balance */}
                {activeApp && (
                     <Button variant="ghost" size="icon" onClick={closeApp} aria-label="Close Active App" className="button-3d-interactive w-full h-full">
                        <XIcon className="w-4 h-4 md:w-5 md:h-5" />
                    </Button>
                )}
            </div>
        </div>

        <div className="flex flex-grow min-h-0">
          {/* App Launcher / Dock */}
          {isDockVisible && (
            <div className="w-20 p-2 md:p-3 border-r border-primary/20 flex flex-col items-center space-y-3 md:space-y-4 bg-black/40 overflow-y-auto transition-all duration-300 ease-in-out">
              {appsList.map(app => (
                 <Button 
                    key={app.id}
                    variant="ghost" 
                    size="lg"
                    className={`flex flex-col items-center justify-center h-auto p-1.5 md:p-2 space-y-1 text-foreground hover:bg-primary/20 button-3d-interactive w-full ${activeApp === app.id ? 'bg-primary/40' : 'bg-card/30'}`}
                    onClick={app.action}
                    aria-label={`Launch ${app.name}`}
                    data-ai-hint={app.dataAiHint || app.name.toLowerCase().replace(' ', '')}
                  >
                    <app.icon className="w-7 h-7 md:w-8 md:h-8 text-accent" />
                    <span className="text-[10px] md:text-xs text-center radiant-text">{app.name}</span>
                  </Button>
              ))}
            </div>
          )}

          {/* App Display Area */}
          <div className="flex-grow p-1 md:p-2 overflow-hidden bg-background/40 relative">
            {showWelcome && activeApp === null && (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <BinaryBlocksphereIcon className="w-20 h-20 text-primary opacity-60 mb-4" />
                <h2 className="text-xl md:text-2xl font-semibold text-foreground radiant-text">Welcome to OSbidibi GDE</h2>
                <p className="text-sm text-muted-foreground radiant-text">Select an application from the dock or launchpad.</p>
              </div>
            )}
            
            <div className={`absolute inset-0 flex flex-col transition-opacity duration-300 ${activeApp ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                {/* Ensures app content takes full space of its container */}
                {activeApp === 'osbidibiShell' && <ShellEmulator isEmbeddedInGDE={true} />}
                {activeApp === 'browser' && <MiniBrowser />}
                {activeApp === 'virtualPartition' && <VirtualPartitionApp />}
                {activeApp === 'pixelStore' && <PixelStoreApp />}
                {activeApp === 'codingAssistant' && <CodingAssistantApp />}
                {activeApp === 'agenticTerminal' && <AgenticTerminalApp />}
            </div>
          </div>
        </div>
        <Separator className="my-0 bg-primary/20" />
         <div className="p-1.5 text-xs text-center text-muted-foreground/70 radiant-text bg-black/40">
            OSbidibi-PEPX0.0.1 GDE v0.8.0-alpha. Main entry point active.
          </div>
      </div>
      <AppLaunchpad isOpen={isLaunchpadOpen} onClose={() => setIsLaunchpadOpen(false)} apps={appsList} />
    </div>
  );
}
