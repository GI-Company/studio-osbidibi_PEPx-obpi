"use client";

import { useEffect, useState } from 'react';
import { Preloader } from "@/components/preloader";
import { StatusBar } from "@/components/status-bar";
import { DesktopEnvironment } from '@/components/desktop-environment';
import { useAuth } from '@/contexts/AuthContext';
import LaunchModeSelector from '@/components/launch-mode-selector';
import UserOnboarding from '@/components/user-onboarding';
import UserLogin from '@/components/user-login';


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
      return (
        <div className="flex flex-col flex-grow w-full h-screen overflow-hidden bg-gradient-to-br from-background via-secondary/20 to-background">
          <DesktopEnvironment />
          <StatusBar />
        </div>
      );
    default:
      return <Preloader />; 
  }
}

