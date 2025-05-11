
"use client";
import type * as React from 'react';
import { FolderOpen, FileText, HardDrive, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';

interface FileSystemItem {
  id: string;
  name: string;
  type: 'folder' | 'file' | 'cache' | 'temp';
  size?: string;
  modified?: string;
  icon: React.ElementType;
}

const dummyFiles: FileSystemItem[] = [
  { id: '1', name: 'Projects', type: 'folder', icon: FolderOpen, modified: '2024-07-28 10:00' },
  { id: '2', name: 'session_cache', type: 'cache', icon: Zap, size: '12.5MB', modified: '2024-07-28 14:30' },
  { id: '3', name: 'temp_build_output.log', type: 'temp', icon: FileText, size: '2.1MB', modified: '2024-07-28 14:25' },
  { id: '4', name: 'core_system_logs', type: 'folder', icon: FolderOpen, modified: '2024-07-27 08:00' },
  { id: '5', name: 'user_preferences.json', type: 'file', icon: FileText, size: '5KB', modified: '2024-07-28 09:15' },
  { id: '6', name: 'concept_pixelstore_manifest.dat', type: 'file', icon: HardDrive, size: '1KB (manifest)', modified: '2024-07-28 11:00'},
];

export function FileManagerApp() {
  return (
    <div className="flex flex-col w-full h-full p-2 md:p-4 bg-card text-card-foreground rounded-md overflow-hidden">
      <CardHeader className="pb-3 text-center">
        <div className="flex items-center justify-center mb-2">
          <FolderOpen className="w-8 h-8 mr-2 text-primary" />
          <CardTitle className="text-2xl radiant-text">OSbidibi File Manager</CardTitle>
        </div>
        <CardDescription className="radiant-text">
          Browse conceptual cached, temporary, and PixelStore manifest files.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow p-2 overflow-hidden">
        <ScrollArea className="h-full p-1 -m-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {dummyFiles.map((item) => (
                    <Button
                        key={item.id}
                        variant="outline"
                        className="h-auto p-3 flex flex-col items-start space-y-1.5 text-left glassmorphic !bg-card/60 hover:!bg-primary/20 button-3d-interactive w-full"
                        aria-label={`Open ${item.name}`}
                    >
                        <div className="flex items-center w-full justify-between">
                            <item.icon className={`w-7 h-7 ${item.type === 'folder' ? 'text-accent' : 'text-primary'}`} />
                            {/* Placeholder for actions like delete/rename */}
                        </div>
                        <h4 className="text-sm font-semibold truncate radiant-text text-foreground">{item.name}</h4>
                        <div className="text-xs text-muted-foreground space-x-2">
                            <span>Type: {item.type}</span>
                            {item.size && <span>Size: {item.size}</span>}
                        </div>
                        {item.modified && <p className="text-xs text-muted-foreground/70">Modified: {item.modified}</p>}
                    </Button>
                ))}
            </div>
        </ScrollArea>
      </CardContent>
      <div className="p-2 text-xs text-center text-muted-foreground/70 border-t border-primary/20">
        File operations are conceptual within the OSbidibi GDE. Actual data resides in browser storage or simulated PixelStore.
      </div>
    </div>
  );
}

    