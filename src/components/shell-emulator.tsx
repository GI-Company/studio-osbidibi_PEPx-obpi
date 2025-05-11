
"use client";

import { Terminal } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CommandOutput {
  id: string;
  type: "input" | "output" | "error" | "warning";
  text: string;
  prompt?: string;
}

const initialWelcomeMessage: CommandOutput = {
  id: Date.now().toString(),
  type: "output",
  text: "Welcome to BinaryBlocksphere v0.3.0\nType 'help' for a list of available commands.\nType 'desktop' to launch the Graphical Desktop Environment.",
};

const initialCoreFeatures = [
  "System Initialization", "Binary Fold", "Change Propagation", 
  "Virtual Driver (Z-plane)", "SHELL EMULATION", "PERSONAL ENV", "VIRTUAL RAM", 
  "VIRTUAL DRIVER", 
  "Integrated Development Environment (C, C++, C#, ASM, PowerShell, Unix Shell - Simulated)",
  "POWERSHELL LINUX AND DARWIN INTERPERATOR ALL IN WONE (simulated via pkg & direct commands)", 
  "OWN NATIVE ENV", 
  "Graphical Desktop Environment (GDE) with App Launcher (via 'desktop' command)",
  "Web Browser with multi-search engine support (in GDE)",
  "Virtual Partition Manager (in GDE, with BIOS & boot sequence)",
  "PixelStore Quantum Storage (Conceptual, in GDE)",
  "Actual Web Requests (curl/wget with browser fetch, CORS limitations apply)",
  "ISOLATED ROOT WITH FILESYSTEM DISGNED FOR ITS NATIVE COSS PATFORM ENV (simulated)", 
  "RUNS IN BROWSER OR OVER THE TOP OF OTHER OS WITH ITS OWN ISOLATED ROOT (conceptual)", 
  "VIRTUAL CLOCK DESIGNED FOR BI DIRECTIONAL BINARY TIMING",
  "Networking Utilities (curl, wget - actual fetch attempts)",
  "Unified Package Manager (pkg - simulated)",
  "Cross-Platform Hybrid Compilation (bbs-script - simulated)",
  "Internet & Localhost Connectivity (connect - simulated, curl/wget - actual fetch attempts)",
  "Factory Reset (factory-reset command)",
];

const availablePackages = ["powershell", "darwin-tools", "linux-core", "web-utils", "bbs-dev-kit", "gui-tools", "c-compiler", "cpp-compiler", "csharp-sdk", "assembler-tools"];

interface ShellEmulatorProps {
  onOpenDesktop: () => void;
}

export function ShellEmulator({ onOpenDesktop }: ShellEmulatorProps) {
  const [history, setHistory] = useState<CommandOutput[]>([initialWelcomeMessage]);
  const [inputValue, setInputValue] = useState("");
  const [installedPackages, setInstalledPackages] = useState<string[]>(["core-utils", "c-compiler", "cpp-compiler", "csharp-sdk", "assembler-tools"]);
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

  const handleCommand = async (command: string) => {
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
        outputText = "BinaryBlocksphere v0.3.0 - Available Commands:\n" +
          "  help                       - Show this help message\n" +
          "  clear                      - Clear the terminal screen\n" +
          "  date                       - Display the current system time\n" +
          "  features                   - List core system features\n" +
          "  status [feat]              - Show status of a feature (e.g., status 'VIRTUAL RAM')\n" +
          "  echo [text]                - Display a line of text\n" +
          "  whoami                     - Display current user (guest)\n" +
          "  sysinit                    - Simulate system initialization\n" +
          "  fold                       - Simulate binary fold operation\n" +
          "  curl <url>                 - Transfer data from a server (uses browser fetch)\n" +
          "  wget <url>                 - Download files from network (uses browser fetch, save simulated)\n" +
          "  connect <address>          - Connect to a network address (simulated)\n" +
          "  pkg install <name>         - Install a package (e.g., powershell, c-compiler)\n" +
          "  pkg remove <name>          - Remove an installed package\n" +
          "  pkg list                   - List installed packages\n" +
          "  pkg update                 - Update all packages (simulated)\n" +
          "  bbs-script \"<instruction>\" - Execute a natural language script (simulated)\n" +
          "  desktop                    - Initialize the Graphical Desktop Environment (GDE)\n" +
          "  launch <app_name>          - Launch an application (use GDE for app launching)\n" +
          "  factory-reset              - Resets the shell to its initial state\n" +
          "Development Commands (Simulated):\n" +
          "  gcc <file.c> [options]     - Compile C code (e.g., gcc main.c -o main)\n" +
          "  g++ <file.cpp> [options]   - Compile C++ code (e.g., g++ app.cpp -o app)\n" +
          "  csharp <file.cs> [options] - Compile/Run C# code (e.g., csharp run main.cs)\n" +
          "  asm <file.asm> [options]   - Assemble assembly code (e.g., asm boot.asm -f bin -o boot.bin)\n" +
          "  pwsh [script.ps1]          - Run PowerShell command or script\n" +
          "  unix_shell [command]       - Run a generic Unix shell command (e.g., unix_shell ls -la)";
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
        outputText = "BinaryBlocksphere Core Features:\n" + initialCoreFeatures.map(f => `  - ${f}`).join("\n");
        break;
      case "status":
        const featureQuery = args.join(" ").toLowerCase();
        const foundFeature = initialCoreFeatures.find(f => f.toLowerCase().includes(featureQuery));
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
        outputText = "Initializing Bidirectional Binary System...\nState Matrix constructed (3D)...\nVirtual drivers loaded...\nCore services (networking, pkg, bbs-script, IDE tools) started...\nSystem ready.";
        break;
      case "fold":
        outputText = "Performing binary fold operation...\nError correction routines initiated...\nChange propagation to adjacent nodes pending...\nFold complete.";
        break;
      case "curl":
      case "wget":
        if (args.length === 0) {
          outputText = `Usage: ${cmd.toLowerCase()} <url>\nNote: Uses browser's fetch API. Subject to CORS limitations.`;
          outputType = "error";
        } else {
          const url = args[0];
          outputText = `Attempting to fetch ${url} using browser's fetch API...\n`;
          try {
            const response = await fetch(url, { mode: 'cors' }); // Added mode: 'cors'
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            const contentType = response.headers.get("content-type");
            if (contentType && (contentType.includes("application/json") || contentType.includes("text/html") || contentType.includes("text/plain"))) {
              const data = await response.text();
              outputText += `Response from ${url} (first 500 chars):\n${data.substring(0,500)}\n...\n`;
            } else {
               outputText += `Received binary data or non-text content from ${url}. Cannot display directly.\n`;
            }
            if (cmd.toLowerCase() === "wget") {
              const fileName = url.substring(url.lastIndexOf('/') + 1) || "index.html";
              outputText += `Simulated save to '/virtual_fs/downloads/${fileName}'. Content fetched.`;
            }
          } catch (error: any) {
            outputText += `Error fetching ${url}: ${error.message}\nThis might be due to CORS policy or network issues.`;
            outputType = "error";
          }
        }
        break;
      case "connect":
        if (args.length === 0) {
          outputText = "Usage: connect <address>";
          outputType = "error";
        } else {
          const address = args[0];
          if (address.includes("localhost:") || address.match(/^(\d{1,3}\.){3}\d{1,3}:\d+$/)) { // Basic localhost or IP:port check
            outputText = `Attempting to connect to ${address}...\nSuccessfully connected to local service on ${address}. (Simulated)`;
          } else {
            outputText = `Establishing connection to ${address}...\nSecure connection established to ${address}. (Simulated)`;
          }
        }
        break;
      case "pkg":
        if (args.length === 0) {
          outputText = "Usage: pkg [install|remove|list|update] [package_name]";
          outputType = "error";
        } else {
          const subCmd = args[0].toLowerCase();
          const pkgName = args[1];
          switch (subCmd) {
            case "install":
              if (!pkgName) {
                outputText = "Usage: pkg install <package_name>";
                outputType = "error";
              } else if (installedPackages.includes(pkgName)) {
                outputText = `Package '${pkgName}' is already installed.`;
                outputType = "warning";
              } else if (availablePackages.includes(pkgName)) {
                setInstalledPackages(prev => [...prev, pkgName]);
                outputText = `Installing '${pkgName}'...\nPackage '${pkgName}' downloaded from BBS Central Repository.\nConfiguring '${pkgName}'...\n'${pkgName}' installed successfully.`;
              } else {
                outputText = `Package '${pkgName}' not found in repositories. Available: ${availablePackages.join(', ')}`;
                outputType = "error";
              }
              break;
            case "remove":
              if (!pkgName) {
                outputText = "Usage: pkg remove <package_name>";
                outputType = "error";
              } else if (["core-utils", "c-compiler", "cpp-compiler", "csharp-sdk", "assembler-tools"].includes(pkgName) && args[2] !== "--force") {
                outputText = `Warning: '${pkgName}' is a core development package. Removing it might impact system stability. Use 'pkg remove ${pkgName} --force' to proceed.`;
                outputType = "warning";
              } else if (pkgName === "core-utils") {
                outputText = `Error: Cannot remove essential package 'core-utils'. System integrity depends on it.`;
                outputType = "error";  
              } else if (installedPackages.includes(pkgName)) {
                setInstalledPackages(prev => prev.filter(p => p !== pkgName));
                outputText = `Removing '${pkgName}'...\n'${pkgName}' removed successfully.`;
              } else {
                outputText = `Package '${pkgName}' is not installed.`;
                outputType = "error";
              }
              break;
            case "list":
              outputText = "Installed packages:\n" + installedPackages.map(p => `  - ${p}`).join("\n");
              break;
            case "update":
              outputText = "Checking for updates via BBS Quantum Relay Network...\nAll packages are up to date. (Simulated)";
              break;
            default:
              outputText = `Unknown pkg command: ${subCmd}. Use 'install', 'remove', 'list', or 'update'.`;
              outputType = "error";
          }
        }
        break;
      case "bbs-script":
        const scriptInput = args.join(" ");
        if (!scriptInput) {
          outputText = "Usage: bbs-script \"<natural language instruction>\" (e.g., bbs-script \"create a pulsating blue sphere component\")";
          outputType = "error";
        } else {
          outputText = `BBS-Script Engine v0.3 (Simulated)
--------------------------------------
Parsing: "${scriptInput}"
Interpreted Intent: [High-level intent: ${scriptInput.substring(0,30)}...]
Generating BBS-IR (Intermediate Representation):
  LOAD_MODULE NaturalLanguageProcessor
  LOAD_MODULE HybridCompiler
  LOAD_MODULE SelfModificationCore (if applicable)
  PROCESS_INPUT "${scriptInput}" -> AST_Node_BBS
  CONVERT AST_Node_BBS -> LowLevelQuantumOps
  COMPILE LowLevelQuantumOps -> HybridBinary_bbs${Math.floor(Math.random()*10000)}
  TARGET_PLATFORM: Native_BinaryBlocksphere
  SIM_EXECUTE HybridBinary_bbs${Math.floor(Math.random()*10000)} (Simulated)
Execution Complete. Result: [Conceptual output for "${scriptInput}"]
Note: For actual system modifications, elevated privileges and confirmation would be required.`;
        }
        break;
      case "desktop":
        onOpenDesktop();
        outputText = "Initializing Graphical Desktop Environment (GDE)...\n" +
                     "GDE Version: 0.3-alpha\n" +
                     "Welcome to BBS Desktop! Use the icons in the GDE to launch applications.";
        if (!installedPackages.includes("gui-tools")) {
            setInstalledPackages(prev => [...prev, "gui-tools"]);
            outputText += "\n'gui-tools' package automatically installed for GDE functionality.";
        }
        break;
      case "launch":
         outputText = "To launch applications, please use the 'desktop' command to open the Graphical Desktop Environment and use its app launcher.";
         outputType = "warning";
        break;
      case "factory-reset":
        setHistory([initialWelcomeMessage]);
        setInstalledPackages(["core-utils", "c-compiler", "cpp-compiler", "csharp-sdk", "assembler-tools"]);
        outputText = "System integrity check initiated...\nPerforming factory reset of BinaryBlocksphere Environment...\nShell history, user configurations, and non-core packages cleared.\nVirtual file system reformatted to default state.\nCore development tools reinstalled.\nSystem has been reset to factory defaults.";
        outputType = "warning";
        break;
      // Simulated dev commands
      case "gcc":
        if (args.length === 0) { outputText = "Usage: gcc <file.c> [options]"; outputType = "error"; break; }
        outputText = `Simulating C compilation with BBS-GCC...\nInput: ${args[0]}\nOptions: ${args.slice(1).join(" ")}\nQuantum pre-processing...\nStandard compilation...\nLinking with BBS CoreLib...\nOutput: ${args.includes("-o") ? args[args.indexOf("-o")+1] : 'a.out'} (simulated binary)\nCompilation successful.`;
        break;
      case "g++":
        if (args.length === 0) { outputText = "Usage: g++ <file.cpp> [options]"; outputType = "error"; break; }
        outputText = `Simulating C++ compilation with BBS-G++...\nInput: ${args[0]}\nOptions: ${args.slice(1).join(" ")}\nObject-oriented paradigm analysis...\nTemplate meta-programming expansion...\nLinking with BBS Standard Template Library++...\nOutput: ${args.includes("-o") ? args[args.indexOf("-o")+1] : 'a.out'} (simulated binary)\nCompilation successful.`;
        break;
      case "csharp":
        if (args.length === 0) { outputText = "Usage: csharp [run|build] <file.cs> [options]"; outputType = "error"; break; }
        const csAction = args[0];
        const csFile = args[1];
        if (!csFile) { outputText = "Usage: csharp [run|build] <file.cs> [options]"; outputType = "error"; break; }
        outputText = `Simulating C# operations with BBS .NET Core Runtime...\nAction: ${csAction}\nFile: ${csFile}\nOptions: ${args.slice(2).join(" ")}\nJust-In-Time (JIT) Quantum Compilation (if 'run')...\nIntermediate Language (BBS-IL) generation (if 'build')...\nExecution/Build successful. (Simulated output for ${csFile})`;
        break;
      case "asm":
        if (args.length === 0) { outputText = "Usage: asm <file.asm> [options]"; outputType = "error"; break; }
        outputText = `Simulating Assembly with BBS Native Assembler (BNASM)...\nInput: ${args[0]}\nOptions: ${args.slice(1).join(" ")}\nLow-level instruction parsing...\nMacro expansion...\nGenerating machine code for BBS Virtual CPU...\nOutput: ${args.includes("-o") ? args[args.indexOf("-o")+1] : 'output.bin'} (simulated machine code)\nAssembly successful.`;
        break;
      case "pwsh":
        if (!installedPackages.includes("powershell")) {
             setInstalledPackages(prev => [...prev, "powershell"]);
             outputText = "PowerShell tools not found. Installing 'powershell' package...\n'powershell' installed. Please re-run your command.\n";
             outputType = "warning";
             break;
        }
        if (args.length === 0) { outputText = "BBS PowerShell v7.x (simulated)\nType 'exit' to exit."; }
        else { outputText = `Executing in BBS PowerShell: ${args.join(" ")}\n(Simulated PowerShell Output for: ${args.join(" ")})`; }
        break;
      case "unix_shell":
         const unixToolPkgs = ["linux-core", "darwin-tools"];
         const needsUnixInstall = !unixToolPkgs.some(pkg => installedPackages.includes(pkg));
         if (needsUnixInstall) {
             setInstalledPackages(prev => [...prev, "linux-core"]); // Default to installing linux-core
             outputText = `Core Unix utilities not found. Installing 'linux-core' package...\n'linux-core' installed. You might also consider 'darwin-tools'. Please re-run your command.\n`;
             outputType = "warning";
             break;
         }
        if (args.length === 0) { outputText = "BBS Generic Unix Shell (simulating bash/zsh)\nType 'exit' to exit."; }
        else { outputText = `Executing in BBS Unix Shell: ${args.join(" ")}\n(Simulated Unix Output for: ${args.join(" ")})`; }
        break;
      default:
        if (command.trim() === "") {
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
    if (inputValue.trim()) {
      handleCommand(inputValue);
    } else {
      // Add an empty prompt line if user just presses enter
      setHistory(prev => [...prev, {id: `${Date.now()}-empty`, type: "input", text: "", prompt}]);
      setInputValue("");
    }
  };

  const handleTerminalClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div 
      className="w-full max-w-4xl h-[70vh] md:h-[600px] glassmorphic rounded-lg shadow-2xl flex flex-col overflow-hidden border border-primary/30"
      onClick={handleTerminalClick}
      aria-label="Shell Emulator"
      role="application"
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
              {item.type === "warning" && (
                <pre className="whitespace-pre-wrap text-yellow-400">{item.text}</pre>
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
            aria-label="Command input"
          />
        </div>
      </form>
    </div>
  );
}

    