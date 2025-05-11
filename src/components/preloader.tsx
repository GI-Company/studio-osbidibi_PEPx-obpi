"use client";

import { BinaryBlocksphereIcon } from "@/components/icons/BinaryBlocksphereIcon";

export function Preloader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="p-8 rounded-lg glassmorphic">
        <div className="flex flex-col items-center space-y-6">
          <BinaryBlocksphereIcon className="w-24 h-24 animate-pulse text-primary" />
          <h1 className="text-3xl font-bold tracking-tighter radiant-text text-foreground">
            BinaryBlocksphere
          </h1>
          <p className="text-lg text-muted-foreground">Initializing Environment...</p>
          <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-accent"></div>
        </div>
      </div>
    </div>
  );
}
