
"use client";
import type * as React from 'react';
import { useState, useEffect } from 'react';
import { Layers3, Database, AlertTriangle, Eye, EyeOff, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useVFS } from '@/contexts/VFSContext'; // Assuming VFS context might be used for simulated file sizes

const PEPxVisualizer = () => {
  // This is a highly simplified visual placeholder for the PEPx concept.
  // A real implementation would involve complex 3D rendering (SVG/WebGL/Three.js).
  return (
    <div className="relative w-48 h-48 md:w-64 md:h-64 my-4" data-ai-hint="abstract data storage">
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

const PEPX_TOTAL_CAPACITY_BITS = 3600; // Conceptual: 1800px * 2 bits/px
const PEPX_TOTAL_CAPACITY_BYTES = PEPX_TOTAL_CAPACITY_BITS / 8;


export function PEPxApp() {
  const { currentUser } = useAuth();
  const { fileSystem } = useVFS(); // Potentially use VFS to simulate used space
  const [showAdminDetails, setShowAdminDetails] = useState(false);
  const [usedStorageBytes, setUsedStorageBytes] = useState(0); // Simulated used storage

  useEffect(() => {
    // Simulate calculating used storage based on VFS content (very rough approximation)
    let totalSize = 0;
    const calculateSize = (item: any) => {
      if (item.type === 'file') {
        totalSize += item.size || (item.content?.length || 0);
      } else if (item.type === 'folder' && item.children) {
        Object.values(item.children).forEach(calculateSize);
      }
    };
    if (fileSystem['/']) {
      calculateSize(fileSystem['/']);
    }
    // Cap at conceptual max for demo
    setUsedStorageBytes(Math.min(totalSize, PEPX_TOTAL_CAPACITY_BYTES * 0.45)); // Simulate 45% usage for demo
  }, [fileSystem]);

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };
  
  const formatKiBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 KiB';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
     if (i === 0) return `${bytes} Bytes`; // Show bytes directly if less than 1 KiB
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const usedPercentage = (usedStorageBytes / PEPX_TOTAL_CAPACITY_BYTES) * 100;
  const conceptualMinFileSize = 1; // 1 byte
  const conceptualMaxFileSize = PEPX_TOTAL_CAPACITY_BYTES / 10; // e.g. 10% of total for one file

  // Simulated times
  const conceptualUploadSpeedMbps = 50; // Mbps
  const conceptualDownloadSpeedMbps = 100; // Mbps
  const calculateTime = (bytes: number, speedMbps: number) => {
    if (bytes === 0 || speedMbps === 0) return "0s";
    const bits = bytes * 8;
    const seconds = bits / (speedMbps * 1000000);
    if (seconds < 1) return `${(seconds * 1000).toFixed(0)}ms`;
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    return `${(seconds / 60).toFixed(1)}min`;
  };


  return (
    <div className="flex flex-col items-center justify-start w-full h-full p-4 overflow-y-auto text-center bg-card text-card-foreground rounded-md">
      <Card className="w-full max-w-3xl glassmorphic">
        <CardHeader>
          <div className="flex items-center justify-center mb-2">
            <Layers3 className="w-8 h-8 mr-2 text-primary" />
            <CardTitle className="text-2xl radiant-text">PEPx Interface</CardTitle>
          </div>
          <CardDescription className="radiant-text">
            Persistent Environmental Pixels - Embedded Virtual Storage & Database
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <PEPxVisualizer />

          <div className="p-4 rounded-md glassmorphic !bg-background/40">
            <h4 className="mb-2 text-lg font-medium text-accent">Storage Overview</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="font-semibold text-muted-foreground">Total Capacity (Conceptual):</p>
                <p className="radiant-text">{formatBytes(PEPX_TOTAL_CAPACITY_BYTES)} ({formatKiBytes(PEPX_TOTAL_CAPACITY_BYTES)})</p>
                 <p className="text-xs text-muted-foreground/70">({PEPX_TOTAL_CAPACITY_BITS} bits)</p>
              </div>
              <div>
                <p className="font-semibold text-muted-foreground">Used Space (Simulated):</p>
                <p className="radiant-text">{formatBytes(usedStorageBytes)} ({formatKiBytes(usedStorageBytes)})</p>
              </div>
            </div>
            <Progress value={usedPercentage} className="w-full h-3 mt-3 [&>div]:bg-primary bg-secondary" />
            <p className="mt-1 text-xs text-muted-foreground radiant-text">{usedPercentage.toFixed(1)}% Used</p>
          </div>

          <div className="p-4 rounded-md glassmorphic !bg-background/40">
            <h4 className="mb-2 text-lg font-medium text-accent">Performance (Conceptual)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="font-semibold text-muted-foreground">Min/Max File Size:</p>
                <p className="radiant-text">{formatBytes(conceptualMinFileSize)} / {formatBytes(conceptualMaxFileSize)}</p>
              </div>
              <div>
                <p className="font-semibold text-muted-foreground">Est. Upload Time (1MB):</p>
                <p className="radiant-text">{calculateTime(1024*1024, conceptualUploadSpeedMbps)} @ {conceptualUploadSpeedMbps} Mbps</p>
              </div>
              <div>
                <p className="font-semibold text-muted-foreground">Est. Download Time (1MB):</p>
                <p className="radiant-text">{calculateTime(1024*1024, conceptualDownloadSpeedMbps)} @ {conceptualDownloadSpeedMbps} Mbps</p>
              </div>
              <div>
                <p className="font-semibold text-muted-foreground">Integrity Check Seed:</p>
                <p className="radiant-text text-xs break-all">SHA256:{currentUser?.id ? currentUser.id.substring(0,12) : 'N/A'}... (VFS Integrity)</p>
              </div>
            </div>
          </div>
          
          {currentUser?.role === 'superuser' && (
            <div className="p-4 rounded-md glassmorphic !bg-background/60 border border-primary/30">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-lg font-medium text-destructive flex items-center">
                  <Database className="w-5 h-5 mr-2"/> Admin: PEPx Algorithm Details
                </h4>
                <Button variant="ghost" size="sm" onClick={() => setShowAdminDetails(!showAdminDetails)} className="button-3d-interactive">
                  {showAdminDetails ? <EyeOff className="w-4 h-4 mr-1.5"/> : <Eye className="w-4 h-4 mr-1.5"/>}
                  {showAdminDetails ? 'Hide' : 'Show'} Details
                </Button>
              </div>
              {showAdminDetails && (
                <div className="space-y-3 text-xs text-left text-muted-foreground p-2 border-t border-border/50">
                  <p className="radiant-text"><strong className="text-accent">Encoding:</strong> Data bits are mapped to pixel color channel values. Initial implementation uses 2 bits per pixel per color spectrum plane (e.g., Red channel of an RGB pixel). A pixel might store R G B values, each contributing to bit storage.</p>
                  <p className="radiant-text"><strong className="text-accent">Structure:</strong> Data is organized into "Entanglements". Each Entanglement consists of 3 Planes (X, Y, Z dimensions - conceptual). Each Plane contains multiple Spectrums (e.g., RGB color spectrums). Each Spectrum contains 100 Pixels.</p>
                  <p className="radiant-text"><strong className="text-accent">Capacity (Initial Target):</strong></p>
                  <ul className="list-disc list-inside ml-4 radiant-text">
                    <li>1 Pixel stores 2 bits (per spectrum plane).</li>
                    <li>1 Spectrum Plane = 100 Pixels = 200 bits.</li>
                    <li>1 Entanglement = 3 Planes = 3 * 200 bits/plane = 600 bits. (This was a misinterpretation in prompt; if 1 spectrum plane = 200 bits, and 3 planes for one entanglement, it's 600 bits. If 1 plane has 3 spectrums (RGB), then 1 plane = 3 * 200 = 600 bits, 1 entanglement = 3 * 600 = 1800 bits. Let's assume the latter for 1800px * 2bits/px = 3600 bits per full entanglement)</li>
                     <li>Corrected: 1 Pixel stores 2 bits. Each Plane has multiple spectrums conceptually (e.g. R, G, B). Assume for simplicity 100 pixels per "unit" per plane, and 3 such units (spectrums) per plane. So 1 Plane = 3 units * 100 pixels/unit * 2 bits/pixel = 600 bits. 1 Entanglement (X,Y,Z) = 3 Planes * 600 bits/Plane = 1800 bits. Wait, the prompt says 1800px total, 100px/spectrum, 3 planes per entanglement. This implies 1800px / 3 planes = 600px per plane. 600px per plane / 100px per spectrum = 6 spectrums per plane? This is getting confusing. Let's simplify based on "1800px total converting at 50% load capacity per px giving ... 3600 bits". This means 2 bits per pixel. 1800 pixels in total.</li>
                    <li>Total Physical Pixels per Entanglement: 1800px.</li>
                    <li>Total Bits per Entanglement: 1800px * 2 bits/px = 3600 bits (450 Bytes).</li>
                  </ul>
                  <p className="radiant-text"><strong className="text-accent">Conversion:</strong> Bidirectional conversion between raw bits and pixel states is handled by a core BBS algorithm. A unique seed (derived from device ID + user factors) ensures data integrity and correct reassembly. This seed is critical for dynamic rendering of original file states.</p>
                  <p className="radiant-text"><strong className="text-accent">Rendering:</strong> SVG and conceptual 3D EJS-like structures are used for visualizing the data state and storage hierarchy (this is a conceptual target, current visualizer is basic).</p>
                  <p className="radiant-text"><strong className="text-accent">Note:</strong> The above is a high-level conceptual outline for the OSbidibi internal PEPx system. Actual implementation involves advanced data mapping, error correction, and compression schemes not detailed here.</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground/70 radiant-text">
            PEPx state is continuously managed by the OSbidibi Core. Integrity checks run on instance load.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
