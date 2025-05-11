"use client";
import type * as React from 'react';
import { useEffect, useState } from 'react';
import { Progress } from "@/components/ui/progress";

interface VirtualBootSequenceScreenProps {
  onBootComplete: () => void;
}

const bootMessages = [
  { text: "Booting from Virtual Hard Disk (VHD-01)...", delay: 300 },
  { text: "Loading BBS Kernel v3.1.4...", delay: 700 },
  { text: "Initializing memory manager (16384MB)...", delay: 500 },
  { text: "Mounting root filesystem (bbsfs) on /dev/vhd01...", delay: 600 },
  { text: "Checking filesystem integrity... OK", delay: 400},
  { text: "Starting core system services:", delay: 200 },
  { text: "  [OK] Bidirectional Time Sync Daemon (btsd)", delay: 300 },
  { text: "  [OK] Quantum Entanglement Network Interface (qeni0)", delay: 400 },
  { text: "  [OK] Virtual Environment Supervisor (vsup)", delay: 300 },
  { text: "  [OK] Hyperspace I/O Controller (hio)", delay: 350},
  { text: "Loading user profile: 'virtual_user'", delay: 500 },
  { text: "Verifying hyperspace integrity matrix...", delay: 700 },
  { text: "Applying pending state propagations...", delay: 400},
  { text: "Virtual Partition VHD-01 ready.", delay: 300 },
  { text: "Welcome to BinaryBlocksphere Hyperspace Environment!", delay: 200}
];

export function VirtualBootSequenceScreen({ onBootComplete }: VirtualBootSequenceScreenProps) {
  const [log, setLog] = useState<string[]>([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (currentMessageIndex < bootMessages.length) {
      const { text, delay } = bootMessages[currentMessageIndex];
      const timer = setTimeout(() => {
        setLog(prev => [...prev, text]);
        setCurrentMessageIndex(prev => prev + 1);
        setProgress(Math.ceil(((currentMessageIndex + 1) / bootMessages.length) * 100));
      }, delay);
      return () => clearTimeout(timer);
    } else if (currentMessageIndex === bootMessages.length && progress === 100) {
      const finalTimer = setTimeout(onBootComplete, 800);
      return () => clearTimeout(finalTimer);
    }
  }, [currentMessageIndex, onBootComplete, progress]);

  return (
    <div className="w-full h-full p-4 font-mono text-sm bg-black text-green-400 overflow-y-auto flex flex-col rounded-md">
      <div className="flex-grow">
        {log.map((line, index) => (
          <p key={index} className="whitespace-pre leading-tight">{line}</p>
        ))}
         {currentMessageIndex < bootMessages.length && <span className="animate-pulse">_</span>}
      </div>
      <div className="mt-4 shrink-0">
        <Progress value={progress} className="w-full h-3 [&>div]:bg-green-500 bg-gray-700" />
        <p className="mt-1 text-xs text-center text-gray-300">{progress}% Complete</p>
      </div>
    </div>
  );
}
