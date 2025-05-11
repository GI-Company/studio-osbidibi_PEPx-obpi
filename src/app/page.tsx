"use client";

import { useEffect, useState } from 'react';
import { ShellEmulator } from "@/components/shell-emulator";
import { Preloader } from "@/components/preloader";
import { StatusBar } from "@/components/status-bar";
import { BinaryBlocksphereIcon } from '@/components/icons/BinaryBlocksphereIcon';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000); // Simulate loading time
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <Preloader />;
  }

  return (
    <div className="flex flex-col items-center justify-center flex-grow w-full min-h-full p-4 overflow-hidden bg-gradient-to-br from-background via-secondary/10 to-background">
      <header className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 ">
        <div className="flex items-center space-x-2">
          <BinaryBlocksphereIcon className="w-8 h-8 text-primary" />
          <h1 className="text-xl font-semibold tracking-tight text-foreground radiant-text">BinaryBlocksphere</h1>
        </div>
      </header>
      
      <div className="flex items-center justify-center flex-grow w-full pt-16 md:pt-0"> {/* Added padding top for header */}
        <ShellEmulator />
      </div>
      
      <StatusBar />
    </div>
  );
}
