
"use client";

import type * as React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Globe, TerminalSquare, XIcon, HardDrive, Layers3, Lightbulb, LayoutGrid, BotMessageSquare, LogOut, FolderOpen, Package, Loader2, Users, Activity, Lock, PlaySquare, ScreenShare, Wifi, BookOpenText, FileSearch, NotebookText, CreditCard, Phone, ShieldQuestion, Settings, ChevronLeft, ChevronRight, Zap, InfoIcon } from 'lucide-react'; // Added InfoIcon
import { MiniBrowser } from './mini-browser';
import { Separator } from './ui/separator';
import { VirtualPartitionApp } from './virtual-partition-app';
import { PEPxApp } from './PEPxApp';
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
import { MediaPlayerApp } from '@/components/media-player-app';
import { ConnectivityCenterApp } from '@/components/connectivity-center-app';
import { UserManualApp } from '@/components/user-manual-app';
import { DocumentViewerApp } from '@/components/document-viewer-app';
import { NotepadApp } from '@/components/notepad-app';
import { PaymentTerminalApp } from '@/components/payment-terminal-app';
import { DataIntelligenceApp } from '@/components/data-intelligence-app';
import { TimesenseAdapterApp } from './timesense-adapter-app';
import { SystemInformationApp } from './SystemInformationApp'; // New Import
import { toast } from '@/hooks/use-toast';
import { useVFS } from '@/contexts/VFSContext';
import { cn } from '@/lib/utils';


type ActiveApp =
  | 'browser'
  | 'osbidibiShell'
  | 'virtualPartition'
  | 'pepxApp'
  | 'codingAssistant'
  | 'agenticTerminal'
  | 'fileManager'
  | 'userManagement'
  | 'sessionLogs'
  | 'mediaPlayer'
  | 'connectivityCenter'
  | 'userManual'
  | 'documentViewer'
  | 'notepad'
  | 'paymentTerminal'
  | 'dataIntelligenceApp'
  | 'timesenseAdapter'
  | 'systemInformation' // New App ID
  | 'dockSettings'
  | { type: 'pixelProject'; id: string; name: string; path: string; }
  | null;

interface AppLauncherItem {
  id: string;
  name: string;
  icon: React.ElementType;
  action: () => void;
  dataAiHint?: string;
}

interface SavedProject extends AppLauncherItem {
  path: string;
}

const DOCK_PAGE_SIZE = 5;
const DOCK_HIDE_TIMEOUT_MS = 3000;

export function DesktopEnvironment() {
  const { currentUser, logout } = useAuth();
  const { getItem: getVFSItem } = useVFS();
  const [activeApp, setActiveApp] = useState<ActiveApp>(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [isLaunchpadOpen, setIsLaunchpadOpen] = useState(false);
  const [isLoadingProject, setIsLoadingProject] = useState(false);
  const [isBottomDockVisible, setIsBottomDockVisible] = useState(false);
  const dockHideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const isAdmin = currentUser?.role === 'superuser';

  const coreAppsList: AppLauncherItem[] = [
    { id: 'osbidibiShell', name: 'OSbidibi Shell', icon: TerminalSquare, action: () => openApp('osbidibiShell'), dataAiHint: "OS command line" },
    { id: 'browser', name: 'Browser', icon: Globe, action: () => openApp('browser'), dataAiHint: "web browser" },
    { id: 'agenticTerminal', name: 'Agent Terminal', icon: BotMessageSquare, action: () => openApp('agenticTerminal'), dataAiHint: "AI agent terminal" },
    { id: 'codingAssistant', name: 'AI Assist', icon: Lightbulb, action: () => openApp('codingAssistant'), dataAiHint: "AI assistant code" },
    { id: 'virtualPartition', name: 'V-Partition', icon: HardDrive, action: () => openApp('virtualPartition'), dataAiHint: "virtual machine disk" },
    { id: 'pepxApp', name: 'PEPx Storage', icon: Layers3, action: () => openApp('pepxApp'), dataAiHint: "pixel data storage" },
    { id: 'fileManager', name: 'File Manager', icon: FolderOpen, action: () => openApp('fileManager'), dataAiHint: "file system browser" },
    { id: 'mediaPlayer', name: 'Media Hub', icon: PlaySquare, action: () => openApp('mediaPlayer'), dataAiHint: "media player video audio" },
    { id: 'connectivityCenter', name: 'Connectivity', icon: Wifi, action: () => openApp('connectivityCenter'), dataAiHint: "network wifi cast" },
    { id: 'timesenseAdapter', name: 'Timesense Adapter', icon: Zap, action: () => openApp('timesenseAdapter'), dataAiHint: "time synchronization adapter" },
    { id: 'userManual', name: 'User Manual', icon: BookOpenText, action: () => openApp('userManual'), dataAiHint: "help documentation manual" },
    { id: 'documentViewer', name: 'Doc Viewer', icon: FileSearch, action: () => openApp('documentViewer'), dataAiHint: "document viewer files" },
    { id: 'notepad', name: 'Notepad', icon: NotebookText, action: () => openApp('notepad'), dataAiHint: "text editor notes" },
    { id: 'paymentTerminal', name: 'Payment POS', icon: CreditCard, action: () => openApp('paymentTerminal'), dataAiHint: "payment terminal POS" },
    { id: 'dataIntelligenceApp', name: 'Data Intel', icon: ShieldQuestion, action: () => openApp('dataIntelligenceApp'), dataAiHint: "data lookup intelligence" },
    { id: 'systemInformation', name: 'System Info', icon: InfoIcon, action: () => openApp('systemInformation'), dataAiHint: "system graphics information" }, // New App
  ];

  const adminAppsList: AppLauncherItem[] = [
    { id: 'userManagement', name: 'User Mgmt', icon: Users, action: () => openApp('userManagement'), dataAiHint: "admin user management" },
    { id: 'sessionLogs', name: 'Session Logs', icon: Activity, action: () => openApp('sessionLogs'), dataAiHint: "admin session logs" },
  ];

  const utilityAppsList: AppLauncherItem[] = [
     { id: 'dockSettings', name: 'Dock Settings', icon: Settings, action: () => openApp('dockSettings'), dataAiHint: "configure application dock" }
  ];

  const availableAppsForLaunchpad = isAdmin ? [...coreAppsList, ...adminAppsList, ...utilityAppsList] : [...coreAppsList, ...utilityAppsList];
  const allPossibleItemsMap = new Map<string, AppLauncherItem>(
    [...coreAppsList, ...adminAppsList, ...utilityAppsList].map(app => [app.id, app])
  );


  const [savedPixelStoreProjects, setSavedPixelStoreProjects] = useState<SavedProject[]>(() => {
     if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('binaryblocksphere_savedProjects');
        return saved ? JSON.parse(saved) : [];
      }
      return [];
  });

  useEffect(() => {
     if (typeof window !== 'undefined') {
        localStorage.setItem('binaryblocksphere_savedProjects', JSON.stringify(savedPixelStoreProjects));
        // Update allPossibleItemsMap when projects change
        savedPixelStoreProjects.forEach(p => allPossibleItemsMap.set(p.id, p));
      }
  }, [savedPixelStoreProjects, allPossibleItemsMap]);


  const [dockedAppIds, setDockedAppIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const savedDock = localStorage.getItem('binaryblocksphere_dockedAppIds');
      if (savedDock) return JSON.parse(savedDock);
    }
    // Ensure System Info is added to default dock if not already configured
    const defaultCoreDock = coreAppsList.slice(0, DOCK_PAGE_SIZE -1).map(app => app.id);
    if (!defaultCoreDock.includes('systemInformation')) {
        defaultCoreDock.push('systemInformation');
    }
    return defaultCoreDock.slice(0, DOCK_PAGE_SIZE);
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('binaryblocksphere_dockedAppIds', JSON.stringify(dockedAppIds));
    }
  }, [dockedAppIds]);

  const currentDockItems = dockedAppIds.map(id => {
    return allPossibleItemsMap.get(id) || savedPixelStoreProjects.find(p => p.id === id);
  }).filter(item => item !== undefined) as AppLauncherItem[];


  const [visibleDockRange, setVisibleDockRange] = useState<{ start: number; end: number }>({ start: 0, end: Math.min(DOCK_PAGE_SIZE, currentDockItems.length) });
  const [focusedDockItemIndex, setFocusedDockItemIndex] = useState<number | null>(null); // Relative to `currentDockItems`

  useEffect(() => {
    setVisibleDockRange({ start: 0, end: Math.min(DOCK_PAGE_SIZE, currentDockItems.length) });
  }, [currentDockItems.length]);

  const handleAddSavedProject = (projectName: string, projectPath: string) => {
    const newProject: SavedProject = {
      id: `project-${Date.now()}`,
      name: projectName,
      icon: Package,
      path: projectPath,
      action: () => openPixelStoreProject(newProject), // Ensure action is set
      dataAiHint: `project ${projectName.toLowerCase()}`
    };
    setSavedPixelStoreProjects(prev => {
      if (prev.find(p => p.path === projectPath)) return prev;
      const updatedProjects = [...prev, newProject];
      allPossibleItemsMap.set(newProject.id, newProject); // Update map
      return updatedProjects;
    });
  };

  const openApp = (appId: ActiveApp | string) => {
    const appToOpen = typeof appId === 'string' ? allPossibleItemsMap.get(appId) : null;
    if (typeof appId === 'string' && appToOpen) {
      setActiveApp(appId as any);
    } else if (typeof appId === 'object' && appId !== null) { // For pixelProject type
        setActiveApp(appId);
    } else {
        setActiveApp(appId as any);
    }
    setShowWelcome(false);
  };

  const openPixelStoreProject = async (project: SavedProject) => {
    setIsLoadingProject(true);
    toast({ title: "Loading Project from VFS", description: `Opening "${project.name}" from ${project.path}...`});

    setActiveApp({type: 'pixelProject', id: project.id, name: project.name, path: project.path });
    setShowWelcome(false);

    const manifestFile = getVFSItem(`${project.path}/manifest.bbs-proj`);
    if (!manifestFile) {
        toast({ title: "Project Load Warning", description: `Manifest for "${project.name}" not found at ${project.path}. Proceeding with agent terminal.`, variant: "default"});
    }

    await new Promise(resolve => setTimeout(resolve, 2500));
    openApp('agenticTerminal');
    toast({ title: "Project Context Active", description: `Project "${project.name}" loaded. Agent Terminal is active for this project.`});
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

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullScreen(true);
        toast({ title: "Environment Locked", description: "Fullscreen mode activated. Press Esc to exit." });
      }).catch(err => {
        toast({ title: "Fullscreen Error", description: `Could not enter fullscreen: ${err.message}`, variant: "destructive" });
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          setIsFullScreen(false);
          toast({ title: "Environment Unlocked", description: "Exited fullscreen mode." });
        });
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const getAppTitle = () => {
    if (activeApp === null) return 'OSbidibi GDE Central';

    if (typeof activeApp === 'object' && activeApp.type === 'pixelProject') {
      return `Project: ${activeApp.name}`;
    }

    const appInfo = allPossibleItemsMap.get(activeApp as string);
    if (appInfo) return appInfo.name;
    
    // Fallback for string IDs not in map (should be rare now)
    if (typeof activeApp === 'string') {
        const knownTitle = activeApp.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        return knownTitle || 'OSbidibi GDE Application';
    }
    return 'OSbidibi GDE Application';
  };

  const allLaunchpadItems = [...availableAppsForLaunchpad, ...savedPixelStoreProjects];


  const scrollDock = useCallback((direction: 'left' | 'right') => {
      setVisibleDockRange(prev => {
        let newStart = prev.start;
        if (direction === 'left') {
          newStart = Math.max(0, prev.start - 1);
        } else {
          newStart = Math.min(prev.start + 1, Math.max(0, currentDockItems.length - DOCK_PAGE_SIZE));
        }
        if (newStart === prev.start && currentDockItems.length <= DOCK_PAGE_SIZE) return prev;
        return { start: newStart, end: Math.min(newStart + DOCK_PAGE_SIZE, currentDockItems.length) };
      });
      setFocusedDockItemIndex(null);
    }, [currentDockItems.length]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isBottomDockVisible || !dockRef.current?.contains(document.activeElement)) return;

      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();
        setFocusedDockItemIndex(prev => {
          if (prev === null) return visibleDockRange.start;
          const currentDockRelativeIndex = prev - visibleDockRange.start;
          let newRelativeIndex = Math.max(0, currentDockRelativeIndex - 1);
          if (newRelativeIndex < 0 && visibleDockRange.start > 0) {
            scrollDock('left');
            return Math.min(visibleDockRange.start + DOCK_PAGE_SIZE -1, currentDockItems.length -1);
          }
          return visibleDockRange.start + newRelativeIndex;
        });
      } else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault();
         setFocusedDockItemIndex(prev => {
          if (prev === null) return visibleDockRange.start;
          const currentVisibleItems = currentDockItems.slice(visibleDockRange.start, visibleDockRange.end);
          const currentDockRelativeIndex = prev - visibleDockRange.start;
          let newRelativeIndex = Math.min(currentVisibleItems.length - 1, currentDockRelativeIndex + 1);
          if (newRelativeIndex >= DOCK_PAGE_SIZE -1 && visibleDockRange.end < currentDockItems.length && prev === visibleDockRange.end -1) {
            scrollDock('right');
            return visibleDockRange.start + DOCK_PAGE_SIZE ; 
          }
          return visibleDockRange.start + newRelativeIndex;
        });
      } else if (event.key === 'Enter' && focusedDockItemIndex !== null && currentDockItems[focusedDockItemIndex]) {
        event.preventDefault();
        currentDockItems[focusedDockItemIndex].action();
      }
    };

    if (isBottomDockVisible) {
      document.addEventListener('keydown', handleKeyDown);
    } else {
      setFocusedDockItemIndex(null);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isBottomDockVisible, focusedDockItemIndex, currentDockItems, visibleDockRange, scrollDock]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (dockHideTimeoutRef.current) {
        clearTimeout(dockHideTimeoutRef.current);
        dockHideTimeoutRef.current = null;
      }
      const dockElement = dockRef.current;
      const isOverDock = dockElement && dockElement.contains(event.target as Node);

      if (event.clientY > window.innerHeight - 80 || isOverDock) {
        setIsBottomDockVisible(true);
      } else {
        if (isBottomDockVisible) {
          dockHideTimeoutRef.current = setTimeout(() => {
            const stillOverDock = dockRef.current && dockRef.current.matches(':hover');
            if (!stillOverDock && !isLaunchpadOpen && activeApp !== 'dockSettings') {
              setIsBottomDockVisible(false);
            }
          }, DOCK_HIDE_TIMEOUT_MS);
        }
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (dockHideTimeoutRef.current) clearTimeout(dockHideTimeoutRef.current);
    };
  }, [isBottomDockVisible, isLaunchpadOpen, activeApp]);

  const handleWheelScrollDock = (event: React.WheelEvent<HTMLDivElement>) => {
     if (currentDockItems.length <= DOCK_PAGE_SIZE) return;
     event.preventDefault();
     if (event.deltaY > 0 || event.deltaX > 0) {
        scrollDock('right');
     } else {
        scrollDock('left');
     }
  };

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
                 <Button variant="ghost" size="icon" onClick={toggleFullScreen} title={isFullScreen ? "Unlock Environment (Exit Fullscreen)" : "Lock Environment (Enter Fullscreen)"} className="button-3d-interactive mr-1 w-5 h-5 p-0">
                  <Lock className={`w-3 h-3 md:w-4 md:h-4 ${isFullScreen ? 'text-primary' : 'text-muted-foreground hover:text-accent'}`} />
                </Button>
                <span className="radiant-text">User: <span className="font-medium text-accent">{currentUser.username} ({currentUser.role})</span></span>
                {currentUser.isTrialActive && currentUser.role === 'user' && (
                    <Badge variant="default" className="text-xs font-normal px-1.5 py-0.5 bg-accent/80 text-accent-foreground">
                      <Sparkles className="w-3 h-3 mr-1"/> Trial
                    </Badge>
                )}
              </div>
            )}
             <Button variant="ghost" size="icon" onClick={toggleFullScreen} title={isFullScreen ? "Unlock Environment (Exit Fullscreen)" : "Lock Environment (Enter Fullscreen)"} className="button-3d-interactive sm:hidden w-6 h-6 p-0">
                  <Lock className={`w-4 h-4 ${isFullScreen ? 'text-primary' : 'text-muted-foreground hover:text-accent'}`} />
            </Button>
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
                  <p className="text-lg text-foreground radiant-text">Loading Project from VFS: {activeApp.name}...</p>
                  <p className="text-sm text-muted-foreground radiant-text">(Path: {activeApp.path})</p>
              </div>
          )}

          <div className={`absolute inset-0 flex flex-col transition-opacity duration-300 ${activeApp && !isLoadingProject ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              {activeApp === 'osbidibiShell' && <ShellEmulator isEmbeddedInGDE={true} />}
              {activeApp === 'browser' && <MiniBrowser />}
              {activeApp === 'virtualPartition' && <VirtualPartitionApp />}
              {activeApp === 'pepxApp' && <PEPxApp />}
              {activeApp === 'codingAssistant' && <CodingAssistantApp />}
              {activeApp === 'agenticTerminal' && <AgenticTerminalApp onSaveProjectToPixelStore={handleAddSavedProject} />}
              {activeApp === 'fileManager' && <FileManagerApp />}
              {isAdmin && activeApp === 'userManagement' && <UserManagementApp />}
              {isAdmin && activeApp === 'sessionLogs' && <SessionLogsApp />}
              {activeApp === 'mediaPlayer' && <MediaPlayerApp />}
              {activeApp === 'connectivityCenter' && <ConnectivityCenterApp />}
              {activeApp === 'timesenseAdapter' && <TimesenseAdapterApp />}
              {activeApp === 'userManual' && <UserManualApp />}
              {activeApp === 'documentViewer' && <DocumentViewerApp />}
              {activeApp === 'notepad' && <NotepadApp />}
              {activeApp === 'paymentTerminal' && <PaymentTerminalApp />}
              {activeApp === 'dataIntelligenceApp' && <DataIntelligenceApp />}
              {activeApp === 'systemInformation' && <SystemInformationApp />} {/* Render new app */}
              {activeApp === 'dockSettings' && (
                <div className="p-4 text-foreground radiant-text">
                  <h2 className="text-xl mb-2">Dock Settings (Conceptual)</h2>
                  <p>This area would allow users to add, remove, and reorder applications in the dock.</p>
                  <p className="mt-2">Current Docked App IDs: {dockedAppIds.join(', ')}</p>
                </div>
              )}
          </div>
        </div>
        <div
            ref={dockRef}
            className={cn(
                `fixed bottom-0 left-1/2 -translate-x-1/2 h-[70px] md:h-[80px] bg-black/60 backdrop-blur-md border-t border-primary/30
                flex items-center justify-center px-2 md:px-4 space-x-1 md:space-x-1.5 overflow-hidden transition-all duration-300 ease-in-out z-20
                rounded-t-lg shadow-2xl`,
                isBottomDockVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
            )}
            onMouseEnter={() => {
              if (dockHideTimeoutRef.current) clearTimeout(dockHideTimeoutRef.current);
              setIsBottomDockVisible(true);
            }}
            onMouseLeave={() => {
               dockHideTimeoutRef.current = setTimeout(() => {
                 if (!isLaunchpadOpen && activeApp !== 'dockSettings') setIsBottomDockVisible(false);
               }, DOCK_HIDE_TIMEOUT_MS);
            }}
            onWheel={handleWheelScrollDock}
        >
            {currentDockItems.length > DOCK_PAGE_SIZE && visibleDockRange.start > 0 && (
              <Button variant="ghost" size="icon" onClick={() => scrollDock('left')} className="h-full w-8 text-primary hover:bg-primary/20 absolute left-0 top-0 bottom-0 my-auto rounded-none rounded-l-lg z-10">
                <ChevronLeft className="w-5 h-5" />
              </Button>
            )}
            <div className="flex items-center justify-center space-x-1 md:space-x-1.5 transition-transform duration-300 ease-in-out" style={{ transform: `translateX(-${(visibleDockRange.start % DOCK_PAGE_SIZE) * (60)}px)` }}>
              {currentDockItems.map((app, index) => (
              <Button
                  key={app.id}
                  variant="ghost"
                  className={cn(
                      `flex flex-col items-center justify-center h-[55px] w-[55px] md:h-[65px] md:w-[65px] p-1 space-y-0.5 text-foreground
                      transition-all duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background`,
                      (typeof activeApp === 'string' && activeApp === app.id) ||
                      (typeof activeApp === 'object' && activeApp?.type === 'pixelProject' && activeApp.id === app.id)
                        ? 'bg-primary/40 scale-105 shadow-lg'
                        : 'bg-card/30 hover:bg-primary/20 hover:scale-110 hover:shadow-md',
                      index >= visibleDockRange.start && index < visibleDockRange.end ? 'opacity-100' : 'opacity-0 w-0 h-0 p-0 m-0 pointer-events-none',
                      focusedDockItemIndex === index && 'ring-2 ring-accent ring-offset-2 ring-offset-background scale-110 shadow-lg'
                  )}
                  onClick={app.action}
                  onFocus={() => setFocusedDockItemIndex(index)}
                  onBlur={() => { if(focusedDockItemIndex === index) setFocusedDockItemIndex(null);}}
                  aria-label={`Launch ${app.name}`}
                  data-ai-hint={app.dataAiHint || app.name.toLowerCase().replace(' ', '')}
                  tabIndex={isBottomDockVisible && index >= visibleDockRange.start && index < visibleDockRange.end ? 0 : -1}
              >
                  <app.icon className="w-5 h-5 md:w-6 md:h-6 text-accent" />
                  <span className="text-[8px] md:text-[10px] text-center radiant-text truncate w-full">{app.name}</span>
              </Button>
              ))}
            </div>
            {currentDockItems.length > DOCK_PAGE_SIZE && visibleDockRange.end < currentDockItems.length && (
               <Button variant="ghost" size="icon" onClick={() => scrollDock('right')} className="h-full w-8 text-primary hover:bg-primary/20 absolute right-0 top-0 bottom-0 my-auto rounded-none rounded-r-lg z-10">
                <ChevronRight className="w-5 h-5" />
              </Button>
            )}
        </div>

        <Separator className="my-0 bg-primary/20" />
         <div className="p-1.5 text-xs text-center text-muted-foreground/70 radiant-text bg-black/40">
            OSbidibi-PEPX0.0.1 GDE v0.9.8-alpha. Main entry point active. VFS & PEPx operational.
          </div>
      </div>
      <AppLaunchpad isOpen={isLaunchpadOpen} onClose={() => setIsLaunchpadOpen(false)} apps={allLaunchpadItems} />
    </div>
  );
}
