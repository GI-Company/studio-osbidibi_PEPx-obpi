
"use client";
import type * as React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

export interface VFSItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string; // For files
  children?: Record<string, VFSItem>; // For folders
  parentId: string | null;
  path: string;
  createdAt: string;
  modifiedAt: string;
  size?: number; // Conceptual size in bytes
}

export type VFSTree = Record<string, VFSItem>; // Represents the root, children are paths from root

interface VFSContextType {
  fileSystem: VFSTree;
  getItem: (path: string) => VFSItem | undefined;
  listPath: (path: string) => VFSItem[];
  createFile: (path: string, fileName: string, content?: string) => boolean;
  createFolder: (path: string, folderName: string) => boolean;
  deleteItem: (path: string) => boolean;
  updateFileContent: (filePath: string, newContent: string) => boolean;
  renameItem: (path: string, newName: string) => boolean;
  isLoading: boolean;
}

const VFSContext = createContext<VFSContextType | undefined>(undefined);

const LOCAL_STORAGE_VFS_KEY = 'binaryblocksphere_vfsData';

const initialFileSystemStructure: VFSTree = {
  '/': {
    id: 'root',
    name: '/',
    type: 'folder',
    children: {
      'home': {
        id: 'home',
        name: 'home',
        type: 'folder',
        parentId: 'root',
        path: '/home',
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
        children: {
          'user': {
            id: 'user',
            name: 'user',
            type: 'folder',
            parentId: 'home',
            path: '/home/user',
            createdAt: new Date().toISOString(),
            modifiedAt: new Date().toISOString(),
            children: {
                 'documents': { id: 'docs', name: 'documents', type: 'folder', parentId: 'user', path: '/home/user/documents', createdAt: new Date().toISOString(), modifiedAt: new Date().toISOString(), children: {} },
                 'projects': { id: 'projs', name: 'projects', type: 'folder', parentId: 'user', path: '/home/user/projects', createdAt: new Date().toISOString(), modifiedAt: new Date().toISOString(), children: {} },
            }
          }
        }
      },
      'tmp': { id: 'tmp', name: 'tmp', type: 'folder', parentId: 'root', path: '/tmp', createdAt: new Date().toISOString(), modifiedAt: new Date().toISOString(), children: {} },
      'virtual_fs': {
        id: 'vfs',
        name: 'virtual_fs',
        type: 'folder',
        parentId: 'root',
        path: '/virtual_fs',
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
        children: {
          'downloads': { id: 'downloads', name: 'downloads', type: 'folder', parentId: 'vfs', path: '/virtual_fs/downloads', createdAt: new Date().toISOString(), modifiedAt: new Date().toISOString(), children: {} },
        },
      },
      'mnt': {id: 'mnt', name: 'mnt', type: 'folder', parentId: 'root', path: '/mnt', createdAt: new Date().toISOString(), modifiedAt: new Date().toISOString(), children: {}},
    },
    parentId: null,
    path: '/',
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
  }
};


// Helper function to navigate to a path and get the item or its parent
// This was the line with the error: const_navigateToPath
const _navigateToPathInternal = (fs: VFSTree, path: string): { item?: VFSItem, parent?: VFSItem, itemName?: string } => {
  if (path === '/') return { item: fs['/'] };
  const parts = path.split('/').filter(p => p);
  let currentLevel = fs['/'];
  if (!currentLevel || !currentLevel.children) return {};

  for (let i = 0; i < parts.length -1; i++) {
    const part = parts[i];
    if (currentLevel.children && currentLevel.children[part] && currentLevel.children[part].type === 'folder') {
      currentLevel = currentLevel.children[part];
    } else {
      return {}; // Path not found or not a folder
    }
  }
  const itemName = parts[parts.length - 1];
  if (currentLevel.children && currentLevel.children[itemName]) {
    return { item: currentLevel.children[itemName], parent: currentLevel, itemName };
  }
  return { parent: currentLevel, itemName }; // Item doesn't exist, but parent does
};


export const VFSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fileSystem, setFileSystem] = useState<VFSTree>(initialFileSystemStructure);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const storedVFS = localStorage.getItem(LOCAL_STORAGE_VFS_KEY);
    if (storedVFS) {
      try {
        setFileSystem(JSON.parse(storedVFS));
      } catch (e) {
        console.error("Failed to parse VFS from localStorage, resetting.", e);
        setFileSystem(initialFileSystemStructure);
        localStorage.setItem(LOCAL_STORAGE_VFS_KEY, JSON.stringify(initialFileSystemStructure));
      }
    } else {
      localStorage.setItem(LOCAL_STORAGE_VFS_KEY, JSON.stringify(initialFileSystemStructure));
    }
    setIsLoading(false);
  }, []);

  const saveFileSystem = useCallback((newFS: VFSTree) => {
    setFileSystem(newFS);
    localStorage.setItem(LOCAL_STORAGE_VFS_KEY, JSON.stringify(newFS));
  }, []);

  const getItem = useCallback((path: string): VFSItem | undefined => {
    const { item } = _navigateToPath(fileSystem, path);
    return item;
  }, [fileSystem]);

  const listPath = useCallback((path: string): VFSItem[] => {
    const { item } = _navigateToPath(fileSystem, path);
    if (item && item.type === 'folder' && item.children) {
      return Object.values(item.children);
    }
    return [];
  }, [fileSystem]);

  const createFile = useCallback((folderPath: string, fileName: string, content: string = ''): boolean => {
    const newFS = JSON.parse(JSON.stringify(fileSystem)); // Deep copy
    const { item: parentFolder, itemName: resolvedFolderName  } = _navigateToPath(newFS, folderPath);

    if (!parentFolder || parentFolder.type !== 'folder') {
      toast({ title: "VFS Error", description: `Cannot create file: Path ${folderPath} not found or not a folder.`, variant: "destructive" });
      return false;
    }
    if (!parentFolder.children) parentFolder.children = {};

    if (parentFolder.children[fileName]) {
      toast({ title: "VFS Error", description: `File or folder named '${fileName}' already exists in ${folderPath}.`, variant: "destructive" });
      return false;
    }
    
    const newFileId = `file-${Date.now()}-${Math.random().toString(36).substring(2,7)}`;
    parentFolder.children[fileName] = {
      id: newFileId,
      name: fileName,
      type: 'file',
      content,
      parentId: parentFolder.id,
      path: `${folderPath === '/' ? '' : folderPath}/${fileName}`,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      size: content.length,
    };
    parentFolder.modifiedAt = new Date().toISOString();
    saveFileSystem(newFS);
    toast({ title: "VFS Info", description: `File '${fileName}' created in ${folderPath}.`});
    return true;
  }, [fileSystem, saveFileSystem]);

  const createFolder = useCallback((path: string, folderName: string): boolean => {
    const newFS = JSON.parse(JSON.stringify(fileSystem)); // Deep copy
    const { item: parentFolder, itemName: resolvedFolderName } = _navigateToPath(newFS, path);

    if (!parentFolder || parentFolder.type !== 'folder') {
      toast({ title: "VFS Error", description: `Cannot create folder: Path ${path} not found or not a folder.`, variant: "destructive" });
      return false;
    }
     if (!parentFolder.children) parentFolder.children = {};

    if (parentFolder.children[folderName]) {
      toast({ title: "VFS Error", description: `File or folder named '${folderName}' already exists in ${path}.`, variant: "destructive" });
      return false;
    }

    const newFolderId = `folder-${Date.now()}-${Math.random().toString(36).substring(2,7)}`;
    parentFolder.children[folderName] = {
      id: newFolderId,
      name: folderName,
      type: 'folder',
      children: {},
      parentId: parentFolder.id,
      path: `${path === '/' ? '' : path}/${folderName}`,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
    };
    parentFolder.modifiedAt = new Date().toISOString();
    saveFileSystem(newFS);
    toast({ title: "VFS Info", description: `Folder '${folderName}' created in ${path}.`});
    return true;
  }, [fileSystem, saveFileSystem]);

  const deleteItem = useCallback((path: string): boolean => {
    const newFS = JSON.parse(JSON.stringify(fileSystem)); // Deep copy
    const { item, parent, itemName } = _navigateToPath(newFS, path);

    if (!item || !parent || !itemName || !parent.children) {
      toast({ title: "VFS Error", description: `Cannot delete: Item at ${path} not found.`, variant: "destructive" });
      return false;
    }
    
    // Prevent deletion of core directories, adjust as needed
    const protectedPaths = ['/', '/home', '/home/user', '/tmp', '/virtual_fs', '/mnt'];
    if(protectedPaths.includes(path)) {
        toast({ title: "VFS Error", description: `Cannot delete protected system path: ${path}.`, variant: "destructive" });
        return false;
    }

    delete parent.children[itemName];
    parent.modifiedAt = new Date().toISOString();
    saveFileSystem(newFS);
    toast({ title: "VFS Info", description: `Item '${itemName}' deleted from ${parent.path}.`});
    return true;
  }, [fileSystem, saveFileSystem]);

  const updateFileContent = useCallback((filePath: string, newContent: string): boolean => {
    const newFS = JSON.parse(JSON.stringify(fileSystem));
    const { item } = _navigateToPath(newFS, filePath);

    if (!item || item.type !== 'file') {
      toast({ title: "VFS Error", description: `Cannot update content: ${filePath} is not a file or not found.`, variant: "destructive" });
      return false;
    }
    item.content = newContent;
    item.size = newContent.length;
    item.modifiedAt = new Date().toISOString();

    // Update parent modified time too
    const { parent } = _navigateToPath(newFS, item.path);
    if(parent) parent.modifiedAt = new Date().toISOString();

    saveFileSystem(newFS);
    toast({ title: "VFS Info", description: `File '${item.name}' updated.`});
    return true;
  }, [fileSystem, saveFileSystem]);

  const renameItem = useCallback((path: string, newName: string): boolean => {
    const newFS = JSON.parse(JSON.stringify(fileSystem));
    const { item, parent, itemName } = _navigateToPath(newFS, path);

    if (!item || !parent || !itemName || !parent.children) {
      toast({ title: "VFS Error", description: `Cannot rename: Item at ${path} not found.`, variant: "destructive" });
      return false;
    }
    if (parent.children[newName]) {
      toast({ title: "VFS Error", description: `Cannot rename: Item named '${newName}' already exists in this folder.`, variant: "destructive" });
      return false;
    }
    const protectedPaths = ['/', '/home', '/home/user', '/tmp', '/virtual_fs', '/mnt'];
    if(protectedPaths.includes(path)) {
        toast({ title: "VFS Error", description: `Cannot rename protected system path: ${path}.`, variant: "destructive" });
        return false;
    }

    const oldItem = parent.children[itemName];
    delete parent.children[itemName];
    
    oldItem.name = newName;
    oldItem.path = `${parent.path === '/' ? '' : parent.path}/${newName}`;
    oldItem.modifiedAt = new Date().toISOString();
    parent.children[newName] = oldItem;
    parent.modifiedAt = new Date().toISOString();

    // If it's a folder, update children paths (conceptual, deep update not fully implemented here for brevity)
    if (oldItem.type === 'folder' && oldItem.children) {
        Object.values(oldItem.children).forEach(child => {
            child.parentId = oldItem.id; // Ensure parentId is correct after potential rename
            child.path = `${oldItem.path === '/' ? '' : oldItem.path}/${child.name}`;
            // Recursively update paths for children of children if needed
        });
    }

    saveFileSystem(newFS);
    toast({ title: "VFS Info", description: `Item '${itemName}' renamed to '${newName}'.`});
    return true;
  }, [fileSystem, saveFileSystem]);


  return (
    <VFSContext.Provider value={{ fileSystem, getItem, listPath, createFile, createFolder, deleteItem, updateFileContent, renameItem, isLoading }}>
      {children}
    </VFSContext.Provider>
  );
};

export const useVFS = (): VFSContextType => {
  const context = useContext(VFSContext);
  if (context === undefined) {
    throw new Error('useVFS must be used within a VFSProvider');
  }
  return context;
};

// Helper function to navigate to a path - internal
// This version is more robust for modification operations
function _navigateToPath(fs: VFSTree, path: string): { item?: VFSItem; parent?: VFSItem; itemName?: string } {
    if (path === '/') return { item: fs['/'] };
    const parts = path.split('/').filter(p => p);
    let currentLevel = fs['/'];

    if (!currentLevel) return {}; // Should not happen if fs is initialized with root

    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (!currentLevel.children || !currentLevel.children[part]) {
            // Path part not found, return parent if it's the last part
            return i === parts.length - 1 ? { parent: currentLevel, itemName: part } : {};
        }
        if (i === parts.length - 1) { // Last part
            return { item: currentLevel.children[part], parent: currentLevel, itemName: part };
        }
        if (currentLevel.children[part].type !== 'folder') {
            return {}; // Intermediate path part is not a folder
        }
        currentLevel = currentLevel.children[part];
    }
    return {}; // Should be covered by earlier returns
}
