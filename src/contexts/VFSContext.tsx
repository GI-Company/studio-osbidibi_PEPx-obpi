
"use client";
import type * as React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

export interface VFSItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string; // For files - original content
  pepxData?: string; // For files - conceptual PEPx encoded data
  children?: Record<string, VFSItem>; // For folders
  parentId: string | null;
  path: string;
  createdAt: string;
  modifiedAt: string;
  size?: number; // Conceptual size in bytes (of original content)
  isPEPxEncoded?: boolean; // Flag if content is currently in PEPx form
}

export type VFSTree = Record<string, VFSItem>; // Represents the root, children are paths from root

interface VFSContextType {
  fileSystem: VFSTree;
  getItem: (path: string, retrieveOriginal?: boolean) => VFSItem | undefined;
  listPath: (path: string) => VFSItem[];
  createFile: (path: string, fileName: string, content?: string) => boolean;
  createFolder: (path: string, folderName: string) => boolean;
  deleteItem: (path: string) => boolean;
  updateFileContent: (filePath: string, newContent: string) => boolean;
  renameItem: (path: string, newName: string) => boolean;
  isLoading: boolean;
  convertToPEPx: (content: string) => string; // Conceptual
  convertFromPEPx: (pepxData: string) => string; // Conceptual
}

const VFSContext = createContext<VFSContextType | undefined>(undefined);

const LOCAL_STORAGE_VFS_KEY = 'binaryblocksphere_vfsData';
const LOCAL_STORAGE_PEPX_SEED_KEY = 'binaryblocksphere_pepxSeed';

// Generate or retrieve a PEPx seed
const getPepxSeed = (): string => {
  if (typeof window === 'undefined') return 'default-server-seed';
  let seed = localStorage.getItem(LOCAL_STORAGE_PEPX_SEED_KEY);
  if (!seed) {
    seed = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem(LOCAL_STORAGE_PEPX_SEED_KEY, seed);
  }
  return seed;
};


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
      return {}; 
    }
  }
  const itemName = parts[parts.length - 1];
  if (currentLevel.children && currentLevel.children[itemName]) {
    return { item: currentLevel.children[itemName], parent: currentLevel, itemName };
  }
  return { parent: currentLevel, itemName }; 
};


export const VFSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fileSystem, setFileSystem] = useState<VFSTree>(initialFileSystemStructure);
  const [isLoading, setIsLoading] = useState(true);
  const pepxSeed = getPepxSeed(); // Get seed on provider mount

  // Conceptual PEPx conversion functions
  const convertToPEPx = useCallback((content: string): string => {
    // Simulate conversion using the seed. In a real scenario, this would be a complex algorithm.
    // For this simulation, we'll just prepend a marker and a "hash" of the content + seed.
    // This is NOT real encryption or pixel conversion.
    const conceptualHash = Array.from(content + pepxSeed)
      .reduce((hash, char) => (hash << 5) - hash + char.charCodeAt(0), 0)
      .toString(16);
    return `PEPX_ENCODED_DATA_V1:[SEED:${pepxSeed.substring(0,8)}...]:[HASH:${conceptualHash}]:[CONTENT_LEN:${content.length}]:${btoa(content).substring(0,50)}...`; // Store only a snippet conceptually
  }, [pepxSeed]);

  const convertFromPEPx = useCallback((pepxData: string): string => {
    // Simulate deconversion. This would validate the hash and use the seed.
    // For simulation, we check for the marker.
    if (pepxData.startsWith('PEPX_ENCODED_DATA_V1:')) {
      // This is highly simplified. A real implementation would extract and decode the original content.
      // We are not storing the full content in pepxData in this simulation.
      // We would need to fetch original content from `item.content` if needed for display after "decoding"
      const match = pepxData.match(/\[CONTENT_LEN:(\d+)\]/);
      const originalLength = match ? parseInt(match[1], 10) : 0;
      return `(Conceptually Decoded Original Content - ${originalLength} bytes - Data was: ${pepxData.substring(0,100)})`;
    }
    return pepxData; // If not recognized as PEPx, return as is
  }, []);


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

  const getItem = useCallback((path: string, retrieveOriginal = false): VFSItem | undefined => {
    const { item } = _navigateToPath(fileSystem, path);
    if (item && item.type === 'file' && item.isPEPxEncoded && retrieveOriginal) {
      // Conceptually, this would be where you "load" the original content
      // For simulation, we just return the item, and the component using it would call convertFromPEPx if needed.
      // Or, we can decode it here for simplicity of the getter.
      return { ...item, content: item.content /* original content is preserved */, pepxData: item.pepxData };
    }
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
    const newFS = JSON.parse(JSON.stringify(fileSystem)); 
    const { item: parentFolder } = _navigateToPath(newFS, folderPath);

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
    const pepxContent = convertToPEPx(content); // Convert to PEPx format

    parentFolder.children[fileName] = {
      id: newFileId,
      name: fileName,
      type: 'file',
      content, // Store original content for easy retrieval/simulation
      pepxData: pepxContent, // Store conceptual PEPx data
      isPEPxEncoded: true, // Mark as encoded
      parentId: parentFolder.id,
      path: `${folderPath === '/' ? '' : folderPath}/${fileName}`,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      size: content.length,
    };
    parentFolder.modifiedAt = new Date().toISOString();
    saveFileSystem(newFS);
    toast({ title: "VFS Info", description: `File '${fileName}' created and encoded to PEPx in ${folderPath}.`});
    return true;
  }, [fileSystem, saveFileSystem, convertToPEPx]);

  const createFolder = useCallback((path: string, folderName: string): boolean => {
    const newFS = JSON.parse(JSON.stringify(fileSystem)); 
    const { item: parentFolder } = _navigateToPath(newFS, path);

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
    const newFS = JSON.parse(JSON.stringify(fileSystem)); 
    const { item, parent, itemName } = _navigateToPath(newFS, path);

    if (!item || !parent || !itemName || !parent.children) {
      toast({ title: "VFS Error", description: `Cannot delete: Item at ${path} not found.`, variant: "destructive" });
      return false;
    }
    
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
    item.content = newContent; // Update original content
    item.pepxData = convertToPEPx(newContent); // Re-encode to PEPx
    item.isPEPxEncoded = true;
    item.size = newContent.length;
    item.modifiedAt = new Date().toISOString();

    const { parent } = _navigateToPath(newFS, item.path);
    if(parent) parent.modifiedAt = new Date().toISOString();

    saveFileSystem(newFS);
    toast({ title: "VFS Info", description: `File '${item.name}' updated and re-encoded to PEPx.`});
    return true;
  }, [fileSystem, saveFileSystem, convertToPEPx]);

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

    if (oldItem.type === 'folder' && oldItem.children) {
        Object.values(oldItem.children).forEach(child => {
            child.parentId = oldItem.id; 
            child.path = `${oldItem.path === '/' ? '' : oldItem.path}/${child.name}`;
        });
    }

    saveFileSystem(newFS);
    toast({ title: "VFS Info", description: `Item '${itemName}' renamed to '${newName}'.`});
    return true;
  }, [fileSystem, saveFileSystem]);


  return (
    <VFSContext.Provider value={{ fileSystem, getItem, listPath, createFile, createFolder, deleteItem, updateFileContent, renameItem, isLoading, convertToPEPx, convertFromPEPx }}>
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

function _navigateToPath(fs: VFSTree, path: string): { item?: VFSItem; parent?: VFSItem; itemName?: string } {
    if (path === '/') return { item: fs['/'] };
    const parts = path.split('/').filter(p => p);
    let currentLevel = fs['/'];

    if (!currentLevel) return {}; 

    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (!currentLevel.children || !currentLevel.children[part]) {
            return i === parts.length - 1 ? { parent: currentLevel, itemName: part } : {};
        }
        if (i === parts.length - 1) { 
            return { item: currentLevel.children[part], parent: currentLevel, itemName: part };
        }
        if (currentLevel.children[part].type !== 'folder') {
            return {}; 
        }
        currentLevel = currentLevel.children[part];
    }
    return {}; 
}
