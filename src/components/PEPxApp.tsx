
"use client";
import type * as React from 'react';
import { useState, useEffect } from 'react';
import { Layers3, Database, AlertTriangle, Eye, EyeOff, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useVFS, type VFSItem } from '@/contexts/VFSContext'; 

const PEPxVisualizer = () => {
  // This is a highly simplified visual placeholder for the PEPx concept.
  // A real implementation would involve complex 3D rendering (SVG/WebGL/Three.js).
  return (
    <div className="relative w-48 h-48 md:w-64 md:h-64 my-4 mx-auto" data-ai-hint="abstract data storage">
      {[...Array(3)].map((_, i) => ( // Representing 3 "planes" (X,Y,Z) conceptually
        <div
          key={`plane-${i}`}
          className="absolute rounded-full border-2 border-primary/30 animate-pulse"
          style={{
            width: `${(i + 1) * 30}%`,
            height: `${(i + 1) * 30}%`,
            top: `${50 - (i + 1) * 15}%`,
            left: `${50 - (i + 1) * 15}%`,
            animationDelay: `${i * 0.3}s`,
            animationDuration: '4s',
            opacity: 0.7 - i * 0.15,
            transform: `rotate(${i * 15}deg)`,
            background: `radial-gradient(circle, hsla(var(--accent), 0.1) 0%, hsla(var(--primary), 0.2) ${i * 20 + 30}%, transparent 100%)`
          }}
        />
      ))}
      <Layers3 className="absolute w-12 h-12 md:w-16 md:h-16 text-primary transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 opacity-80" />
       <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs text-primary radiant-text">PEPx Entanglement</span>
      </div>
    </div>
  );
};

// Conceptual total physical "pixels" or addressable units for the simulation.
// Let's define capacity in bytes directly for this simulation.
// Based on the prompt "1800px total converting at 50% load capacity per px giving ... 3600 bits"
// 3600 bits / 8 bits/byte = 450 Bytes. This seems very small for a "petabyte" concept.
// Let's assume the "petabyte" is the aspirational goal and the current simulation is on a micro scale.
// For a more engaging demo, let's use a slightly larger, but still small, conceptual capacity.
const PEPX_TOTAL_CAPACITY_BYTES = 5 * 1024 * 1024; // 5MB for this simulation's total capacity.


export function PEPxApp() {
  const { currentUser } = useAuth();
  const { fileSystem } = useVFS(); 
  const [showAdminDetails, setShowAdminDetails] = useState(false);
  const [usedStorageBytes, setUsedStorageBytes] = useState(0); 

  useEffect(() => {
    // Simulate calculating used storage based on VFS content (original file sizes)
    let totalSize = 0;
    const calculateSizeRecursive = (item: VFSItem) => {
      if (item.type === 'file' && item.size !== undefined) {
        totalSize += item.size;
      } else if (item.type === 'folder' && item.children) {
        Object.values(item.children).forEach(calculateSizeRecursive);
      }
    };
    
    if (fileSystem && fileSystem['/']) {
      calculateSizeRecursive(fileSystem['/']);
    }
    setUsedStorageBytes(totalSize);
  }, [fileSystem]);

  const formatBytes = (bytes: number, decimals = 2) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB']; // Simplified for demo
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };
  
  const formatKiBytes = (bytes: number, decimals = 2) => {
    if (!bytes || bytes === 0) return '0 Bytes'; // Keep Bytes as base
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
     if (i === 0) return `${bytes.toFixed(0)} Bytes`; // Show bytes directly if less than 1 KiB
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const usedPercentage = PEPX_TOTAL_CAPACITY_BYTES > 0 ? (usedStorageBytes / PEPX_TOTAL_CAPACITY_BYTES) * 100 : 0;
  const conceptualMinFileSize = 1; // 1 byte
  // Max file size is somewhat arbitrary for simulation, let's say 10% of total.
  const conceptualMaxFileSize = PEPX_TOTAL_CAPACITY_BYTES / 10; 

  // Simulated speeds
  const conceptualUploadSpeedMbps = 50; // Mbps
  const conceptualDownloadSpeedMbps = 100; // Mbps
  const calculateTime = (bytes: number, speedMbps: number) => {
    if (bytes === 0 || speedMbps === 0) return "0s";
    const bits = bytes * 8;
    const seconds = bits / (speedMbps * 1000000);
    if (seconds < 0.001) return "<1ms";
    if (seconds < 1) return `${(seconds * 1000).toFixed(0)}ms`;
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    return `${(seconds / 60).toFixed(1)}min`;
  };


  return (
    <div className="flex flex-col items-center justify-start w-full h-full p-4 overflow-y-auto text-center bg-transparent text-card-foreground rounded-md">
      <Card className="w-full max-w-3xl glassmorphic">
        <CardHeader>
          <div className="flex items-center justify-center mb-2">
            <Layers3 className="w-8 h-8 mr-2 text-primary" />
            <CardTitle className="text-2xl radiant-text">PEPx Interface</CardTitle>
          </div>
          <CardDescription className="radiant-text">
            Persistent Environmental Pixels - Embedded Virtual Storage &amp; Database
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <PEPxVisualizer />

          <div className="p-4 rounded-md glassmorphic !bg-background/40">
            <h4 className="mb-2 text-lg font-medium text-accent">Storage Overview</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="font-semibold text-muted-foreground">Total Capacity (Simulated):</p>
                <p className="radiant-text">{formatBytes(PEPX_TOTAL_CAPACITY_BYTES)} ({formatKiBytes(PEPX_TOTAL_CAPACITY_BYTES)})</p>
                 {/* <p className="text-xs text-muted-foreground/70">({PEPX_TOTAL_CAPACITY_BYTES * 8} bits)</p> */}
              </div>
              <div>
                <p className="font-semibold text-muted-foreground">Used Space (VFS Original Sizes):</p>
                <p className="radiant-text">{formatBytes(usedStorageBytes)} ({formatKiBytes(usedStorageBytes)})</p>
              </div>
            </div>
            <Progress value={usedPercentage} className="w-full h-3 mt-3 [&>div]:bg-primary bg-secondary" />
            <p className="mt-1 text-xs text-muted-foreground radiant-text">{usedPercentage > 100 ? '>100' : usedPercentage.toFixed(1)}% Used (Can exceed simulated capacity)</p>
          </div>

          <div className="p-4 rounded-md glassmorphic !bg-background/40">
            <h4 className="mb-2 text-lg font-medium text-accent">Performance (Conceptual)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="font-semibold text-muted-foreground">Min/Max File Size (VFS):</p>
                <p className="radiant-text">{formatBytes(conceptualMinFileSize)} / {formatBytes(conceptualMaxFileSize)}</p>
              </div>
              <div>
                <p className="font-semibold text-muted-foreground">Est. Upload Time (1MB Original):</p>
                <p className="radiant-text">{calculateTime(1024*1024, conceptualUploadSpeedMbps)} @ {conceptualUploadSpeedMbps} Mbps</p>
              </div>
              <div>
                <p className="font-semibold text-muted-foreground">Est. Download Time (1MB Original):</p>
                <p className="radiant-text">{calculateTime(1024*1024, conceptualDownloadSpeedMbps)} @ {conceptualDownloadSpeedMbps} Mbps</p>
              </div>
              <div>
                <p className="font-semibold text-muted-foreground">Integrity Check Seed:</p>
                <p className="radiant-text text-xs break-all">PEPxSeed:{currentUser?.id ? currentUser.id.substring(0,12) : 'N/A'}... (Conceptual)</p>
              </div>
            </div>
          </div>
          
          {currentUser?.role === 'superuser' && (
            <div className="p-4 rounded-md glassmorphic !bg-background/60 border border-primary/30">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-lg font-medium text-destructive flex items-center">
                  <Database className="w-5 h-5 mr-2"/> Admin: PEPx Algorithm Details (Conceptual)
                </h4>
                <Button variant="ghost" size="sm" onClick={() => setShowAdminDetails(!showAdminDetails)} className="button-3d-interactive">
                  {showAdminDetails ? <EyeOff className="w-4 h-4 mr-1.5"/> : <Eye className="w-4 h-4 mr-1.5"/>}
                  {showAdminDetails ? 'Hide' : 'Show'} Details
                </Button>
              </div>
              {showAdminDetails && (
                <div className="space-y-3 text-xs text-left text-muted-foreground p-2 border-t border-border/50">
                  <p className="radiant-text"><strong className="text-accent">Encoding Principle:</strong> Data bits are conceptually mapped to environmental pixel states. In this simulation, original file content is stored directly (`VFSItem.content`). A string representation of "PEPx encoded" data is generated (`VFSItem.pepxData`) using a seed (`VFSContext.pepxSeed`) and a basic hash of the content. This `pepxData` string is for illustrative purposes and does NOT represent actual pixel-level encoding or achieve high-density storage.</p>
                  <p className="radiant-text"><strong className="text-accent">Structure (Simulated):</strong> Files in the VFS are marked with `isPEPxEncoded=true`. Their `pepxData` field holds the conceptual encoded string. The `size` field reflects the original content size.</p>
                  <p className="radiant-text"><strong className="text-accent">Capacity & Conversion (Conceptual for this Demo):</strong></p>
                  <ul className="list-disc list-inside ml-4 radiant-text">
                    <li>Total "Physical Pixels" / Addressable units: Highly abstract. The simulation uses a byte-based `PEPX_TOTAL_CAPACITY_BYTES` for its internal storage limit visualization.</li>
                    <li>2 bits per pixel per spectrum plane: This is a design goal. The current simulation uses a string representation, not actual bit-to-pixel mapping.</li>
                    <li>The "1800px total... 3600 bits" concept is a micro-scale target for a real algorithm. This simulation models storage at a higher level.</li>
                  </ul>
                  <p className="radiant-text"><strong className="text-accent">Data Integrity (Conceptual):</strong> A unique `pepxSeed` (from localStorage) is used in the generation of the `pepxData` string. This simulates how a seed would be critical for consistent encoding/decoding.</p>
                  <p className="radiant-text"><strong className="text-accent">Rendering (Conceptual):</strong> The visualizer is a basic SVG/CSS animation. True 3D rendering of data states would require WebGL or similar, which is beyond this simulation.</p>
                  <p className="radiant-text"><strong className="text-accent">Key Point:</strong> This implementation focuses on the *concept* of PEPx within the VFS by tagging files and storing a representative string. It does not perform actual pixel manipulation or achieve the described high-density storage. This is a high-level simulation.</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="pt-4">
          <p className="text-xs text-muted-foreground/70 radiant-text">
            PEPx state is conceptually managed by the OSbidibi Core. File content is stored in original form and with a conceptual PEPx representation in VFS.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

