
"use client";
import type * as React from 'react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { BookOpenText, Info, List } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface ManPage {
  id: string;
  title: string;
  command?: string;
  category: string;
  summary: string;
  description: string;
  options?: { option: string; description: string }[];
  examples?: { command: string; description: string }[];
  seeAlso?: string[];
}

const osbidibiManPages: ManPage[] = [
  {
    id: 'intro',
    title: 'Introduction to OSbidibi-PEPX0.0.1',
    category: 'General',
    summary: 'Overview of the OSbidibi environment.',
    description: 'OSbidibi-PEPX0.0.1 (Bidirectional Binary Piper Execution Environment eXperimental 0.0.1) is a conceptual operating system designed for advanced binary operations, agentic development, and cross-platform compatibility. It operates within a virtualized hyperspace, managing resources and interactions through its core "bidibi" interpreter.',
    seeAlso: ['bidibi', 'features']
  },
  {
    id: 'bidibi',
    title: 'bidibi Interpreter',
    category: 'Core System',
    summary: 'The core command-line interpreter for OSbidibi.',
    description: 'The `bidibi` interpreter is the heart of OSbidibi, responsible for executing commands, managing system processes, and facilitating bidirectional binary operations. It understands a unique syntax that blends natural language with traditional shell commands.',
    examples: [
      { command: 'bidibi-script "Perform binary fold on target_matrix"', description: 'Executes a high-level natural language command.' },
    ],
    seeAlso: ['help', 'features']
  },
  {
    id: 'help',
    title: 'help',
    command: 'help',
    category: 'Shell Commands',
    summary: 'Displays information about shell commands.',
    description: 'The `help` command provides a list of available commands within the OSbidibi shell and can offer detailed information about specific commands if available.',
    examples: [
        { command: 'help', description: 'Lists all available commands.' },
        { command: 'help echo', description: 'Shows help for the echo command (conceptual).' }
    ]
  },
  {
    id: 'features',
    title: 'features',
    command: 'features',
    category: 'Shell Commands',
    summary: 'Lists core OSbidibi system features.',
    description: 'Displays a list of the core functionalities and architectural components of the OSbidibi-PEPX0.0.1 system.',
  },
  {
    id: 'pkg',
    title: 'pkg - Package Manager',
    command: 'pkg',
    category: 'System Utilities',
    summary: 'Manages software packages within OSbidibi.',
    description: 'The `pkg` utility is used to install, remove, update, and list software packages from the OSbidibi Central Repository. These packages can include development tools, libraries, and system extensions.',
    options: [
      { option: 'install <package_name>', description: 'Installs a new package.' },
      { option: 'remove <package_name>', description: 'Removes an installed package.' },
      { option: 'list', description: 'Lists all installed packages.' },
      { option: 'update', description: 'Checks for and applies updates to installed packages.' },
    ],
    examples: [
      { command: 'pkg install powershell', description: 'Installs the PowerShell tools.' },
      { command: 'pkg list', description: 'Shows currently installed packages.' }
    ],
    seeAlso: ['bidibi-script']
  },
  {
    id: 'vfs',
    title: 'Virtual File System (VFS)',
    category: 'Core System',
    summary: 'Overview of the OSbidibi file system.',
    description: 'OSbidibi utilizes a Virtual File System (VFS) that abstracts underlying storage. It supports standard hierarchical directory structures and file operations. The PixelStore is a conceptual layer of this VFS for high-density data storage.',
    seeAlso: ['pixelStore', 'fileManager (GDE App)']
  },
  {
    id: 'pixelStore',
    title: 'PixelStore Quantum Storage',
    category: 'Core System',
    summary: 'Advanced data storage architecture.',
    description: 'PixelStore is a conceptual quantum storage mechanism within OSbidibi. It encodes data into multi-dimensional pixel states on a virtual canvas, allowing for extremely high-density storage. Data is dynamically converted between bitstreams and pixel states.',
    seeAlso: ['vfs']
  },
   {
    id: 'gde',
    title: 'Graphical Desktop Environment (GDE)',
    category: 'User Interface',
    summary: 'The primary graphical interface for OSbidibi.',
    description: 'The GDE provides a user-friendly, windowed environment for interacting with OSbidibi applications and features. It includes an app launchpad, dock, and manages application windows.',
    seeAlso: ['desktop (shell command)']
  }
];

export function UserManualApp() {
  const [selectedPage, setSelectedPage] = useState<ManPage | null>(osbidibiManPages[0]);

  const categories = Array.from(new Set(osbidibiManPages.map(p => p.category))).sort();

  return (
    <div className="flex flex-col md:flex-row w-full h-full p-2 md:p-4 bg-card text-card-foreground rounded-md overflow-hidden">
      {/* Sidebar for navigation */}
      <div className="w-full md:w-64 lg:w-72 p-2 border-b md:border-b-0 md:border-r border-primary/20 shrink-0">
        <div className="flex items-center mb-3">
          <List className="w-5 h-5 mr-2 text-primary" />
          <h3 className="text-lg font-semibold radiant-text">Manual Sections</h3>
        </div>
        <ScrollArea className="h-32 md:h-[calc(100%-40px)]">
          <div className="space-y-1 pr-2">
            {categories.map(category => (
              <div key={category}>
                <h4 className="text-sm font-medium text-accent my-1.5 px-1 radiant-text">{category}</h4>
                {osbidibiManPages.filter(p => p.category === category).map(page => (
                  <Button
                    key={page.id}
                    variant={selectedPage?.id === page.id ? "default" : "ghost"}
                    className={`w-full justify-start text-left h-auto py-1.5 px-2 text-xs button-3d-interactive ${selectedPage?.id === page.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    onClick={() => setSelectedPage(page)}
                  >
                    {page.title}
                  </Button>
                ))}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main content area for selected man page */}
      <div className="flex-grow p-2 md:p-4 overflow-hidden">
        <ScrollArea className="h-full p-1 -m-1">
          {selectedPage ? (
            <Card className="glassmorphic !bg-card/70">
              <CardHeader>
                <div className="flex items-center mb-1">
                  <BookOpenText className="w-7 h-7 mr-2 text-primary"/>
                  <CardTitle className="text-2xl radiant-text">{selectedPage.title}</CardTitle>
                </div>
                {selectedPage.command && <CardDescription className="text-sm text-accent radiant-text">Command: {selectedPage.command}</CardDescription>}
                <CardDescription className="radiant-text">{selectedPage.summary}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-lg mb-1 radiant-text text-accent">Description:</h4>
                  <p className="text-sm whitespace-pre-wrap radiant-text">{selectedPage.description}</p>
                </div>

                {selectedPage.options && selectedPage.options.length > 0 && (
                  <div>
                    <Separator className="my-3 bg-border/50"/>
                    <h4 className="font-semibold text-lg mb-2 radiant-text text-accent">Options:</h4>
                    <ul className="space-y-1.5 text-sm">
                      {selectedPage.options.map(opt => (
                        <li key={opt.option}>
                          <code className="px-1 py-0.5 bg-muted rounded-sm text-primary radiant-text">{opt.option}</code>
                          <span className="ml-2 radiant-text">- {opt.description}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedPage.examples && selectedPage.examples.length > 0 && (
                  <div>
                    <Separator className="my-3 bg-border/50"/>
                    <h4 className="font-semibold text-lg mb-2 radiant-text text-accent">Examples:</h4>
                    {selectedPage.examples.map((ex, index) => (
                       <div key={index} className="mb-2 p-2 bg-black/30 rounded-md">
                         <pre className="text-sm text-primary radiant-text"><code>{ex.command}</code></pre>
                         <p className="text-xs text-muted-foreground radiant-text mt-0.5">{ex.description}</p>
                       </div>
                    ))}
                  </div>
                )}

                {selectedPage.seeAlso && selectedPage.seeAlso.length > 0 && (
                  <div>
                    <Separator className="my-3 bg-border/50"/>
                    <h4 className="font-semibold text-lg mb-1 radiant-text text-accent">See Also:</h4>
                    <p className="text-sm radiant-text">
                      {selectedPage.seeAlso.map((ref, index) => {
                        const refPage = osbidibiManPages.find(p => p.id === ref || p.command === ref);
                        return (
                          <React.Fragment key={ref}>
                            {refPage ? (
                              <Button variant="link" className="p-0 h-auto text-sm text-primary radiant-text" onClick={() => setSelectedPage(refPage)}>
                                {refPage.title}
                              </Button>
                            ) : (
                              <span className="text-muted-foreground">{ref}</span>
                            )}
                            {index < selectedPage.seeAlso!.length - 1 && ', '}
                          </React.Fragment>
                        );
                      })}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Info className="w-12 h-12 text-primary opacity-50 mb-4"/>
              <p className="text-lg text-muted-foreground radiant-text">Select a manual page from the sidebar to view its content.</p>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
