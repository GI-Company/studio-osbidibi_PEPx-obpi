
"use client";

import { useEffect, useState } from 'react';
import { ShellEmulator } from "@/components/shell-emulator";
import { Preloader } from "@/components/preloader";
import { StatusBar } from "@/components/status-bar";
import { BinaryBlocksphereIcon } from '@/components/icons/BinaryBlocksphereIcon';
import { DesktopEnvironment } from '@/components/desktop-environment';
import { useIsMobile } from '@/hooks/use-mobile'; // Although not explicitly used for layout changes here, good to have for future.

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [isDesktopOpen, setIsDesktopOpen] = useState(false);
  const isMobile = useIsMobile(); // Example of using the hook

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500); // Slightly reduced preloader time
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <Preloader />;
  }

  // The current layout is inherently responsive due to flexbox and percentage/viewport units.
  // ShellEmulator uses max-w-4xl, so it will be full-width on smaller screens.
  // DesktopEnvironment is a dialog that should also adapt.
  // No specific layout changes based on `isMobile` are made here for now,
  // as the components themselves should handle their responsiveness.

  return (
    <div className="flex flex-col items-center justify-center flex-grow w-full min-h-full p-2 md:p-4 overflow-hidden bg-gradient-to-br from-background via-secondary/10 to-background">
      <header className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-3 md:p-4 ">
        <div className="flex items-center space-x-2">
          <BinaryBlocksphereIcon className="w-7 h-7 md:w-8 md:h-8 text-primary" />
          <h1 className="text-lg md:text-xl font-semibold tracking-tight text-foreground radiant-text">BinaryBlocksphere</h1>
        </div>
      </header>
      
      <div className="flex items-center justify-center flex-grow w-full pt-12 md:pt-16"> {/* Adjusted padding top slightly */}
        <ShellEmulator onOpenDesktop={() => setIsDesktopOpen(true)} />
      </div>
      
      <StatusBar />

      <DesktopEnvironment isOpen={isDesktopOpen} onClose={() => setIsDesktopOpen(false)} />
    </div>
  );
}

    