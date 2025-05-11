
"use client";

import type * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Globe, TerminalSquare, XIcon, HardDrive, Layers3, Lightbulb, LayoutGrid, BotMessageSquare, LogOut, FolderOpen, Package, Loader2, Users, Activity } from 'lucide-react';
import { MiniBrowser } from './mini-browser';
import { Separator } from './ui/separator';
import { VirtualPartitionApp } from './virtual-partition-app';
import { PixelStoreApp } from './pixel-store-app';
import { CodingAssistantApp } from './coding-assistant-app';
import { AppLaunchpad } from './app-launchpad';
import { AgenticTerminalApp } from './agentic-terminal-app';
import { ShellEmulator } from './shell-emulator';
import { BinaryBlocksphereIcon } from '@/components/icons/BinaryBlocksphereIcon';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';
import { FileManagerApp } from './file-manager-app';
import { UserManagementApp } from '@/components/admin/user-management-app';
import { SessionLogsApp } from '@/components/admin/session-logs-app';
import { toast } from '@/hooks/use-toast';

type ActiveApp = 
  | 'browser' 
  | 'osbidibiShell' 
  | 'virtualPartition' 
  | 'pixelStore' 
  | 'codingAssistant' 
  | 'agenticTerminal' 
  | 'fileManager' 
  | 'userManagement' // New Admin App
  | 'sessionLogs'    // New Admin App
  | { type: 'pixelProject'; id: string; name: string } 
  | null;

interface SavedProject {
  id: string;
  name: string;
  icon: React.ElementType;
}

export function DesktopEnvironment() {
  const { currentUser, logout } = useAuth();
  const [activeApp, setActiveApp] = useState<ActiveApp>(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [isLaunchpadOpen, setIsLaunchpadOpen] = useState(false);
  const [savedPixelStoreProjects, setSavedPixelStoreProjects] = useState<SavedProject[]>([]);
  const [isLoadingProject, setIsLoadingProject] = useState(false);
  const [isBottomDockVisible, setIsBottomDockVisible] = useState(false);
  const dockHideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isAdmin = currentUser?.role === 'superuser';

  const coreAppsList = [
    { id: 'osbidibiShell', name: 'OSbidibi Shell', icon: TerminalSquare, action: () => openApp('osbidibiShell'), dataAiHint: "OS command line" },
    { id: 'browser', name: 'Browser', icon: Globe, action: () => openApp('browser'), dataAiHint: "web browser" },
    { id: 'agenticTerminal', name: 'Agent Terminal', icon: BotMessageSquare, action: () => openApp('agenticTerminal'), dataAiHint: "AI agent terminal" },
    { id: 'codingAssistant', name: 'AI Assist', icon: Lightbulb, action: () => openApp('codingAssistant'), dataAiHint: "AI assistant code" },
    { id: 'virtualPartition', name: 'V-Partition', icon: HardDrive, action: () => openApp('virtualPartition'), dataAiHint: "virtual machine disk" },
    { id: 'pixelStore', name: 'PixelStore', icon: Layers3, action: () => openApp('pixelStore'), dataAiHint: "data storage concept" },
    { id: 'fileManager', name: 'File Manager', icon: FolderOpen, action: () => openApp('fileManager'), dataAiHint: "file system browser" },
  ];

  const adminAppsList = [
    { id: 'userManagement', name: 'User Mgmt', icon: Users, action: () => openApp('userManagement'), dataAiHint: "admin user management" },
    { id: 'sessionLogs', name: 'Session Logs', icon: Activity, action: () => openApp('sessionLogs'), dataAiHint: "admin session logs" },
  ];

  const availableApps = isAdmin ? [...coreAppsList, ...adminAppsList] : coreAppsList;

  const handleAddSavedProject = (projectName: string) => {
    const newProject: SavedProject = {
      id: `project-${Date.now()}`,
      name: projectName,
      icon: Package,
    };
    setSavedPixelStoreProjects(prev => [...prev, newProject]);
  };

  const openApp = (app: ActiveApp | string) => {
    if (typeof app === 'string' && availableApps.find(a => a.id === app)) {
      setActiveApp(app as any);
    } else {
      setActiveApp(app);
    }
    setShowWelcome(false);
  };

  const openPixelStoreProject = async (project: SavedProject) => {
    setIsLoadingProject(true);
    toast({ title: "Loading Project", description: `Opening "${project.name}" from PixelStore... (Conceptual conversion)`});
    setActiveApp({type: 'pixelProject', id: project.id, name: project.name});
    setShowWelcome(false);
    await new Promise(resolve => setTimeout(resolve, 2500));
    openApp('agenticTerminal');
    toast({ title: "Project Loaded", description: `"${project.name}" is now active in Agent Terminal.`});
    setIsLoadingProject(false);
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
    if (activeApp === null) return 'OSbidibi GDE Central';
    
    const appInfo = availableApps.find(app => typeof activeApp === 'string' && app.id === activeApp);
    if (appInfo) return appInfo.name;
    
    if (typeof activeApp === 'object' && activeApp.type === 'pixelProject') {
      return `PixelStore Project: ${activeApp.name}`;
    }
    // Fallback for any other cases, though should be covered by appInfo
    switch (activeApp) {
      case 'browser': return 'Web Browser';
      case 'osbidibiShell': return 'OSbidibi-PEPX0.0.1 Shell (bidibi)';
      case 'virtualPartition': return 'Virtual Partition Environment';
      case 'pixelStore': return 'BBS PixelStore Interface';
      case 'codingAssistant': return 'AI Coding Assistant / Chat';
      case 'agenticTerminal': return 'Agentic Coding Terminal';
      case 'fileManager': return 'File Manager';
      case 'userManagement': return 'User Management Console';
      case 'sessionLogs': return 'Session Activity Logs';
      default: return 'OSbidibi GDE Application';
    }
  };

  const allLaunchableItems = [
    ...availableApps,
    ...savedPixelStoreProjects.map(p => ({
      id: p.id,
      name: p.name,
      icon: p.icon,
      action: () => openPixelStoreProject(p),
      dataAiHint: `project ${p.name.toLowerCase()}`
    }))
  ];

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (dockHideTimeoutRef.current) {
        clearTimeout(dockHideTimeoutRef.current);
        dockHideTimeoutRef.current = null;
      }
      if (event.clientY > window.innerHeight - 50) { 
        setIsBottomDockVisible(true);
      } else {
        if(isBottomDockVisible) {
         dockHideTimeoutRef.current = setTimeout(() => {
            setIsBottomDockVisible(false);
          }, 300);
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (dockHideTimeoutRef.current) {
        clearTimeout(dockHideTimeoutRef.current);
      }
    };
  }, [isBottomDockVisible]);


  return (
    <div className="flex flex-col w-full h-full overflow-hidden bg-card/70 backdrop-blur-lg shadow-xl border border-primary/20">
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

      <div className="flex flex-col flex-grow min-h-0">
        <div className="p-1.5 md:p-2 border-b border-primary/20 flex items-center justify-between space-x-2 bg-black/40 shrink-0">
            <div className="flex items-center space-x-1">
                <Button variant="ghost" size="icon" onClick={() => setIsLaunchpadOpen(true)} className="button-3d-interactive w-8 h-8 md:w-9 md:h-9" aria-label="Open Launchpad">
                    <LayoutGrid className="w-4 h-4 md:w-5 md:h-5"/>
                </Button>
            </div>
            <span className="text-sm font-semibold text-center text-primary radiant-text truncate px-2 flex-grow mx-2">
              {getAppTitle()}
            </span>
            <div className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center">
                {activeApp && (
                     <Button variant="ghost" size="icon" onClick={closeApp} aria-label="Close Active App" className="button-3d-interactive w-full h-full">
                        <XIcon className="w-4 h-4 md:w-5 md:h-5" />
                    </Button>
                )}
            </div>
        </div>

        <div className="flex-grow p-1 md:p-2 overflow-hidden bg-background/40 relative">
          {showWelcome && activeApp === null && (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <BinaryBlocksphereIcon className="w-20 h-20 text-primary opacity-60 mb-4" />
              <h2 className="text-xl md:text-2xl font-semibold text-foreground radiant-text">Welcome to OSbidibi GDE</h2>
              <p className="text-sm text-muted-foreground radiant-text">Select an application from the dock or launchpad.</p>
            </div>
          )}
          {isLoadingProject && typeof activeApp === 'object' && activeApp?.type === 'pixelProject' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-10">
                  <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                  <p className="text-lg text-foreground radiant-text">Loading PixelStore Project: {activeApp.name}...</p>
                  <p className="text-sm text-muted-foreground radiant-text">(Conceptual data conversion in progress)</p>
              </div>
          )}

          <div className={`absolute inset-0 flex flex-col transition-opacity duration-300 ${activeApp && !isLoadingProject ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              {activeApp === 'osbidibiShell' && <ShellEmulator isEmbeddedInGDE={true} />}
              {activeApp === 'browser' && <MiniBrowser />}
              {activeApp === 'virtualPartition' && <VirtualPartitionApp />}
              {activeApp === 'pixelStore' && <PixelStoreApp />}
              {activeApp === 'codingAssistant' && <CodingAssistantApp />}
              {activeApp === 'agenticTerminal' && <AgenticTerminalApp onSaveProjectToPixelStore={handleAddSavedProject} />}
              {activeApp === 'fileManager' && <FileManagerApp />}
              {isAdmin && activeApp === 'userManagement' && <UserManagementApp />}
              {isAdmin && activeApp === 'sessionLogs' && <SessionLogsApp />}
          </div>
        </div>
        <div
            className={`fixed bottom-0 left-0 right-0 h-[70px] md:h-[80px] bg-black/50 backdrop-blur-md border-t border-primary/20 flex items-center justify-center 
                        px-2 md:px-4 space-x-2 md:space-x-3 overflow-x-auto transition-transform duration-300 ease-in-out z-20
                        ${isBottomDockVisible ? 'translate-y-0' : 'translate-y-full'}`}
            onMouseEnter={() => {
              if (dockHideTimeoutRef.current) clearTimeout(dockHideTimeoutRef.current);
              setIsBottomDockVisible(true);
            }}
            onMouseLeave={() => {
               dockHideTimeoutRef.current = setTimeout(() => {
                setIsBottomDockVisible(false);
              }, 300);
            }}
        >
            {allLaunchableItems.map(app => (
            <Button
                key={app.id}
                variant="ghost"
                className={`flex flex-col items-center justify-center h-[55px] w-[55px] md:h-[65px] md:w-[65px] p-1 space-y-0.5 text-foreground hover:bg-primary/20 button-3d-interactive
                            ${(typeof activeApp === 'string' && activeApp === app.id) || (typeof activeApp === 'object' && activeApp?.type === 'pixelProject' && activeApp.id === app.id) ? 'bg-primary/40' : 'bg-card/30'}`}
                onClick={app.action}
                aria-label={`Launch ${app.name}`}
                data-ai-hint={app.dataAiHint || app.name.toLowerCase().replace(' ', '')}
            >
                <app.icon className="w-5 h-5 md:w-6 md:h-6 text-accent" />
                <span className="text-[8px] md:text-[10px] text-center radiant-text truncate w-full">{app.name}</span>
            </Button>
            ))}
        </div>

        <Separator className="my-0 bg-primary/20" />
         <div className="p-1.5 text-xs text-center text-muted-foreground/70 radiant-text bg-black/40">
            OSbidibi-PEPX0.0.1 GDE v0.9.1-alpha. Main entry point active.
          </div>
      </div>
      <AppLaunchpad isOpen={isLaunchpadOpen} onClose={() => setIsLaunchpadOpen(false)} apps={allLaunchableItems} />
    </div>
  );
}
    
