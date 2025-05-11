
"use client";
import type * as React from 'react';
import { useState, useEffect } from 'react';
import { FolderOpen, FileText, HardDrive, Zap, ChevronLeft, Home, Edit2, Trash2, FolderPlus, FilePlus, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { useVFS, type VFSItem } from '@/contexts/VFSContext';
import { Input } from './ui/input';
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function FileManagerApp() {
  const { listPath, getItem, createFile, createFolder, deleteItem, renameItem, isLoading: isVFSLoading } = useVFS();
  const [currentPath, setCurrentPath] = useState('/home/user');
  const [items, setItems] = useState<VFSItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<VFSItem | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [creatingType, setCreatingType] = useState<'file' | 'folder' | null>(null);

  useEffect(() => {
    if (!isVFSLoading) {
      setIsLoading(true);
      const pathItems = listPath(currentPath);
      setItems(pathItems.sort((a, b) => {
        if (a.type === 'folder' && b.type !== 'folder') return -1;
        if (a.type !== 'folder' && b.type === 'folder') return 1;
        return a.name.localeCompare(b.name);
      }));
      setIsLoading(false);
    }
  }, [currentPath, listPath, isVFSLoading]);

  const handleNavigate = (item: VFSItem) => {
    if (item.type === 'folder') {
      setCurrentPath(item.path);
    } else {
      // Open file (conceptual for now, or could show content in a modal)
      toast({ title: `Open File (Conceptual)`, description: `Displaying content of ${item.name}. Content: ${item.content?.substring(0,50) || '(empty)'}` });
    }
  };

  const handleGoUp = () => {
    if (currentPath === '/') return;
    const parentPath = currentPath.substring(0, currentPath.lastIndexOf('/')) || '/';
    setCurrentPath(parentPath);
  };

  const handleGoHome = () => {
    setCurrentPath('/home/user');
  };

  const handleStartRename = (item: VFSItem) => {
    setEditingItem(item);
    setNewItemName(item.name);
  };

  const handleConfirmRename = () => {
    if (editingItem && newItemName.trim()) {
      if(renameItem(editingItem.path, newItemName.trim())) {
         // VFS context already shows toast
      }
      setEditingItem(null);
      setNewItemName('');
      // Refresh list
      setItems(listPath(currentPath));
    }
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setNewItemName('');
    setCreatingType(null);
  };
  
  const handleStartCreate = (type: 'file' | 'folder') => {
    setCreatingType(type);
    setNewItemName(type === 'file' ? 'new_file.txt' : 'new_folder');
  };

  const handleConfirmCreate = () => {
    if (creatingType && newItemName.trim()) {
      if (creatingType === 'file') {
        createFile(currentPath, newItemName.trim());
      } else {
        createFolder(currentPath, newItemName.trim());
      }
      setCreatingType(null);
      setNewItemName('');
      // Refresh list
      setItems(listPath(currentPath));
    }
  };
  
  const handleDelete = (item: VFSItem) => {
    if(deleteItem(item.path)) {
        // VFS context shows toast
    }
    // Refresh list
    setItems(listPath(currentPath));
  }

  const getItemIcon = (type: VFSItem['type']) => {
    switch (type) {
      case 'folder': return FolderOpen;
      case 'file': return FileText;
      default: return FileText; // Fallback
    }
  };

  if (isLoading || isVFSLoading) {
    return <div className="flex items-center justify-center w-full h-full p-4"><p className="radiant-text">Loading VFS...</p></div>;
  }

  return (
    <div className="flex flex-col w-full h-full p-2 md:p-4 bg-card text-card-foreground rounded-md overflow-hidden">
      <CardHeader className="pb-3 text-center">
        <div className="flex items-center justify-center mb-2">
          <FolderOpen className="w-8 h-8 mr-2 text-primary" />
          <CardTitle className="text-2xl radiant-text">OSbidibi File Manager</CardTitle>
        </div>
        <CardDescription className="radiant-text">
          Current Path: {currentPath}
        </CardDescription>
      </CardHeader>
      
      <div className="flex items-center p-2 space-x-2 border-b border-primary/20">
        <Button variant="ghost" size="icon" onClick={handleGoUp} disabled={currentPath === '/'} className="button-3d-interactive"> <ChevronLeft/> </Button>
        <Button variant="ghost" size="icon" onClick={handleGoHome} className="button-3d-interactive"> <Home/> </Button>
        <Input value={currentPath} readOnly className="flex-grow bg-input/50 text-sm h-9"/>
        <Button variant="outline" size="sm" onClick={() => handleStartCreate('folder')} className="button-3d-interactive"><FolderPlus className="mr-1.5"/>New Folder</Button>
        <Button variant="outline" size="sm" onClick={() => handleStartCreate('file')} className="button-3d-interactive"><FilePlus className="mr-1.5"/>New File</Button>
      </div>

      {creatingType && (
        <div className="p-2 border-b border-primary/20 flex items-center space-x-2">
            <Label htmlFor="new-item-name" className="text-sm radiant-text">Name for new {creatingType}:</Label>
            <Input 
                id="new-item-name"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleConfirmCreate()}
                className="flex-grow bg-input/80 text-sm h-8"
                autoFocus
            />
            <Button variant="ghost" size="icon" onClick={handleConfirmCreate} className="text-green-400 button-3d-interactive"><Check/></Button>
            <Button variant="ghost" size="icon" onClick={handleCancelEdit} className="text-red-400 button-3d-interactive"><X/></Button>
        </div>
      )}

      <CardContent className="flex-grow p-2 overflow-hidden">
        <ScrollArea className="h-full p-1 -m-1">
            {items.length === 0 && !isLoading && <p className="text-center text-muted-foreground radiant-text p-4">This folder is empty.</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {items.map((item) => (
                    <div key={item.id} className="relative group">
                        {editingItem?.id === item.id ? (
                            <div className="p-3 flex flex-col items-start space-y-1.5 glassmorphic !bg-card/90 border border-primary/50 w-full">
                                <Input 
                                    value={newItemName}
                                    onChange={(e) => setNewItemName(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleConfirmRename()}
                                    className="w-full bg-input/80 text-sm h-8 mb-1"
                                    autoFocus
                                />
                                <div className="flex space-x-1 w-full justify-end">
                                    <Button variant="ghost" size="icon" onClick={handleConfirmRename} className="text-green-400 h-7 w-7 button-3d-interactive"><Check className="h-4 w-4"/></Button>
                                    <Button variant="ghost" size="icon" onClick={handleCancelEdit} className="text-red-400 h-7 w-7 button-3d-interactive"><X className="h-4 w-4"/></Button>
                                </div>
                            </div>
                        ) : (
                            <Button
                                variant="outline"
                                className="h-auto p-3 flex flex-col items-start space-y-1.5 text-left glassmorphic !bg-card/60 hover:!bg-primary/20 button-3d-interactive w-full"
                                aria-label={`Open ${item.name}`}
                                onDoubleClick={() => handleNavigate(item)} // Use double click to navigate
                                onClick={(e) => { // Single click for selection or other actions if needed
                                    if (e.detail === 2) return; // Already handled by double click
                                    // console.log("Selected:", item.name);
                                }}
                            >
                                <div className="flex items-center w-full justify-between">
                                    {React.createElement(getItemIcon(item.type), { className: `w-7 h-7 ${item.type === 'folder' ? 'text-accent' : 'text-primary'}` })}
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleStartRename(item); }} className="h-6 w-6 text-muted-foreground hover:text-accent"><Edit2 className="h-3.5 w-3.5"/></Button>
                                        <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()} className="h-6 w-6 text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5"/></Button>
                                          </AlertDialogTrigger>
                                          <AlertDialogContent className="glassmorphic">
                                            <AlertDialogHeader>
                                              <AlertDialogTitle className="radiant-text">Are you sure?</AlertDialogTitle>
                                              <AlertDialogDescription className="radiant-text">
                                                This action cannot be undone. This will permanently delete '{item.name}'.
                                              </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                              <AlertDialogCancel className="button-3d-interactive">Cancel</AlertDialogCancel>
                                              <AlertDialogAction onClick={(e) => {e.stopPropagation(); handleDelete(item);}} className="bg-destructive hover:bg-destructive/90 button-3d-interactive">Delete</AlertDialogAction>
                                            </AlertDialogFooter>
                                          </AlertDialogContent>
                                        </AlertDialog>

                                    </div>
                                </div>
                                <h4 className="text-sm font-semibold truncate radiant-text text-foreground w-full">{item.name}</h4>
                                <div className="text-xs text-muted-foreground space-x-2">
                                    <span>Type: {item.type}</span>
                                    {item.type === 'file' && <span>Size: {item.size !== undefined ? (item.size / 1024).toFixed(2) + ' KB' : 'N/A'}</span>}
                                </div>
                                <p className="text-xs text-muted-foreground/70">Modified: {new Date(item.modifiedAt).toLocaleDateString()}</p>
                            </Button>
                        )}
                    </div>
                ))}
            </div>
        </ScrollArea>
      </CardContent>
      <div className="p-2 text-xs text-center text-muted-foreground/70 border-t border-primary/20">
        OSbidibi Virtual File System. Double-click folders to open.
      </div>
    </div>
  );
}
