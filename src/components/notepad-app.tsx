
"use client";
import type * as React from 'react';
import { useState, useCallback } from 'react';
import { useVFS, type VFSItem } from '@/contexts/VFSContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { NotebookText, Save, FolderOpen, Copy, Scissors, ClipboardPaste, FilePlus, PlusSquare, ListPlus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal
} from "@/components/ui/dropdown-menu";

const DEFAULT_SAVE_PATH = '/home/user/documents/';
const DEFAULT_FILE_NAME = 'untitled.txt';

interface InternalNote {
  id: string;
  title: string;
  content: string;
}

export function NotepadApp() {
  const { createFile, getItem, updateFileContent, listPath } = useVFS();
  const [currentContent, setCurrentContent] = useState<string>('');
  const [currentFilePath, setCurrentFilePath] = useState<string | null>(null);
  const [currentFileName, setCurrentFileName] = useState<string>(DEFAULT_FILE_NAME);
  const [savePathInput, setSavePathInput] = useState<string>(DEFAULT_SAVE_PATH);
  
  // Conceptual internal notes state
  const [internalNotes, setInternalNotes] = useState<InternalNote[]>([]);
  const [activeInternalNoteId, setActiveInternalNoteId] = useState<string | null>(null);


  const handleNewFile = () => {
    setCurrentContent('');
    setCurrentFilePath(null);
    setCurrentFileName(DEFAULT_FILE_NAME);
    setActiveInternalNoteId(null);
    toast({ title: "New Note", description: "Editor cleared for a new note." });
  };

  const handleSaveFile = async () => {
    let path = currentFilePath;
    let name = currentFileName;

    if (!path) { // File hasn't been saved yet
      const fullPath = `${savePathInput.endsWith('/') ? savePathInput : savePathInput + '/'}${name}`;
      // Check if file exists, if so, confirm overwrite or prompt for new name. For simplicity, we'll update if exists or create.
      const existingFile = getItem(fullPath);
      if (existingFile) {
        if (updateFileContent(fullPath, currentContent)) {
          setCurrentFilePath(fullPath);
          toast({ title: "File Updated", description: `${name} saved to VFS at ${fullPath}.` });
        }
      } else {
        if (createFile(savePathInput, name, currentContent)) {
          setCurrentFilePath(fullPath);
          toast({ title: "File Saved", description: `${name} saved to VFS at ${fullPath}.` });
        }
      }
    } else { // File already exists, just update
      if (updateFileContent(path, currentContent)) {
        toast({ title: "File Updated", description: `${name} updated in VFS.` });
      }
    }
  };

  const handleLoadFile = (file: VFSItem) => {
    if (file.type === 'file' && file.content !== undefined) {
      setCurrentContent(file.content);
      setCurrentFilePath(file.path);
      setCurrentFileName(file.name);
      setActiveInternalNoteId(null); // Loading from VFS, clear internal note selection
      toast({ title: "File Loaded", description: `${file.name} loaded from VFS.` });
    } else {
      toast({ title: "Error", description: "Could not load file content.", variant: "destructive" });
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(currentContent)
      .then(() => toast({ title: "Copied", description: "Content copied to clipboard." }))
      .catch(err => toast({ title: "Error", description: "Failed to copy to clipboard.", variant: "destructive" }));
  };
  
  const handlePasteFromClipboard = () => {
    navigator.clipboard.readText()
      .then(text => {
        const selectionStart = (document.activeElement as HTMLTextAreaElement)?.selectionStart ?? currentContent.length;
        const selectionEnd = (document.activeElement as HTMLTextAreaElement)?.selectionEnd ?? currentContent.length;
        const newText = currentContent.slice(0, selectionStart) + text + currentContent.slice(selectionEnd);
        setCurrentContent(newText);
        toast({ title: "Pasted", description: "Content pasted from clipboard." });
      })
      .catch(err => toast({ title: "Error", description: "Failed to paste from clipboard.", variant: "destructive" }));
  };

  // Conceptual: Copy selected text to a new internal note
  const handleCopyToNewInternalNote = () => {
    const selectedText = window.getSelection()?.toString() || currentContent;
    if (!selectedText.trim()) {
        toast({title: "Info", description: "No text selected or content is empty. Copied full content if available."});
    }
    const newNote: InternalNote = {
      id: `note-${Date.now()}`,
      title: `Note ${internalNotes.length + 1} (from selection)`,
      content: selectedText,
    };
    setInternalNotes(prev => [...prev, newNote]);
    setActiveInternalNoteId(newNote.id);
    toast({ title: "Copied to New Internal Note", description: `"${newNote.title}" created.` });
  };

  // Conceptual: Add selected text to an existing internal note
  const handleAddToExistingInternalNote = (noteId: string) => {
    const selectedText = window.getSelection()?.toString() || currentContent;
     if (!selectedText.trim()) {
        toast({title: "Info", description: "No text selected or content is empty. Added full content if available."});
    }
    setInternalNotes(prev => prev.map(note =>
      note.id === noteId ? { ...note, content: note.content + "\n\n--- Appended ---\n" + selectedText } : note
    ));
    toast({ title: "Appended to Internal Note", description: `Text appended to selected note.` });
  };
  
  const handleLoadFromInternalNote = (noteId: string) => {
    const note = internalNotes.find(n => n.id === noteId);
    if (note) {
        setCurrentContent(note.content);
        setCurrentFileName(`Internal Note - ${note.title}.txt`); // Suggest a name if saving
        setCurrentFilePath(null); // This is not from VFS directly
        setActiveInternalNoteId(note.id);
        toast({ title: "Loaded from Internal Note", description: `Content from "${note.title}" loaded.` });
    }
  };


  return (
    <div className="flex flex-col w-full h-full p-2 md:p-4 bg-card text-card-foreground rounded-md overflow-hidden">
      <CardHeader className="pb-3 text-center">
        <div className="flex items-center justify-center mb-2">
          <NotebookText className="w-8 h-8 mr-2 text-primary" />
          <CardTitle className="text-2xl radiant-text">Notepad</CardTitle>
        </div>
        <CardDescription className="radiant-text">
          Create, edit, and save text notes. Current file: {currentFilePath ? currentFilePath : '(Unsaved - ' + currentFileName + ')'}
        </CardDescription>
      </CardHeader>

      <div className="flex items-center p-2 space-x-2 border-b border-primary/20 mb-2">
        <Button onClick={handleNewFile} variant="outline" size="sm" className="button-3d-interactive"><FilePlus className="mr-1.5"/>New</Button>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="button-3d-interactive"><FolderOpen className="mr-1.5"/>Open from VFS</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 glassmorphic">
                <DropdownMenuLabel className="radiant-text">Select a .txt file from /documents</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <ScrollArea className="h-48">
                {listPath('/home/user/documents').filter(f => f.name.endsWith(".txt")).map(file => (
                    <DropdownMenuItem key={file.id} onSelect={() => handleLoadFile(file)} className="text-xs hover:bg-primary/20">
                        {file.name}
                    </DropdownMenuItem>
                ))}
                {listPath('/home/user/documents').filter(f => f.name.endsWith(".txt")).length === 0 && 
                    <DropdownMenuItem disabled className="text-xs text-muted-foreground">No .txt files in /documents</DropdownMenuItem>
                }
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
        <Button onClick={handleSaveFile} variant="outline" size="sm" className="button-3d-interactive"><Save className="mr-1.5"/>Save</Button>
        
        <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="button-3d-interactive ml-auto">Edit</Button></DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 glassmorphic">
                <DropdownMenuItem onSelect={handleCopyToClipboard}><Copy className="mr-2 h-4 w-4"/>Copy to Clipboard</DropdownMenuItem>
                <DropdownMenuItem onSelect={handlePasteFromClipboard}><ClipboardPaste className="mr-2 h-4 w-4"/>Paste from Clipboard</DropdownMenuItem>
                <DropdownMenuSeparator/>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger><ListPlus className="mr-2 h-4 w-4"/>Copy to Internal Note</DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent className="glassmorphic">
                      <DropdownMenuItem onSelect={handleCopyToNewInternalNote}><PlusSquare className="mr-2 h-4 w-4"/>New Internal Note</DropdownMenuItem>
                      {internalNotes.length > 0 && <DropdownMenuSeparator/>}
                      {internalNotes.map(note => (
                        <DropdownMenuItem key={note.id} onSelect={() => handleAddToExistingInternalNote(note.id)}>
                          Append to: {note.title}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger><FolderOpen className="mr-2 h-4 w-4"/>Load from Internal Note</DropdownMenuSubTrigger>
                   <DropdownMenuPortal>
                    <DropdownMenuSubContent className="glassmorphic">
                        {internalNotes.length === 0 && <DropdownMenuItem disabled>No internal notes</DropdownMenuItem>}
                        {internalNotes.map(note => (
                            <DropdownMenuItem key={note.id} onSelect={() => handleLoadFromInternalNote(note.id)}>
                                {note.title}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
            </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2 text-xs">
        <div>
            <Label htmlFor="fileNameInput" className="radiant-text">File Name:</Label>
            <Input 
                id="fileNameInput" 
                value={currentFileName} 
                onChange={(e) => setCurrentFileName(e.target.value)} 
                className="h-8 bg-input/70 focus:bg-input"
                placeholder="e.g., my_note.txt"
            />
        </div>
        <div className="md:col-span-2">
            <Label htmlFor="savePathInput" className="radiant-text">Save Path (VFS):</Label>
            <Input 
                id="savePathInput" 
                value={savePathInput} 
                onChange={(e) => setSavePathInput(e.target.value)} 
                className="h-8 bg-input/70 focus:bg-input"
                placeholder="e.g., /home/user/documents/"
            />
        </div>
      </div>

      <CardContent className="flex-grow p-0">
        <Textarea
          value={currentContent}
          onChange={(e) => setCurrentContent(e.target.value)}
          placeholder="Start typing your note here..."
          className="w-full h-full resize-none bg-input/50 focus:bg-input text-sm p-3 font-mono"
          aria-label="Notepad content area"
        />
      </CardContent>
       <div className="p-2 mt-2 text-xs text-center text-muted-foreground/70 border-t border-primary/20">
        Notes are saved to the OSbidibi Virtual File System. Conceptual copy/paste to internal notes is available.
      </div>
    </div>
  );
}
