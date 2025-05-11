"use client";

import { Terminal } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CommandOutput {
  id: string;
  type: "input" | "output" | "error";
  text: string;
  prompt?: string;
}

const initialWelcomeMessage: CommandOutput = {
  id: Date.now().toString(),
  type: "output",
  text: "Welcome to BinaryBlocksphere v0.1.0\nType 'help' for a list of available commands.",
};

const coreFeatures = [
  "System Initialization", "Binary Fold", "Change Propagation", 
  "Virtual Driver (Z-plane)", "SHELL EMULATION", "PERSONAL ENV", "VIRTUAL RAM", 
  "VIRTUAL DRIVER", "POWERSHELL LINUX AND DARWIN INTERPERATOR ALL IN WONE", 
  "OWN NATIVE ENV", "DESKTOP GUI ENV", 
  "ISOLATED ROOT WITH FILESYSTEM DISGNED FOR ITS NATIVE COSS PATFORM ENV", 
  "RUNS IN BROWSER OR OVER THE TOP OF OTHER OS WITH ITS OWN ISOLATED ROOT", 
  "VIRTUAL CLOCK DESIGNED FOR BI DIRECTIONAL BINARY TIMING"
];

export function ShellEmulator() {
  const [history, setHistory] = useState<CommandOutput[]>([initialWelcomeMessage]);
  const [inputValue, setInputValue] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const prompt = "BBS:~$ ";

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (viewport) viewport.scrollTop = viewport.scrollHeight;
    }
  }, [history]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleCommand = (command: string) => {
    const newHistoryEntry: CommandOutput = { 
      id: `${Date.now()}-input-${Math.random()}`, 
      type: "input", 
      text: command, 
      prompt 
    };

    setHistory(prev => [...prev, newHistoryEntry]);
    
    let outputText = "";
    let outputType: CommandOutput["type"] = "output";

    const [cmd, ...args] = command.trim().split(" ");

    switch (cmd.toLowerCase()) {
      case "help":
        outputText = "Available commands:\n" +
          "  help          - Show this help message\n" +
          "  clear         - Clear the terminal screen\n" +
          "  date          - Display the current system time\n" +
          "  features      - List core system features\n" +
          "  status [feat] - Show status of a feature (e.g., status 'VIRTUAL RAM')\n" +
          "  echo [text]   - Display a line of text\n" +
          "  whoami        - Display current user (guest)\n" +
          "  sysinit       - Simulate system initialization\n" +
          "  fold          - Simulate binary fold operation";
        break;
      case "clear":
        setHistory([initialWelcomeMessage]);
        setInputValue("");
        return;
      case "date":
        const now = new Date();
        outputText = `Current Bidirectional Binary Time:\n`+
                     `Forward Cycle: ${now.getTime()}\n` +
                     `Reverse Cycle: ${Math.floor(Number.MAX_SAFE_INTEGER / 2) - now.getTime()}\n` +
                     `Standard Time: ${now.toLocaleString()}`;
        break;
      case "features":
        outputText = "BinaryBlocksphere Core Features:\n" + coreFeatures.map(f => `  - ${f}`).join("\n");
        break;
      case "status":
        const featureQuery = args.join(" ").toLowerCase();
        const foundFeature = coreFeatures.find(f => f.toLowerCase().includes(featureQuery));
        if (foundFeature) {
          outputText = `Status of '${foundFeature}': Active and Nominal.`;
        } else if (featureQuery) {
          outputText = `Feature '${args.join(" ")}' not recognized. Type 'features' to see available features.`;
          outputType = "error";
        } else {
          outputText = "Usage: status [feature_name]";
          outputType = "error";
        }
        break;
      case "echo":
        outputText = args.join(" ");
        break;
      case "whoami":
        outputText = "guest";
        break;
      case "sysinit":
        outputText = "Initializing Bidirectional Binary System...\nState Matrix constructed (3D)...\nVirtual drivers loaded...\nSystem ready.";
        break;
      case "fold":
        outputText = "Performing binary fold operation...\nError correction routines initiated...\nChange propagation to adjacent nodes pending...\nFold complete.";
        break;
      default:
        if (command.trim() === "") {
           // No output for empty command, just new prompt line
           setInputValue("");
           return; 
        }
        outputText = `Command not found: ${cmd}. Type 'help' for available commands.`;
        outputType = "error";
    }
    
    const newOutputEntry: CommandOutput = { 
      id: `${Date.now()}-output-${Math.random()}`, 
      type: outputType, 
      text: outputText 
    };
    setHistory(prev => [...prev, newOutputEntry]);
    setInputValue("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCommand(inputValue);
  };

  const handleTerminalClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div 
      className="w-full max-w-4xl h-[70vh] md:h-[600px] glassmorphic rounded-lg shadow-2xl flex flex-col overflow-hidden border border-primary/30"
      onClick={handleTerminalClick}
    >
      <div className="flex items-center p-3 bg-black/40 border-b border-primary/20">
        <Terminal className="w-5 h-5 mr-2 text-primary" />
        <h2 className="text-sm font-medium text-foreground">BinaryBlocksphere Terminal</h2>
      </div>
      <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
        <div className="space-y-2">
          {history.map((item) => (
            <div key={item.id} className="font-mono text-sm leading-relaxed">
              {item.type === "input" && (
                <div>
                  <span className="radiant-text" style={{ color: 'var(--shell-prompt-color)' }}>{item.prompt}</span>
                  <span className="radiant-text text-foreground">{item.text}</span>
                </div>
              )}
              {item.type === "output" && (
                <pre className="whitespace-pre-wrap radiant-text text-foreground">{item.text}</pre>
              )}
              {item.type === "error" && (
                <pre className="whitespace-pre-wrap text-destructive">{item.text}</pre>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
      <form onSubmit={handleSubmit} className="p-2 border-t border-primary/20 bg-black/20">
        <div className="flex items-center">
          <span className="pl-2 pr-1 font-mono text-sm radiant-text" style={{ color: 'var(--shell-prompt-color)' }}>{prompt}</span>
          <Input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-grow p-0 text-sm bg-transparent border-none shadow-none radiant-text text-foreground focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50"
            placeholder="Type a command..."
            autoComplete="off"
            spellCheck="false"
          />
        </div>
      </form>
    </div>
  );
}
