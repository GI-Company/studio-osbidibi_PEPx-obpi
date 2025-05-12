"use client";
import type * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Zap, Activity, Settings, AlertTriangle, Gauge } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

type AdapterStatus = "Active" | "Syncing" | "Idle" | "Error";
type PlatformProfile = "GenericSingleBinary" | "OptimizedBidirectional" | "LegacyCompatibility";

interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'warn' | 'error' | 'success';
}

export function TimesenseAdapterApp() {
  const [adapterStatus, setAdapterStatus] = useState<AdapterStatus>("Idle");
  const [currentMode, setCurrentMode] = useState<PlatformProfile>("OptimizedBidirectional");
  const [syncAccuracy, setSyncAccuracy] = useState(0); // Conceptual percentage
  const [log, setLog] = useState<LogEntry[]>([]);

  const addLogEntry = useCallback((message: string, type: LogEntry['type'] = 'info') => {
    setLog(prevLog => [{ id: Date.now().toString(), timestamp: new Date().toLocaleTimeString(), message, type }, ...prevLog.slice(0, 49)]);
  }, []);

  useEffect(() => {
    addLogEntry("Timesense Adapter Initialized. Standing by.", "info");
    setAdapterStatus("Active");
    const interval = setInterval(() => {
      setSyncAccuracy(Math.floor(Math.random() * 11) + 90); // 90-100%
      if (adapterStatus === "Active") {
         addLogEntry(`Timesense sync pulse. Accuracy: ${syncAccuracy}%. Platform: ${currentMode}`, "info");
      }
    }, 15000); // Log a sync pulse every 15 seconds
    return () => clearInterval(interval);
  }, [addLogEntry, adapterStatus, syncAccuracy, currentMode]);


  const handleSimulateOperation = () => {
    if (adapterStatus === "Error") {
        toast({ title: "Adapter Error", description: "Timesense Adapter is in an error state. Please reset.", variant: "destructive"});
        return;
    }
    setAdapterStatus("Syncing");
    addLogEntry(`Bidirectional operation [OP_${Math.floor(Math.random() * 10000)}] received.`, "info");
    toast({ title: "Operation Received", description: "Timesense Adapter processing operation..." });

    setTimeout(() => {
      addLogEntry(`Compiling [OP_${Math.floor(Math.random() * 10000)}] for platform profile [${currentMode}]...`, "info");
      setTimeout(() => {
        const success = Math.random() > 0.1; // 90% success rate
        if (success) {
          addLogEntry(`Operation [OP_${Math.floor(Math.random() * 10000)}] dispatched to platform. Timesense delta: ${Math.floor(Math.random() * 50)}ms.`, "success");
          toast({ title: "Operation Adapted", description: "Operation successfully adapted and dispatched." });
          setAdapterStatus("Active");
        } else {
          addLogEntry(`Error adapting operation for [${currentMode}]. Timesense desync detected.`, "error");
          toast({ title: "Adaptation Error", description: "Failed to adapt operation. Check logs.", variant: "destructive"});
          setAdapterStatus("Error");
        }
      }, 1200 + Math.random() * 800);
    }, 800 + Math.random() * 500);
  };

  const handleResetAdapter = () => {
    addLogEntry("Timesense Adapter reset sequence initiated.", "warn");
    setAdapterStatus("Idle");
    setCurrentMode("OptimizedBidirectional");
    setSyncAccuracy(0);
    setLog([]); // Clear logs on reset
    setTimeout(() => {
      addLogEntry("Timesense Adapter Initialized. Standing by.", "info");
      setAdapterStatus("Active");
      toast({ title: "Adapter Reset", description: "Timesense Adapter has been reset." });
    }, 1000);
  };

  const getStatusColor = (status: AdapterStatus) => {
    switch (status) {
      case "Active": return "text-green-400";
      case "Syncing": return "text-blue-400 animate-pulse";
      case "Idle": return "text-yellow-400";
      case "Error": return "text-red-500";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="flex flex-col w-full h-full p-2 md:p-4 bg-card text-card-foreground rounded-md overflow-hidden">
      <CardHeader className="pb-3 text-center">
        <div className="flex items-center justify-center mb-2">
          <Zap className="w-8 h-8 mr-2 text-primary" />
          <CardTitle className="text-2xl radiant-text">Bidibi Timesense Adapter</CardTitle>
        </div>
        <CardDescription className="radiant-text">
          Synchronizes and adapts Bidibi operations for various platform profiles.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-grow p-2 space-y-4 overflow-hidden flex flex-col">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 rounded-md glassmorphic !bg-background/30 mb-2">
          <div>
            <Label className="text-sm text-muted-foreground radiant-text">Adapter Status</Label>
            <p className={`text-lg font-semibold ${getStatusColor(adapterStatus)} radiant-text`}>{adapterStatus}</p>
          </div>
          <div>
            <Label className="text-sm text-muted-foreground radiant-text">Current Platform Profile</Label>
             <Select value={currentMode} onValueChange={(value: PlatformProfile) => {
                setCurrentMode(value);
                addLogEntry(`Platform profile changed to: ${value}`, "warn");
             }} disabled={adapterStatus === "Syncing"}>
                <SelectTrigger className="mt-1 bg-input/70 focus:bg-input text-sm h-9">
                  <SelectValue placeholder="Select profile" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OptimizedBidirectional">Optimized Bidirectional</SelectItem>
                  <SelectItem value="GenericSingleBinary">Generic Single Binary</SelectItem>
                  <SelectItem value="LegacyCompatibility">Legacy Compatibility</SelectItem>
                </SelectContent>
              </Select>
          </div>
          <div>
            <Label className="text-sm text-muted-foreground radiant-text">Timesense Sync Accuracy</Label>
            <div className="flex items-center mt-1">
                 <Gauge className="w-5 h-5 mr-2 text-primary"/>
                 <p className="text-lg font-semibold text-primary radiant-text">{syncAccuracy}%</p>
            </div>
          </div>
        </div>

        <div className="flex space-x-2 mb-2">
            <Button onClick={handleSimulateOperation} className="button-3d-interactive" disabled={adapterStatus === "Syncing" || adapterStatus === "Error"}>
                <Activity className="w-4 h-4 mr-2"/> Simulate Bidirectional Op
            </Button>
            <Button onClick={handleResetAdapter} variant="destructive" className="button-3d-interactive">
                <Settings className="w-4 h-4 mr-2"/> Reset Adapter
            </Button>
        </div>
        
        {adapterStatus === "Error" && (
             <div className="p-3 my-2 rounded-md border border-destructive bg-destructive/10 text-destructive flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2"/>
                <p className="text-sm">Adapter in error state. Operations may fail. Please reset the adapter.</p>
            </div>
        )}

        <Label className="text-sm font-medium text-accent radiant-text">Activity Log:</Label>
        <ScrollArea className="flex-grow p-2 border rounded-md glassmorphic !bg-background/40 font-mono text-xs">
          {log.length === 0 && <p className="text-muted-foreground text-center py-4">No activity yet.</p>}
          {log.map(entry => (
            <div key={entry.id} className={`mb-1.5 p-1 rounded-sm ${
              entry.type === 'error' ? 'bg-destructive/20 text-destructive' :
              entry.type === 'warn' ? 'bg-yellow-500/20 text-yellow-300' :
              entry.type === 'success' ? 'bg-green-500/20 text-green-300' :
              'text-muted-foreground'
            }`}>
              <span className="mr-2 opacity-70">{entry.timestamp}</span>
              <span>{entry.message}</span>
            </div>
          ))}
        </ScrollArea>
      </CardContent>

      <CardFooter className="p-2 text-xs text-center text-muted-foreground/70 border-t border-primary/20">
        Timesense Adapter ensures operational integrity across diverse execution environments.
      </CardFooter>
    </div>
  );
}
