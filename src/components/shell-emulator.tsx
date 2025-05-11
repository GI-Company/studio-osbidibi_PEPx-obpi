"use client";

import { Terminal, KeyRound, Binary } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface CommandOutput {
  id: string;
  type: "input" | "output" | "error" | "warning" | "info";
  text: string;
  prompt?: string;
}

const initialWelcomeMessageText = "Welcome to OSbidibi-PEPX0.0.1 (Bidirectional Binary Piper)\nInterpreter: bidibi\nType 'help' for a list of available commands.";

const initialCoreFeatures = [
  "System Initialization (OSbidibi Core)", "Binary Fold (bidibi operation)", "Change Propagation (bidibi)", 
  "Virtual Driver (Z-plane, bidibi)", "SHELL EMULATION (bidibi, User-aware)", "PERSONAL ENV (Persistent/Ghost modes)", "VIRTUAL RAM (OSbidibi managed)", 
  "VIRTUAL DRIVER (OSbidibi)", 
  "Integrated Development Environment (C, C++, C#, ASM, PowerShell, Unix Shell - via bidibi)",
  "POWERSHELL LINUX AND DARWIN INTERPERATOR ALL IN WONE (via pkg & direct bidibi commands)", 
  "OWN NATIVE ENV (with User Authentication to OSbidibi)", 
  "Graphical Desktop Environment (GDE) (OSbidibi GDE)",
  "Web Browser with multi-search engine support (in GDE)",
  "Virtual Partition Manager (in GDE, with BIOS & boot sequence)",
  "PixelStore Quantum Storage (Conceptual, in GDE)",
  "Actual Web Requests (curl/wget with browser fetch, CORS limitations apply - bidibi net ops)",
  "ISOLATED ROOT WITH FILESYSTEM DISGNED FOR ITS NATIVE COSS PATFORM ENV (user-scoped in OSbidibi)", 
  "RUNS IN BROWSER OR OVER THE TOP OF OTHER OS WITH ITS OWN ISOLATED ROOT (conceptual OSbidibi)", 
  "VIRTUAL CLOCK DESIGNED FOR BI DIRECTIONAL BINARY TIMING (bidibi time)",
  "Networking Utilities (curl, wget - actual fetch attempts via bidibi)",
  "Unified Package Manager (pkg - bidibi managed)",
  "Cross-Platform Hybrid Compilation (bbs-script, now bidibi-script)",
  "Internet & Localhost Connectivity (connect, curl/wget - via bidibi)",
  "Factory Reset (factory-reset command - mode-aware for OSbidibi instance)",
  "User Authentication & Password Management (passwd command for OSbidibi)",
  "Superuser ('serpOS@GI') with advanced OSbidibi capabilities",
];

const availablePackages = ["powershell", "darwin-tools", "linux-core", "web-utils", "bbs-dev-kit", "gui-tools", "c-compiler", "cpp-compiler", "csharp-sdk", "assembler-tools", "security-tools"];

interface ShellEmulatorProps {
  isEmbeddedInGDE?: boolean;
}

export function ShellEmulator({ isEmbeddedInGDE = false }: ShellEmulatorProps) {
  const { currentUser, appMode, changePassword, resetToModeSelection, logout } = useAuth();
  
  const getInitialWelcomeMessage = (): CommandOutput => ({
    id: Date.now().toString(),
    type: "output",
    text: `${initialWelcomeMessageText}\nLogged in as: ${currentUser?.username || 'guest'} (${currentUser?.role || 'unknown'}) to OSbidibi. Mode: ${appMode || 'unknown'}`,
  });

  const [history, setHistory] = useState<CommandOutput[]>([getInitialWelcomeMessage()]);
  const [inputValue, setInputValue] = useState("");
  const [installedPackages, setInstalledPackages] = useState<string[]>(["core-utils", "c-compiler", "cpp-compiler", "csharp-sdk", "assembler-tools"]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [passwordChangeState, setPasswordChangeState] = useState<{ step: 'idle' | 'old_pass' | 'new_pass' | 'confirm_pass', oldPass?: string, newPass?: string }>({ step: 'idle' });


  const getPromptText = () => {
    const userDisplay = currentUser?.username || "guest";
    const hostname = "OSbidibi";
    let promptChar = "$";
    if (currentUser?.role === 'superuser') {
        promptChar = "#";
    }

    if (passwordChangeState.step !== 'idle') {
      switch (passwordChangeState.step) {
        case 'old_pass': return "Enter old password: ";
        case 'new_pass': return "Enter new password: ";
        case 'confirm_pass': return "Confirm new password: ";
        default: return `${userDisplay}@${hostname}:~${promptChar} `;
      }
    }
    return `${userDisplay}@${hostname}:~${promptChar} `;
  };
  
  let currentPromptText = getPromptText(); 

  useEffect(() => {
    currentPromptText = getPromptText(); 
    if (currentUser && appMode && history.length > 0 && history[0].id === getInitialWelcomeMessage().id ) { 
        setHistory(prev => [getInitialWelcomeMessage(), ...prev.slice(1)]);
    } else if (currentUser && appMode && history.length === 0) {
        setHistory([getInitialWelcomeMessage()]);
    }

  }, [currentUser, appMode, passwordChangeState.step]);


  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (viewport) viewport.scrollTop = viewport.scrollHeight;
    }
  }, [history]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [passwordChangeState.step]); 

  const addHistoryEntry = (entry: Omit<CommandOutput, 'id' | 'prompt'>, isInput: boolean = false) => {
    const fullEntry: CommandOutput = {
      id: `${Date.now()}-${Math.random()}`,
      ...entry,
      prompt: isInput ? currentPromptText : undefined,
    };
    setHistory(prev => [...prev, fullEntry]);
  };

  const handlePasswordChangeInput = async (input: string) => {
    switch (passwordChangeState.step) {
      case 'old_pass':
        setPasswordChangeState(prev => ({ ...prev, step: 'new_pass', oldPass: input }));
        addHistoryEntry({ type: "info", text: "Enter new password (min 8 chars):" });
        break;
      case 'new_pass':
        if (input.length < 8) {
          addHistoryEntry({ type: "error", text: "New password must be at least 8 characters long. Please try again." });
          setPasswordChangeState(prev => ({ ...prev, step: 'new_pass' })); 
          addHistoryEntry({ type: "info", text: "Enter new password (min 8 chars):" });
          return;
        }
        setPasswordChangeState(prev => ({ ...prev, step: 'confirm_pass', newPass: input }));
        addHistoryEntry({ type: "info", text: "Confirm new password:" });
        break;
      case 'confirm_pass':
        if (input === passwordChangeState.newPass) {
          const success = await changePassword(passwordChangeState.oldPass!, passwordChangeState.newPass!);
          if (success) {
            addHistoryEntry({ type: "output", text: "Password changed successfully." });
          } else {
            addHistoryEntry({ type: "error", text: "Password change failed. Incorrect old password or other error." });
          }
        } else {
          addHistoryEntry({ type: "error", text: "Passwords do not match. Password change aborted." });
        }
        setPasswordChangeState({ step: 'idle' });
        break;
    }
  };


  const handleCommand = async (command: string) => {
    addHistoryEntry({ type: "input", text: command }, true);
    
    if (passwordChangeState.step !== 'idle') {
      await handlePasswordChangeInput(command);
      setInputValue("");
      return;
    }

    let outputText = "";
    let outputType: CommandOutput["type"] = "output";

    const [cmd, ...args] = command.trim().split(" ");

    switch (cmd.toLowerCase()) {
      case "help":
        outputText = "OSbidibi-PEPX0.0.1 (bidibi interpreter) - Available Commands:\n" +
          "  help                       - Show this help message\n" +
          "  clear                      - Clear the terminal screen\n" +
          "  date                       - Display the current system time (bidibi time)\n" +
          "  features                   - List core OSbidibi system features\n" +
          "  status [feat]              - Show status of an OSbidibi feature\n" +
          "  echo [text]                - Display a line of text\n" +
          "  whoami                     - Display current user and role in OSbidibi\n" +
          "  passwd                     - Change your OSbidibi password\n" +
          "  logout                     - Log out of persistent OSbidibi mode / Reset ghost mode\n" +
          "  sysinit                    - Initialize OSbidibi system\n" +
          "  fold                       - Perform binary fold operation (bidibi core)\n" +
          "  curl <url>                 - Transfer data from a server (uses browser fetch)\n" +
          "  wget <url>                 - Download files from network (uses browser fetch, save emulated)\n" +
          "  connect <address>          - Connect to a network address (emulated for OSbidibi network)\n" +
          "  pkg install <name>         - Install a package (e.g., powershell, c-compiler)\n" +
          "  pkg remove <name>          - Remove an installed package\n" +
          "  pkg list                   - List installed packages\n" +
          "  pkg update                 - Update all packages (emulated repository check)\n" +
          "  bidibi-script \"<instruction>\" - Execute a natural language script via bidibi engine\n" +
          "  desktop                    - Info about the Graphical Desktop Environment (GDE)\n" +
          "  launch <app_name>          - Launch an application (use GDE for app launching)\n" +
          "  factory-reset              - Resets the OSbidibi shell (mode-aware)\n" +
          (currentUser?.role === 'superuser' ? 
          "Superuser Commands (OSbidibi Root):\n" +
          "  su_gen_executable <target> - Generate cross-platform OSbidibi executable\n" +
          "  su_view_base_config        - View OSbidibi system base configuration\n"
          : "") +
          "Development Commands (bidibi toolchain):\n" +
          "  gcc <file.c> [options]     - Compile C code via OSbidibi-GCC\n" +
          "  g++ <file.cpp> [options]   - Compile C++ code via OSbidibi-G++\n" +
          "  csharp <file.cs> [options] - Compile/Run C# code via OSbidibi .NET Core\n" +
          "  asm <file.asm> [options]   - Assemble assembly code via OSbidibi Native Assembler\n" +
          "  pwsh [script.ps1]          - Run PowerShell command or script in OSbidibi PS Environment\n" +
          "  unix_shell [command]       - Run a Unix shell command in OSbidibi Shell Environment";
        break;
      case "clear":
        setHistory(currentUser && appMode ? [getInitialWelcomeMessage()] : []);
        setInputValue("");
        return;
      case "date":
        const now = new Date();
        outputText = `Current Bidirectional Binary Time (OSbidibi Clock):\n`+
                     `Forward Cycle: ${now.getTime()}\n` +
                     `Reverse Cycle: ${Math.floor(Number.MAX_SAFE_INTEGER / 2) - now.getTime()}\n` +
                     `Standard Time: ${now.toLocaleString()}`;
        break;
      case "features":
        outputText = "OSbidibi-PEPX0.0.1 Core Features:\n" + initialCoreFeatures.map(f => `  - ${f}`).join("\n");
        break;
      case "status":
        const featureQuery = args.join(" ").toLowerCase();
        const foundFeature = initialCoreFeatures.find(f => f.toLowerCase().includes(featureQuery));
        if (foundFeature) {
          outputText = `Status of OSbidibi feature '${foundFeature}': Active and Nominal.`;
        } else if (featureQuery) {
          outputText = `OSbidibi Feature '${args.join(" ")}' not recognized. Type 'features' to see available features.`;
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
        outputText = `User: ${currentUser?.username || 'guest'} (OSbidibi)\nRole: ${currentUser?.role || 'unknown'}\nMode: ${appMode || 'not set'}`;
        break;
      case "passwd":
        if (appMode === 'ghost') {
          outputText = "Password change is not available in Ghost Mode for OSbidibi.";
          outputType = "warning";
        } else if (!currentUser || currentUser.role === 'guest') {
           outputText = "Password change is not available for OSbidibi guest users.";
           outputType = "warning";
        }
        else {
          setPasswordChangeState({ step: 'old_pass' });
          outputText = "Enter your current OSbidibi password:"; 
          outputType = "info";
        }
        break;
      case "logout":
        if (appMode === 'persistent' && currentUser && currentUser.role !== 'guest') {
          logout(); 
          outputText = "Logging out of OSbidibi...";
        } else if (appMode === 'ghost') {
          resetToModeSelection();
          outputText = "Resetting OSbidibi Ghost Mode session...";
        } else {
          outputText = "No active OSbidibi session to log out from or reset.";
          outputType = "warning";
        }
        break;
      case "sysinit":
        outputText = "Initializing OSbidibi Bidirectional Binary System...\nState Matrix constructed (3D)...\nVirtual drivers loaded (bidibi plane Z)...\nCore services (networking, pkg, bidibi-script, IDE tools) started...\nOSbidibi system ready.";
        break;
      case "fold":
        outputText = "Performing OSbidibi binary fold operation...\nError correction routines (bidibi quantum) initiated...\nChange propagation to adjacent nodes pending (bidibi-net)...\nFold complete.";
        break;
      case "curl":
      case "wget":
        if (args.length === 0) {
          outputText = `Usage: ${cmd.toLowerCase()} <url>\nNote: Uses browser's fetch API via OSbidibi bridge. Subject to CORS limitations.`;
          outputType = "error";
        } else {
          const url = args[0];
          outputText = `OSbidibi: Attempting to fetch ${url} using browser's fetch API...\n`;
          try {
            const response = await fetch(url, { mode: 'cors' }); 
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            const contentType = response.headers.get("content-type");
            if (contentType && (contentType.includes("application/json") || contentType.includes("text/html") || contentType.includes("text/plain"))) {
              const data = await response.text();
              outputText += `Response from ${url} (first 500 chars):\n${data.substring(0,500)}\n...\n`;
            } else {
               outputText += `Received binary data or non-text content from ${url}. Cannot display directly in OSbidibi shell.\n`;
            }
            if (cmd.toLowerCase() === "wget") {
              const fileName = url.substring(url.lastIndexOf('/') + 1) || "index.html";
              outputText += `Emulated save to '/virtual_fs/downloads/${fileName}' within OSbidibi. Content fetched.`;
            }
          } catch (error: any) {
            outputText += `Error fetching ${url} via OSbidibi: ${error.message}\nThis might be due to CORS policy or network issues.`;
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
          if (address.includes("localhost:") || address.match(/^(\d{1,3}\.){3}\d{1,3}:\d+$/)) { 
            outputText = `OSbidibi: Attempting to connect to ${address}...\nSuccessfully connected to local service on ${address}. (OSbidibi Network Emulation)`;
          } else {
            outputText = `OSbidibi: Establishing connection to ${address}...\nSecure connection established to ${address}. (OSbidibi Network Emulation)`;
          }
        }
        break;
      case "pkg":
        if (args.length === 0) {
          outputText = "Usage: pkg [install|remove|list|update] [package_name] (OSbidibi Package Manager)";
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
                outputText = `Package '${pkgName}' is already installed in OSbidibi.`;
                outputType = "warning";
              } else if (availablePackages.includes(pkgName)) {
                setInstalledPackages(prev => [...prev, pkgName]);
                outputText = `OSbidibi: Installing '${pkgName}'...\nPackage '${pkgName}' downloaded from OSbidibi Central Repository.\nConfiguring '${pkgName}'...\n'${pkgName}' installed successfully.`;
              } else {
                outputText = `Package '${pkgName}' not found in OSbidibi repositories. Available: ${availablePackages.join(', ')}`;
                outputType = "error";
              }
              break;
            case "remove":
              if (!pkgName) {
                outputText = "Usage: pkg remove <package_name>";
                outputType = "error";
              } else if (["core-utils", "c-compiler", "cpp-compiler", "csharp-sdk", "assembler-tools"].includes(pkgName) && args[2] !== "--force") {
                outputText = `Warning: '${pkgName}' is a core OSbidibi development package. Removing it might impact system stability. Use 'pkg remove ${pkgName} --force' to proceed.`;
                outputType = "warning";
              } else if (pkgName === "core-utils") {
                outputText = `Error: Cannot remove essential OSbidibi package 'core-utils'. System integrity depends on it.`;
                outputType = "error";  
              } else if (installedPackages.includes(pkgName)) {
                setInstalledPackages(prev => prev.filter(p => p !== pkgName));
                outputText = `OSbidibi: Removing '${pkgName}'...\n'${pkgName}' removed successfully.`;
              } else {
                outputText = `Package '${pkgName}' is not installed in OSbidibi.`;
                outputType = "error";
              }
              break;
            case "list":
              outputText = "Installed OSbidibi packages:\n" + installedPackages.map(p => `  - ${p}`).join("\n");
              break;
            case "update":
              outputText = "OSbidibi: Checking for updates via Quantum Relay Network...\nAll packages are up to date. (Emulated repository check)";
              break;
            default:
              outputText = `Unknown OSbidibi pkg command: ${subCmd}. Use 'install', 'remove', 'list', or 'update'.`;
              outputType = "error";
          }
        }
        break;
      case "bidibi-script":
        const scriptInput = args.join(" ");
        if (!scriptInput) {
          outputText = "Usage: bidibi-script \"<natural language instruction>\" (e.g., bidibi-script \"create a pulsating blue sphere component\")";
          outputType = "error";
        } else {
          outputText = `bidibi Script Engine v0.5 (OSbidibi)
--------------------------------------
User: ${currentUser?.username || 'guest'} (Role: ${currentUser?.role || 'unknown'})
Parsing: "${scriptInput}"
Interpreted Intent (bidibi AI): [High-level intent: ${scriptInput.substring(0,30)}...]
Generating OSbidibi-IR (Intermediate Representation)...
EXECUTE HybridBinary_bidibi_op_${Math.floor(Math.random()*10000)}
Execution Complete. Result: [Conceptual OSbidibi output for "${scriptInput}"]`;
        }
        break;
      case "desktop":
        outputText = "Graphical Desktop Environment (GDE) for OSbidibi is active.\nUse GDE launchpad for applications.";
        if (isEmbeddedInGDE && !installedPackages.includes("gui-tools")) {
             setInstalledPackages(prev => [...prev, "gui-tools"]);
             outputText += "\n'gui-tools' package automatically installed for GDE consistency.";
        }
        break;
      case "launch":
         outputText = "To launch applications, please use the OSbidibi GDE launchpad or dock.";
         outputType = "warning";
        break;
      case "factory-reset":
        if (appMode === 'persistent') {
          const confirmed = window.confirm("WARNING: This will log you out and reset your persistent OSbidibi environment data (excluding other user accounts on this instance if any). The superuser account and base system will not be affected. Are you sure you want to proceed?");
          if (confirmed) {
            resetToModeSelection(); 
            outputText = "Persistent OSbidibi environment reset. User data cleared. Returning to mode selection...";
            toast({ title: "OSbidibi Reset", description: "Persistent data cleared.", variant: "destructive" });
          } else {
            outputText = "OSbidibi factory reset cancelled.";
            outputType = "info";
          }
        } else if (appMode === 'ghost') {
          resetToModeSelection(); 
          outputText = "OSbidibi Ghost Mode session reset. Returning to mode selection...";
        } else {
          outputText = "Cannot perform factory reset: No active OSbidibi mode detected.";
          outputType = "error";
        }
        break;
      case "su_gen_executable":
        if (currentUser?.role === 'superuser') {
          outputText = `Generating cross-platform OSbidibi executable for target '${args[0] || 'generic_osbidibi_instance'}'.\n` +
                       `1. Compiling OSbidibi core into native bootstrap...\n` +
                       `2. Packaging PixelStore HTML Canvas (5MB compressed) with bidibi interpreter...\n` +
                       `3. Generating unique OSbidibi instance key...\n` +
                       `4. Output: ${args[0] || 'OSbidibi_Instance.exe/app/bin'}`;
          outputText += "\nKey Generation: A unique security key for this new OSbidibi binary instance would be generated and required for its first launch and onboarding.";
        } else {
          outputText = "Error: This command requires OSbidibi superuser privileges.";
          outputType = "error";
        }
        break;
      case "su_view_base_config":
        if (currentUser?.role === 'superuser') {
          outputText = `Displaying Base OSbidibi System Configuration (Read-Only for regular users):\n` +
                       `- Core Kernel Version: OSbidibi-K v3.1.4\n` +
                       `- PixelStore Algorithm: QuantumPixel v2.1 (OSbidibi)\n` +
                       `- Superuser: ${currentUser.username} (immutable base identity)\n` +
                       `- Default Packages: core-utils, dev-tools, security-core (OSbidibi)\n` +
                       `Note: Regular users operate within isolated OSbidibi instances and cannot modify this base.`;
        } else {
          outputText = "Error: This command requires OSbidibi superuser privileges.";
          outputType = "error";
        }
        break;
      case "gcc":
        if (args.length === 0) { outputText = "Usage: gcc <file.c> [options] (OSbidibi-GCC)"; outputType = "error"; break; }
        outputText = `OSbidibi-GCC Compiling ${args[0]}...\nOutput: ${args.includes("-o") ? args[args.indexOf("-o")+1] : 'a.out'} (binary)\nCompilation successful.`;
        break;
      case "g++":
        if (args.length === 0) { outputText = "Usage: g++ <file.cpp> [options] (OSbidibi-G++)"; outputType = "error"; break; }
        outputText = `OSbidibi-G++ Compiling ${args[0]}...\nOutput: ${args.includes("-o") ? args[args.indexOf("-o")+1] : 'a.out'} (binary)\nCompilation successful.`;
        break;
      case "csharp":
        if (args.length === 0) { outputText = "Usage: csharp [run|build] <file.cs> [options] (OSbidibi .NET)"; outputType = "error"; break; }
        outputText = `OSbidibi .NET Core Processing ${args[1]}...\nExecution/Build successful. (Output for ${args[1]})`;
        break;
      case "asm":
        if (args.length === 0) { outputText = "Usage: asm <file.asm> [options] (OSbidibi Assembler)"; outputType = "error"; break; }
        outputText = `OSbidibi Native Assembler (BNASM) Assembling ${args[0]}...\nOutput: ${args.includes("-o") ? args[args.indexOf("-o")+1] : 'output.bin'} (machine code)\nAssembly successful.`;
        break;
      case "pwsh":
        if (!installedPackages.includes("powershell")) {
             setInstalledPackages(prev => [...prev, "powershell"]);
             outputText = "PowerShell tools not found in OSbidibi. Installing 'powershell' package...\n'powershell' installed. Please re-run your command.\n";
             outputType = "warning";
             break;
        }
        if (args.length === 0) { outputText = "OSbidibi PowerShell v7.x Environment\nType 'exit' to exit."; }
        else { outputText = `Executing in OSbidibi PowerShell: ${args.join(" ")}\n(OSbidibi PowerShell Output for: ${args.join(" ")})`; }
        break;
      case "unix_shell":
         const unixToolPkgs = ["linux-core", "darwin-tools"];
         const needsUnixInstall = !unixToolPkgs.some(pkg => installedPackages.includes(pkg));
         if (needsUnixInstall) {
             setInstalledPackages(prev => [...prev, "linux-core"]); 
             outputText = `Core Unix utilities not found in OSbidibi. Installing 'linux-core' package...\n'linux-core' installed. You might also consider 'darwin-tools'. Please re-run your command.\n`;
             outputType = "warning";
             break;
         }
        if (args.length === 0) { outputText = "OSbidibi Unix Shell (bash/zsh compatible)\nType 'exit' to exit."; }
        else { outputText = `Executing in OSbidibi Unix Shell: ${args.join(" ")}\n(OSbidibi Unix Shell Output for: ${args.join(" ")})`; }
        break;
      default:
        if (command.trim() === "") {
           setInputValue("");
           return; 
        }
        outputText = `bidibi: Command not found: ${cmd}. Type 'help' for available commands.`;
        outputType = "error";
    }
    
    if (passwordChangeState.step === 'idle') { 
        addHistoryEntry({ type: outputType, text: outputText });
    }
    setInputValue("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() || passwordChangeState.step !== 'idle') { 
      handleCommand(inputValue);
    } else {
      addHistoryEntry({ type: "input", text: "" }, true);
      setInputValue("");
    }
  };

  const handleTerminalClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div 
      className="w-full h-full glassmorphic rounded-lg shadow-2xl flex flex-col overflow-hidden border border-primary/30"
      onClick={handleTerminalClick}
      aria-label="OSbidibi-PEPX0.0.1 Shell Emulator"
      role="application"
    >
      <div className="flex items-center p-3 bg-black/40 border-b border-primary/20">
        <Terminal className="w-5 h-5 mr-2 text-primary" />
        <h2 className="text-sm font-medium text-foreground radiant-text">OSbidibi-PEPX0.0.1 CLI (bidibi)</h2>
        <div className="ml-auto flex items-center space-x-2 text-xs text-muted-foreground">
          {currentUser?.role === 'superuser' && <KeyRound className="w-3 h-3 text-yellow-400" title="Superuser Mode"/>}
          {appMode === 'persistent' && <Binary className="w-3 h-3 text-green-400" title="Persistent Mode"/>}
          {appMode === 'ghost' && <Binary className="w-3 h-3 text-blue-400" title="Ghost Mode"/>}
          <span className="radiant-text">{currentUser?.username || 'guest'}</span>
        </div>
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
               {item.type === "info" && (
                <pre className="whitespace-pre-wrap text-blue-400 radiant-text">{item.text}</pre>
              )}
              {item.type === "error" && (
                <pre className="whitespace-pre-wrap text-destructive radiant-text">{item.text}</pre>
              )}
              {item.type === "warning" && (
                <pre className="whitespace-pre-wrap text-yellow-400 radiant-text">{item.text}</pre>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
      <form onSubmit={handleSubmit} className="p-2 border-t border-primary/20 bg-black/20">
        <div className="flex items-center">
          <span className="pl-2 pr-1 font-mono text-sm radiant-text" style={{ color: 'var(--shell-prompt-color)' }}>{getPromptText()}</span>
          <Input
            ref={inputRef}
            type={passwordChangeState.step !== 'idle' && passwordChangeState.step !== 'old_pass' ? "password" : "text"} 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-grow p-0 text-sm bg-transparent border-none shadow-none radiant-text text-foreground focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50"
            placeholder={passwordChangeState.step !== 'idle' ? "" : "Type a bidibi command..."}
            autoComplete="off"
            spellCheck="false"
            aria-label="Command input"
          />
        </div>
      </form>
    </div>
  );
}

