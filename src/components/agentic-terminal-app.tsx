
"use client";
import type * as React from 'react';
import { useState } from 'react';
import { ChatInterface } from './chat-interface';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { FolderKanban, Save, FileText, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AgenticTerminalAppProps {
  onSaveProjectToPixelStore: (projectName: string) => void;
}

export function AgenticTerminalApp({ onSaveProjectToPixelStore }: AgenticTerminalAppProps) {
  const { currentUser } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [newProjectName, setNewProjectName] = useState(`Project-${Date.now().toString().slice(-4)}`);


  const userTier = currentUser?.subscriptionTier || 'free_limited';
  const isTrialActive = currentUser?.isTrialActive || false;
  const isAdmin = currentUser?.role === 'superuser';

  const handleSaveProject = async () => {
    if (!newProjectName.trim()) {
        toast({ title: "Error", description: "Project name cannot be empty.", variant: "destructive" });
        return;
    }
    setIsSaving(true);
    toast({ title: "Saving Project", description: `"${newProjectName}" is being packaged for PixelStore...` });
    
    // Simulate delay for saving
    await new Promise(resolve => setTimeout(resolve, 2000)); 
    
    onSaveProjectToPixelStore(newProjectName); // Call the callback passed from DesktopEnvironment
    
    toast({ title: "Project Saved", description: `"${newProjectName}" has been conceptually saved to PixelStore.` });
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
              <div className="p-2 text-sm font-semibold border-b border-border/50 radiant-text">Session Files</div>
              <ul className="p-2 space-y-1 text-xs">
                <li className="flex items-center p-1 rounded hover:bg-primary/10"><FileText className="w-3 h-3 mr-2 text-accent"/> main_script.bbs</li>
                <li className="flex items-center p-1 rounded hover:bg-primary/10"><FileText className="w-3 h-3 mr-2 text-accent"/> config.json</li>
                <li className="flex items-center p-1 rounded hover:bg-primary/10"><FileText className="w-3 h-3 mr-2 text-accent"/> output_log.txt</li>
                <li className="text-muted-foreground p-1">(Conceptual file list)</li>
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
                Save to PixelStore
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

    
