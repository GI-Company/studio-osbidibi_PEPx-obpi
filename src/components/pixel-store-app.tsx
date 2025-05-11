
"use client";
import type * as React from 'react';
import { Layers3 } from 'lucide-react';

const PixelSphereAnimation = () => (
  <div className="relative w-48 h-48 md:w-64 md:h-64 my-4" data-ai-hint="abstract data spheres">
    {[...Array(5)].map((_, i) => (
      <div
        key={i}
        className="absolute rounded-full border-2 border-accent/50 animate-pulse"
        style={{
          width: `${(i + 1) * 20}%`,
          height: `${(i + 1) * 20}%`,
          top: `${50 - (i + 1) * 10}%`,
          left: `${50 - (i + 1) * 10}%`,
          animationDelay: `${i * 0.2}s`,
          animationDuration: '3s',
          opacity: 0.8 - i * 0.1,
          background: `radial-gradient(circle, hsla(var(--primary), 0.1) 0%, hsla(var(--accent), 0.3) 70%, transparent 100%)`
        }}
      />
    ))}
    <Layers3 className="absolute w-16 h-16 text-primary transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 opacity-70" />
  </div>
);


export function PixelStoreApp() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4 overflow-y-auto text-center bg-card text-card-foreground rounded-md">
      <div className="max-w-2xl">
        <h3 className="mb-3 text-xl font-semibold md:text-2xl radiant-text text-primary">
          BBS Quantum PixelStorage Interface
        </h3>
        <p className="mb-4 text-sm text-muted-foreground md:text-base">
          Operational Overview of BinaryBlocksphere's Advanced Storage Architecture.
        </p>
        
        <PixelSphereAnimation />

        <div className="p-4 my-4 rounded-md glassmorphic bg-background/30">
          <h4 className="mb-2 text-lg font-medium text-accent">Core Operational Principles:</h4>
          <ul className="space-y-2 text-xs text-left list-disc list-inside md:text-sm text-foreground/90">
            <li>Data is encoded into multi-dimensional pixel states on a quantum-entangled canvas.</li>
            <li>Each "sphere" or "block" represents a hyper-compressed, addressable data unit.</li>
            <li>This architecture provides for petabytes of data storage within a minimal logical footprint.</li>
            <li>Dynamic conversion between bitstream and pixel-state is managed by the BBS Core runtime.</li>
            <li>On-exit or archival, data is reconceptualized into its pixelated form for persistent storage integrity.</li>
          </ul>
        </div>

        <div className="grid grid-cols-1 gap-3 p-3 my-4 text-xs rounded-md md:grid-cols-2 md:text-sm glassmorphic bg-background/30">
          <div className="p-2 rounded bg-secondary/30">
            <p className="font-semibold text-accent">Design Capacity:</p>
            <p className="radiant-text">~7.2 Zettabytes (ZB)</p>
          </div>
          <div className="p-2 rounded bg-secondary/30">
            <p className="font-semibold text-accent">Active Quantum Spheres:</p>
            <p className="radiant-text">1,234,567,890 (Managed)</p>
          </div>
          <div className="p-2 rounded bg-secondary/30 md:col-span-2">
            <p className="font-semibold text-accent">Storage Medium:</p>
            <p>3D Quantum HTML Canvas (BBS Proprietary)</p>
          </div>
        </div>
        
        <p className="mt-4 text-xs text-muted-foreground/70">
          Note: This interface provides a high-level visualization of the PixelStore architecture.
          Bit-to-pixel encoding and petabyte-scale storage are integral BBS Core processes, represented here.
        </p>
      </div>
    </div>
  );
}
