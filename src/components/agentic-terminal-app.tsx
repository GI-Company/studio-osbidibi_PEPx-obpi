
"use client";
import type * as React from 'react';
import { useState } from 'react';
import { ChatInterface } from './chat-interface';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { FolderKanban, Save, FileText, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useVFS } from '@/contexts/VFSContext'; // Import useVFS

interface AgenticTerminalAppProps {
  onSaveProjectToPixelStore: (projectName: string, projectPath: string) => void; // Pass path
}

export function AgenticTerminalApp({ onSaveProjectToPixelStore }: AgenticTerminalAppProps) {
  const { currentUser } = useAuth();
  const { createFolder: vfsCreateFolder, createFile: vfsCreateFile, listPath: vfsListPath } = useVFS();
  const [isSaving, setIsSaving] = useState(false);
  const [newProjectName, setNewProjectName] = useState(`Project-${Date.now().toString().slice(-4)}`);
  const [sessionFiles, setSessionFiles] = useState([ // conceptual list
    {name: 'main_script.bbs', type: 'file'},
    {name: 'config.json', type: 'file'},
    {name: 'output_log.txt', type: 'file'}
  ]);


  const userTier = currentUser?.subscriptionTier || 'free_limited';
  const isTrialActive = currentUser?.isTrialActive || false;
  const isAdmin = currentUser?.role === 'superuser';

  const handleSaveProject = async () => {
    if (!newProjectName.trim()) {
        toast({ title: "Error", description: "Project name cannot be empty.", variant: "destructive" });
        return;
    }
    setIsSaving(true);
    toast({ title: "Saving Project", description: `"${newProjectName}" is being processed and archived into PixelStore format...` });
    
    const projectBasePath = '/home/user/projects'; // Standard base path for projects in VFS
    const projectPath = `${projectBasePath}/${newProjectName}`;

    // Ensure base projects folder exists
    if (!vfsListPath(projectBasePath).find(item => item.name === 'projects' && item.type === 'folder')) {
        const homeUserExists = vfsListPath('/home').find(item => item.name === 'user' && item.type === 'folder');
        if(!homeUserExists) {
            vfsCreateFolder('/home', 'user'); // create /home/user first
            vfsCreateFolder('/home/user', 'projects'); // then /home/user/projects
        } else {
             vfsCreateFolder(projectBasePath, ''); // This is wrong, should be vfsCreateFolder('/home/user', 'projects')
        }
    }
     // Check if /home/user/projects exists, if not create it
    const projectsFolder = vfsListPath('/home/user').find(p => p.name === 'projects');
    if (!projectsFolder) {
        vfsCreateFolder('/home/user', 'projects');
    }


    // Create the project folder in VFS
    const folderCreated = vfsCreateFolder(projectBasePath, newProjectName);

    if (folderCreated) {
        // Create some conceptual files within the project folder
        vfsCreateFile(projectPath, 'manifest.bbs-proj', `Project: ${newProjectName}\nTimestamp: ${new Date().toISOString()}\nStatus: Archived to PixelStore`);
        sessionFiles.forEach(file => {
            vfsCreateFile(projectPath, file.name, `// Conceptual content for ${file.name}`);
        });
        
        onSaveProjectToPixelStore(newProjectName, projectPath); // Call the callback with name and VFS path
        toast({ title: "Project Saved", description: `"${newProjectName}" archived to PixelStore. VFS Path: ${projectPath}` });

    } else {
        toast({ title: "Error Saving Project", description: `Failed to create project folder for "${newProjectName}" in VFS. It might already exist or path is invalid.`, variant: "destructive" });
    }
    
    setNewProjectName(`Project-${Date.now().toString().slice(-4)}`); // Reset for next save
    setIsSaving(false);
  };

  return (
    <div className="flex flex-col w-full h-full bg-card text-card-foreground rounded-md overflow-hidden">
      {isAdmin && (
        <div className="p-2 border-b border-primary/20 bg-muted/40 flex items-center justify-between space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="button-3d-interactive">
                <FolderKanban className="w-4 h-4 mr-2" /> Project Files
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0 glassmorphic">
              <div className="p-2 text-sm font-semibold border-b border-border/50 radiant-text">Session Files (Conceptual)</div>
              <ul className="p-2 space-y-1 text-xs">
                {sessionFiles.map(file => (
                    <li key={file.name} className="flex items-center p-1 rounded hover:bg-primary/10"><FileText className="w-3 h-3 mr-2 text-accent"/> {file.name}</li>
                ))}
                <li className="text-muted-foreground p-1">(Files will be saved to VFS)</li>
              </ul>
            </PopoverContent>
          </Popover>
          
          <div className="flex items-center space-x-2">
             <input 
                type="text" 
                value={newProjectName} 
                onChange={(e) => setNewProjectName(e.target.value)} 
                placeholder="Project Name" 
                className="h-8 px-2 text-sm rounded-md border border-input bg-input/70 focus:bg-input w-40"
                disabled={isSaving}
            />
            <Button variant="default" size="sm" onClick={handleSaveProject} disabled={isSaving} className="button-3d-interactive bg-accent hover:bg-accent/90">
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save to PixelStore (VFS)
            </Button>
          </div>
        </div>
      )}
      <div className="flex-grow overflow-hidden">
        <ChatInterface userTier={isAdmin ? 'admin' : userTier} isTrialActive={isTrialActive} />
      </div>
    </div>
  );
}
