"use client";
import type * as React from 'react';
import { useState } from 'react';
import { VirtualBiosScreen } from './virtual-bios';
import { VirtualBootSequenceScreen } from './virtual-boot-sequence';
import { Button } from '@/components/ui/button';
import { PowerIcon, RefreshCcwIcon } from 'lucide-react';

type BootStage = 'off' | 'bios' | 'booting' | 'booted' | 'shutting_down';

export function VirtualPartitionApp() {
  const [bootStage, setBootStage] = useState<BootStage>('off');
  const [instanceKey, setInstanceKey] = useState(Date.now()); // Used to reset child components

  const handleStartBoot = () => {
    setInstanceKey(Date.now()); // Reset child components on new boot
    setBootStage('bios');
  };

  const handleBiosContinue = () => {
    setBootStage('booting');
  };

  const handleBootComplete = () => {
    setBootStage('booted');
  };

  const handleShutdown = () => {
    setBootStage('shutting_down');
    setTimeout(() => {
      setBootStage('off');
    }, 2000); // Simulate shutdown delay
  };
  
  const handleReboot = () => {
    setBootStage('shutting_down');
    setTimeout(() => {
        setInstanceKey(Date.now());
        setBootStage('bios');
    }, 1500);
  };


  if (bootStage === 'off') {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full p-4 text-center bg-card text-card-foreground rounded-md">
        <h3 className="mb-4 text-xl font-semibold">Virtual Partition Manager</h3>
        <p className="mb-6 text-muted-foreground">The virtual partition VHD-01 is currently powered off.</p>
        <Button onClick={handleStartBoot} size="lg" className="bg-green-600 hover:bg-green-700 text-white">
          <PowerIcon className="w-5 h-5 mr-2" />
          Power On
        </Button>
      </div>
    );
  }

  if (bootStage === 'bios') {
    return <VirtualBiosScreen key={`bios-${instanceKey}`} onContinue={handleBiosContinue} />;
  }

  if (bootStage === 'booting') {
    return <VirtualBootSequenceScreen key={`boot-${instanceKey}`} onBootComplete={handleBootComplete} />;
  }

  if (bootStage === 'booted') {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full p-4 text-center bg-black text-green-300 rounded-md">
        <h3 className="mb-4 text-2xl font-semibold">VHD-01 Online</h3>
         <pre className="p-4 mb-6 text-xs text-left whitespace-pre-wrap bg-gray-800 rounded-md text-green-400 max-w-md w-full overflow-auto max-h-60">
          {`BinaryBlocksphere Hyperspace Environment (BHE)
Kernel: BBSK v3.1.4 (stable)
CPU: BBS Quantum Entangler @ 4.0 BHz (Virtual)
Memory: 16384 MB (Virtual)
Disk: /dev/vhd01 @ / (bbsfs)
Network: qeni0 (UP, RUNNING)
Status: All systems nominal. Ready for operations.
Type 'bbs_diag' for system diagnostics.
Type 'bbs_connect <service_uri>' to link services.`}
        </pre>
        <p className="text-xs text-gray-400 mb-6">
            (This is a highly interactive simulated environment. <br/>Further applications and interactions would be integrated here.)
        </p>
        <div className="flex space-x-4">
          <Button onClick={handleReboot} variant="outline" size="lg" className="text-yellow-400 border-yellow-400 hover:bg-yellow-400 hover:text-black">
            <RefreshCcwIcon className="w-5 h-5 mr-2" />
            Reboot
          </Button>
          <Button onClick={handleShutdown} variant="destructive" size="lg">
            <PowerIcon className="w-5 h-5 mr-2" />
            Shutdown
          </Button>
        </div>
      </div>
    );
  }
  
  if (bootStage === 'shutting_down') {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full p-4 font-mono text-sm text-center bg-black text-orange-400 rounded-md">
        <p>System is shutting down...</p>
        <p className="mt-2">Unmounting filesystems...</p>
        <p>Saving hyperspace state to VHD-01...</p>
        <p className="mt-4">Powering off virtual hardware...</p>
        <div className="w-16 h-16 mt-6 border-4 border-dashed rounded-full animate-spin border-orange-500"></div>
      </div>
    );
  }

  return null; 
}
