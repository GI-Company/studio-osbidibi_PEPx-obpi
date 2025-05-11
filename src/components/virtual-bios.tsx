
"use client";
import type * as React from 'react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

interface VirtualBiosScreenProps {
  onContinue: () => void;
}

const biosLines = [
  "BinaryBlocksphere BIOS v1.2.3",
  "Copyright (C) 2024, BBS Core Systems",
  "",
  "Main Processor : BBS Quantum Entangler @ 4.0 BHz (2 Cores)",
  "Memory Testing : 16384MB OK",
  "",
  "Initializing USB Controllers .. Done",
  "Initializing Virtual Disk Subsystem .. Done",
  "Primary Master : VHD-01 (Virtual Hard Disk 1024 GBBS)",
  "Primary Slave  : None",
  "Secondary Master: V-CDROM (Virtual CD/DVD)",
  "Secondary Slave : None",
  "",
  "Press 'Continue' to attempt boot from default device...",
  "Press 'Setup' to enter BIOS configuration (Not Implemented)",
];

export function VirtualBiosScreen({ onContinue }: VirtualBiosScreenProps) {
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < biosLines.length) {
      const timer = setTimeout(() => {
        setDisplayedLines(prev => [...prev, biosLines[currentIndex]]);
        setCurrentIndex(prev => prev + 1);
      }, 50); 
      return () => clearTimeout(timer);
    }
  }, [currentIndex]);

  return (
    <div className="w-full h-full p-4 font-mono text-sm bg-card text-accent overflow-y-auto flex flex-col justify-between items-center rounded-md">
      <div className="flex-grow w-full max-w-2xl"> {/* Text block constrained and left-aligned by default */}
        {displayedLines.map((line, index) => (
          <p key={index} className="whitespace-pre leading-tight radiant-text">{line}</p>
        ))}
        {currentIndex < biosLines.length && <span className="animate-pulse radiant-text">_</span>}
      </div>
      {currentIndex >= biosLines.length && (
        <div className="flex justify-center mt-4 space-x-4 shrink-0">
          <Button 
            variant="outline" 
            className="text-foreground bg-muted hover:bg-accent hover:text-accent-foreground border-primary/50 px-6 py-2 button-3d-interactive" 
            onClick={onContinue}
            aria-label="Continue Boot"
            >
            Continue Boot
          </Button>
          <Button 
            variant="outline" 
            className="text-foreground bg-muted hover:bg-accent hover:text-accent-foreground border-primary/50 px-6 py-2 button-3d-interactive" 
            disabled
            aria-label="Enter Setup (Not Implemented)"
            >
            Enter Setup (NI)
          </Button>
        </div>
      )}
    </div>
  );
}
