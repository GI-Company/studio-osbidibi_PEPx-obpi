"use client";

import { Clock, Cpu, Server } from "lucide-react";
import { useEffect, useState } from "react";

export function StatusBar() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  const forwardCycle = time.getTime();
  const reverseCycle = Math.floor(Number.MAX_SAFE_INTEGER / 3) - forwardCycle; // Adjusted for display

  return (
    <div className="w-full p-2 mt-auto text-xs border-t glassmorphic border-primary/20 text-muted-foreground">
      <div className="container flex flex-wrap items-center justify-between gap-2 mx-auto md:flex-nowrap">
        <div className="flex items-center space-x-2 md:space-x-4">
          <div className="flex items-center" title="System Status">
            <Cpu className="w-3 h-3 mr-1 md:w-4 md:h-4 md:mr-1.5 text-accent" />
            <span>System: Nominal</span>
          </div>
          <div className="flex items-center" title="Virtual RAM">
            <Server className="w-3 h-3 mr-1 md:w-4 md:h-4 md:mr-1.5 text-accent" />
            <span>V-RAM: 4096 MiB</span>
          </div>
        </div>
        <div className="flex items-center" title="Bidirectional Binary Clock">
          <Clock className="w-3 h-3 mr-1 md:w-4 md:h-4 md:mr-1.5 text-accent" />
          <span>
            FC: {forwardCycle} | RC: {reverseCycle}
          </span>
        </div>
      </div>
    </div>
  );
}
