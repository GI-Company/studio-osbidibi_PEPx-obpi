
"use client";

import { useEffect, useState } from 'react';
import { ShellEmulator } from "@/components/shell-emulator";
import { Preloader } from "@/components/preloader";
import { StatusBar } from "@/components/status-bar";
import { BinaryBlocksphereIcon } from '@/components/icons/BinaryBlocksphereIcon';
import { DesktopEnvironment } from '@/components/desktop-environment';
import { useAuth } from '@/contexts/AuthContext';
import LaunchModeSelector from '@/components/launch-mode-selector';
import UserOnboarding from '@/components/user-onboarding';
import UserLogin from '@/components/user-login';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';

function MainAppContent() {
  const [isDesktopOpen, setIsDesktopOpen] = useState(false);
  const { currentUser } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center flex-grow w-full min-h-full p-2 md:p-4 overflow-hidden bg-gradient-to-br from-background via-secondary/10 to-background">
      <header className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-3 md:p-4 ">
        <div className="flex items-center space-x-2">
          <BinaryBlocksphereIcon className="w-7 h-7 md:w-8 md:h-8 text-primary" />
          <h1 className="text-lg md:text-xl font-semibold tracking-tight text-foreground radiant-text">BinaryBlocksphere</h1>
        </div>
         {currentUser && (
          <div className="text-xs text-muted-foreground text-right space-y-0.5">
            <div>User: <span className="font-medium text-accent">{currentUser.username} ({currentUser.role})</span></div>
            {currentUser.isTrialActive && currentUser.role === 'user' && (
                <Badge variant="default" className="text-xs font-normal px-1.5 py-0.5 ml-1 bg-accent/80 text-accent-foreground">
                  <Sparkles className="w-3 h-3 mr-1"/> Trial Active
                </Badge>
            )}
            {currentUser.details?.provider && <div>Provider: <span className="font-medium text-accent">{currentUser.details.provider}</span></div>}
            {currentUser.details?.ipAddress && <div className="hidden md:block">IP: <span className="font-medium text-accent">{currentUser.details.ipAddress}</span></div>}
            {currentUser.details?.deviceId && <div className="hidden md:block">Device ID: <span className="font-medium text-accent truncate max-w-[100px] inline-block align-bottom" title={currentUser.details.deviceId}>{currentUser.details.deviceId.substring(0,8)}...</span></div>}
          </div>
        )}
      </header>
      
      <div className="flex items-center justify-center flex-grow w-full pt-12 md:pt-16"> {/* Increased top padding for header */}
        <ShellEmulator onOpenDesktop={() => setIsDesktopOpen(true)} />
      </div>
      
      <StatusBar />

      <DesktopEnvironment isOpen={isDesktopOpen} onClose={() => setIsDesktopOpen(false)} />
    </div>
  );
}


export default function Home() {
  const [isLoadingApp, setIsLoadingApp] = useState(true);
  const { authStatus, isLoading: isAuthLoading, currentUser, endUserTrial } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoadingApp(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Check and end trial if expired
  useEffect(() => {
    if (currentUser && currentUser.subscriptionTier === 'trial' && currentUser.trialEndDate && new Date(currentUser.trialEndDate) < new Date()) {
      if(currentUser.username !== 'GhostUser') { // Don't call for ghost user
        endUserTrial(currentUser.username);
      }
    }
  }, [currentUser, endUserTrial]);


  if (isAuthLoading || (authStatus !== 'ghost_mode' && authStatus !== 'authenticated' && isLoadingApp)) {
    return <Preloader />;
  }
  
  switch (authStatus) {
    case 'needs_mode_selection':
      return <LaunchModeSelector />;
    case 'needs_onboarding':
      return <UserOnboarding />;
    case 'needs_login':
      return <UserLogin />;
    case 'authenticated':
    case 'ghost_mode':
      return <MainAppContent />;
    default:
      return <Preloader />; 
  }
}
