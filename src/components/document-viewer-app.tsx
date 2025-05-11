
"use client";
import type * as React from 'react';
import { useState, useCallback } from 'react';
import { useVFS, type VFSItem } from '@/contexts/VFSContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { FileSearch, Edit3, Save, UploadCloud, Image as ImageIcon, FileText, AlertTriangle, XCircle, CheckCircle } from 'lucide-react';
import { Input } from './ui/input';
import Image from 'next/image';

const SUPPORTED_TEXT_EXTENSIONS = ['.txt', '.md', '.json', '.xml', '.log', '.js', '.ts', '.css', '.html', '.py', '.java', '.c', '.cpp', '.cs', '.sh', '.bat'];
const SUPPORTED_IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'];

export function DocumentViewerApp() {
  const { getItem, updateFileContent, createFile, listPath } = useVFS();
  const [selectedFile, setSelectedFile] = useState<VFSItem | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedContent, setEditedContent] = useState<string>('');
  const [currentPath, setCurrentPath] = useState<string>('/home/user/documents'); // Default path
  const [pathInput, setPathInput] = useState<string>('/home/user/documents');
  const [filesInPath, setFilesInPath] = useState<VFSItem[]>([]);

  const fetchFiles = useCallback((path: string) => {
    const items = listPath(path);
    setFilesInPath(items.filter(item => item.type === 'file'));
    setCurrentPath(path);
  }, [listPath]);

  useState(() => {
    fetchFiles(currentPath);
  });

  const handlePathChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPathInput(e.target.value);
  };

  const handleBrowsePath = () => {
    fetchFiles(pathInput);
  };

  const handleFileSelect = (file: VFSItem) => {
    setSelectedFile(file);
    setIsEditing(false); // Reset editing state
    if (file.type === 'file') {
      const content = file.content || '';
      setFileContent(content);
      setEditedContent(content); // Initialize editor with current content
    } else {
      setFileContent('');
      setEditedContent('');
    }
  };

  const handleToggleEdit = () => {
    if (!selectedFile || !isTextEditable(selectedFile.name)) {
      toast({ title: "Cannot Edit", description: "This file type is not directly editable here.", variant: "destructive" });
      return;
    }
    setIsEditing(!isEditing);
    if (!isEditing) setEditedContent(fileContent); // If starting edit, load current content
  };

  const handleSaveEdit = () => {
    if (selectedFile && isEditing) {
      if (updateFileContent(selectedFile.path, editedContent)) {
        setFileContent(editedContent);
        setIsEditing(false);
        fetchFiles(currentPath); // Refresh file list to show updated modified time/size
      }
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const content = e.target?.result as string;
        if (createFile(currentPath, file.name, content)) {
            fetchFiles(currentPath); // Refresh list
            toast({ title: "File Uploaded", description: `${file.name} uploaded to VFS at ${currentPath}.` });
        }
    };
    reader.readAsText(file); // Assuming text files for now
    event.target.value = ''; // Reset input
  };

  const getFileExtension = (fileName: string) => {
    return fileName.slice(((fileName.lastIndexOf(".") - 1) >>> 0) + 1).toLowerCase();
  };

  const isTextEditable = (fileName: string) => {
    const ext = getFileExtension(fileName);
    return SUPPORTED_TEXT_EXTENSIONS.includes(ext);
  };

  const isImageViewable = (fileName: string) => {
    const ext = getFileExtension(fileName);
    return SUPPORTED_IMAGE_EXTENSIONS.includes(ext);
  };


  const renderFileContent = () => {
    if (!selectedFile) return <p className="text-muted-foreground radiant-text">Select a file to view its content.</p>;

    if (isEditing) {
      return (
        <Textarea
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          rows={15}
          className="font-mono text-xs bg-input/70 focus:bg-input"
        />
      );
    }
    
    const ext = getFileExtension(selectedFile.name);

    if (isTextEditable(selectedFile.name)) {
      return <pre className="p-2 text-xs whitespace-pre-wrap bg-black/30 rounded-md max-h-96 overflow-auto radiant-text">{fileContent || "(Empty File)"}</pre>;
    }
    if (isImageViewable(selectedFile.name)) {
      if (selectedFile.content?.startsWith('data:image')) { // Check if content is a data URI
         return <Image src={selectedFile.content} alt={selectedFile.name} width={500} height={300} className="max-w-full h-auto rounded-md border border-border shadow-md" data-ai-hint="file image" />;
      }
      // Placeholder for non-data URI images, or if content is just a path.
      return <div className="flex flex-col items-center justify-center p-4 border rounded-md bg-muted/30"><ImageIcon className="w-16 h-16 text-muted-foreground mb-2" /><p className="text-muted-foreground radiant-text">Image: {selectedFile.name} (Display for VFS path images is conceptual)</p></div>;
    }

    // Fallback for unsupported types
    return (
      <div className="flex flex-col items-center justify-center p-4 border rounded-md bg-muted/30">
        <AlertTriangle className="w-10 h-10 text-amber-500 mb-2" />
        <p className="font-semibold radiant-text">Unsupported File Type</p>
        <p className="text-xs text-muted-foreground radiant-text">
          Direct viewing/editing for '{ext}' files is not supported in this viewer.
        </p>
        <p className="text-xs text-muted-foreground radiant-text mt-1">Path: {selectedFile.path}</p>
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full h-full p-2 md:p-4 bg-card text-card-foreground rounded-md overflow-hidden">
      <CardHeader className="pb-3 text-center">
        <div className="flex items-center justify-center mb-2">
          <FileSearch className="w-8 h-8 mr-2 text-primary" />
          <CardTitle className="text-2xl radiant-text">Document Viewer</CardTitle>
        </div>
        <CardDescription className="radiant-text">
          Browse and view files from the OSbidibi Virtual File System.
        </CardDescription>
      </CardHeader>

      <div className="flex flex-col md:flex-row gap-2 p-2 border-b border-primary/20">
        <div className="flex flex-col flex-grow gap-1">
            <label htmlFor="path-input" className="text-xs text-muted-foreground radiant-text">Current VFS Path:</label>
            <Input id="path-input" value={pathInput} onChange={handlePathChange} placeholder="Enter VFS path (e.g., /home/user)" className="h-9 text-sm bg-input/60 focus:bg-input" />
        </div>
        <div className="flex items-end gap-2">
            <Button onClick={handleBrowsePath} variant="outline" className="h-9 button-3d-interactive">Browse</Button>
            <label htmlFor="file-upload" className="h-9 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground px-3 cursor-pointer button-3d-interactive">
                <UploadCloud className="w-4 h-4 mr-2"/> Upload File
                <input id="file-upload" type="file" className="sr-only" onChange={handleFileUpload} />
            </label>
        </div>
      </div>

      <div className="flex flex-grow min-h-0">
        <ScrollArea className="w-1/3 md:w-1/4 p-2 border-r border-primary/20">
          <h4 className="text-sm font-semibold mb-2 radiant-text text-accent">Files in {currentPath}:</h4>
          {filesInPath.length === 0 && <p className="text-xs text-muted-foreground radiant-text">No files found in this directory.</p>}
          <ul className="space-y-1">
            {filesInPath.map(file => (
              <li key={file.id}>
                <Button
                  variant={selectedFile?.id === file.id ? 'secondary' : 'ghost'}
                  className="w-full justify-start text-left h-auto py-1.5 px-2 text-xs button-3d-interactive"
                  onClick={() => handleFileSelect(file)}
                >
                  <FileText className="w-3.5 h-3.5 mr-1.5 shrink-0"/>
                  <span className="truncate">{file.name}</span>
                </Button>
              </li>
            ))}
          </ul>
        </ScrollArea>

        <div className="flex-grow p-2 md:p-4 flex flex-col">
          {selectedFile && (
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold truncate radiant-text text-primary" title={selectedFile.name}>{selectedFile.name}</h3>
              <div className="flex space-x-2">
                {isTextEditable(selectedFile.name) && (
                  <Button onClick={handleToggleEdit} variant="outline" size="sm" className="button-3d-interactive">
                    {isEditing ? <XCircle className="w-4 h-4 mr-1.5"/> : <Edit3 className="w-4 h-4 mr-1.5"/>}
                    {isEditing ? 'Cancel Edit' : 'Edit Text'}
                  </Button>
                )}
                {isEditing && (
                  <Button onClick={handleSaveEdit} size="sm" className="button-3d-interactive bg-green-500 hover:bg-green-600">
                    <Save className="w-4 h-4 mr-1.5"/> Save Changes
                  </Button>
                )}
              </div>
            </div>
          )}
          <ScrollArea className="flex-grow p-1 -m-1 rounded-md glassmorphic !bg-background/30">
            <div className="p-2">
              {renderFileContent()}
            </div>
          </ScrollArea>
        </div>
      </div>
      <div className="p-2 text-xs text-center text-muted-foreground/70 border-t border-primary/20">
        File operations interact with the VFS. Some file types are conceptual.
      </div>
    </div>
  );
}

