
"use client";
import type * as React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

export interface VFSItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string; // For files - original, unencoded content
  pepxData?: string; // For files - conceptual PEPx encoded data string representation
  children?: Record<string, VFSItem>; // For folders
  parentId: string | null;
  path: string;
  createdAt: string;
  modifiedAt: string;
  size?: number; // Conceptual size in bytes (of original content)
  isPEPxEncoded?: boolean; // Flag if content is currently "PEPx encoded"
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
  convertToPEPx: (content: string) => string; // Conceptual
  convertFromPEPx: (pepxData: string) => string; // Conceptual
}

const VFSContext = createContext<VFSContextType | undefined>(undefined);

const LOCAL_STORAGE_VFS_KEY = 'binaryblocksphere_vfsData';
const LOCAL_STORAGE_PEPX_SEED_KEY = 'binaryblocksphere_pepxSeed';

// Generate or retrieve a PEPx seed
const getPepxSeed = (): string => {
  if (typeof window === 'undefined') return 'default-server-seed-' + Date.now(); // Ensure some uniqueness for server context if ever used
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
        id: 'vfs_root', // Changed ID to avoid conflict if 'vfs' is used as a folder name
        name: 'virtual_fs',
        type: 'folder',
        parentId: 'root',
        path: '/virtual_fs',
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
        children: {
          'downloads': { id: 'downloads', name: 'downloads', type: 'folder', parentId: 'vfs_root', path: '/virtual_fs/downloads', createdAt: new Date().toISOString(), modifiedAt: new Date().toISOString(), children: {} },
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
  // If item doesn't exist, but parent does, return parent and potential itemName
  return { parent: currentLevel, itemName }; 
};


export const VFSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fileSystem, setFileSystem] = useState<VFSTree>(initialFileSystemStructure);
  const [isLoading, setIsLoading] = useState(true);
  const [pepxSeed, setPepxSeed] = useState<string>('');

  useEffect(() => {
    setPepxSeed(getPepxSeed());
  }, []);


  // Conceptual PEPx conversion functions
  const convertToPEPx = useCallback((content: string): string => {
    if (!pepxSeed) return `PEPX_ENCODING_ERROR:SEED_UNAVAILABLE`;
    // Simulate conversion using the seed.
    // This is NOT real encryption or pixel conversion.
    // It's a string representation for the simulation.
    let hashInput = content + pepxSeed;
    let conceptualHash = 0;
    for (let i = 0; i < hashInput.length; i++) {
        const char = hashInput.charCodeAt(i);
        conceptualHash = ((conceptualHash << 5) - conceptualHash) + char;
        conceptualHash |= 0; // Convert to 32bit integer
    }
    conceptualHash = Math.abs(conceptualHash);

    // Truncate or represent original content for verifiability in simulation
    const contentRepresentation = content.length > 50 ? content.substring(0, 25) + "..." + content.substring(content.length - 25) : content;
    
    return `PEPX_ENCODED_V2:[SEED_REF:${pepxSeed.substring(0,6)}...]:[CHASH:${conceptualHash.toString(16)}]:[ORIG_LEN:${content.length}B]:[DATA_REPR:${btoa(encodeURIComponent(contentRepresentation))}]`;
  }, [pepxSeed]);

  const convertFromPEPx = useCallback((pepxData: string): string => {
    // Simulate deconversion. This would validate the hash and use the seed.
    // For simulation, we check for the marker and extract the conceptual representation.
    if (pepxData && pepxData.startsWith('PEPX_ENCODED_V2:')) {
      const dataReprMatch = pepxData.match(/\[DATA_REPR:(.*?)\]/);
      const origLenMatch = pepxData.match(/\[ORIG_LEN:(\d+)B\]/);
      const originalLength = origLenMatch ? parseInt(origLenMatch[1], 10) : 0;

      if (dataReprMatch && dataReprMatch[1]) {
        try {
            const decodedRepr = decodeURIComponent(atob(dataReprMatch[1]));
            return `(Conceptually Decoded Original Content - ${originalLength} bytes. Representation: "${decodedRepr}")`;
        } catch (e) {
             return `(Error decoding PEPx representation. Original length: ${originalLength} bytes)`;
        }
      }
      return `(Conceptually Decoded Original Content - ${originalLength} bytes. No representation found.)`;
    }
    return pepxData; // If not recognized as PEPx, return as is (should not happen if isPEPxEncoded is true)
  }, []);


  useEffect(() => {
    setIsLoading(true);
    const storedVFS = localStorage.getItem(LOCAL_STORAGE_VFS_KEY);
    if (storedVFS) {
      try {
        const parsedVFS = JSON.parse(storedVFS);
        // Basic validation of root structure
        if (parsedVFS && parsedVFS['/'] && parsedVFS['/'].type === 'folder') {
            setFileSystem(parsedVFS);
        } else {
            console.warn("Invalid VFS structure in localStorage, resetting to default.");
            setFileSystem(initialFileSystemStructure);
            localStorage.setItem(LOCAL_STORAGE_VFS_KEY, JSON.stringify(initialFileSystemStructure));
        }
      } catch (e) {
        console.error("Failed to parse VFS from localStorage, resetting.", e);
        setFileSystem(initialFileSystemStructure);
        localStorage.setItem(LOCAL_STORAGE_VFS_KEY, JSON.stringify(initialFileSystemStructure));
      }
    } else {
      setFileSystem(initialFileSystemStructure); // Set initial structure if nothing in localStorage
      localStorage.setItem(LOCAL_STORAGE_VFS_KEY, JSON.stringify(initialFileSystemStructure));
    }
    setIsLoading(false);
  }, []);

  const saveFileSystem = useCallback((newFS: VFSTree) => {
    setFileSystem(newFS); // Update state
    localStorage.setItem(LOCAL_STORAGE_VFS_KEY, JSON.stringify(newFS)); // Persist
  }, []);

  const getItem = useCallback((path: string): VFSItem | undefined => {
    const { item } = _navigateToPathInternal(fileSystem, path);
    // The `item.content` always holds the original content.
    // `item.pepxData` holds the conceptual encoded version.
    // `convertFromPEPx` would be used if you only had `pepxData` and needed to show the original.
    return item;
  }, [fileSystem]);

  const listPath = useCallback((path: string): VFSItem[] => {
    const { item } = _navigateToPathInternal(fileSystem, path);
    if (item && item.type === 'folder' && item.children) {
      return Object.values(item.children);
    }
    return [];
  }, [fileSystem]);

  const createFile = useCallback((folderPath: string, fileName: string, content: string = ''): boolean => {
    const newFS = JSON.parse(JSON.stringify(fileSystem)); 
    const { item: parentFolder } = _navigateToPathInternal(newFS, folderPath);

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
      content, // Store original content
      pepxData: pepxContent, // Store conceptual PEPx data
      isPEPxEncoded: true, // Mark as encoded
      parentId: parentFolder.id,
      path: `${folderPath === '/' ? '' : folderPath}/${fileName}`,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      size: content.length, // Size of original content
    };
    parentFolder.modifiedAt = new Date().toISOString();
    saveFileSystem(newFS);
    toast({ title: "VFS Info", description: `File '${fileName}' created and conceptually encoded to PEPx in ${folderPath}.`});
    return true;
  }, [fileSystem, saveFileSystem, convertToPEPx]);

  const createFolder = useCallback((path: string, folderName: string): boolean => {
    const newFS = JSON.parse(JSON.stringify(fileSystem)); 
    const { item: parentFolder } = _navigateToPathInternal(newFS, path);

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
    const { item, parent, itemName } = _navigateToPathInternal(newFS, path);

    if (!item || !parent || !itemName || !parent.children) {
      toast({ title: "VFS Error", description: `Cannot delete: Item at ${path} not found.`, variant: "destructive" });
      return false;
    }
    
    const protectedPaths = ['/', '/home', '/home/user', '/tmp', '/virtual_fs', '/mnt'];
    if(protectedPaths.includes(path) && path !== '/mnt/external_usb_drive') { // Allow deleting the conceptual USB drive
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
    const { item } = _navigateToPathInternal(newFS, filePath);

    if (!item || item.type !== 'file') {
      toast({ title: "VFS Error", description: `Cannot update content: ${filePath} is not a file or not found.`, variant: "destructive" });
      return false;
    }
    item.content = newContent; // Update original content
    item.pepxData = convertToPEPx(newContent); // Re-encode to PEPx
    item.isPEPxEncoded = true;
    item.size = newContent.length;
    item.modifiedAt = new Date().toISOString();

    const { parent } = _navigateToPathInternal(newFS, item.path);
    if(parent) parent.modifiedAt = new Date().toISOString();

    saveFileSystem(newFS);
    toast({ title: "VFS Info", description: `File '${item.name}' updated and conceptually re-encoded to PEPx.`});
    return true;
  }, [fileSystem, saveFileSystem, convertToPEPx]);

  const renameItem = useCallback((path: string, newName: string): boolean => {
    if (!newName.trim() || newName.includes('/')) {
        toast({ title: "VFS Error", description: "Invalid name. Name cannot be empty or contain slashes.", variant: "destructive" });
        return false;
    }
    const newFS = JSON.parse(JSON.stringify(fileSystem));
    const { item, parent, itemName } = _navigateToPathInternal(newFS, path);

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

    const oldItem = { ...parent.children[itemName] }; // Clone item
    delete parent.children[itemName];
    
    oldItem.name = newName;
    const newPath = `${parent.path === '/' ? '' : parent.path}/${newName}`;
    oldItem.path = newPath;
    oldItem.modifiedAt = new Date().toISOString();
    parent.children[newName] = oldItem;
    parent.modifiedAt = new Date().toISOString();

    // Recursively update paths of children if it's a folder
    function updateChildrenPaths(folderItem: VFSItem, currentParentPath: string) {
        if (folderItem.type === 'folder' && folderItem.children) {
            Object.values(folderItem.children).forEach(child => {
                child.path = `${currentParentPath}/${child.name}`;
                child.parentId = folderItem.id; // Ensure parentId is correct
                if (child.type === 'folder') {
                    updateChildrenPaths(child, child.path);
                }
            });
        }
    }
    if (oldItem.type === 'folder') {
        updateChildrenPaths(oldItem, newPath);
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

// _navigateToPath is kept internal to the context
// No changes needed to _navigateToPath function itself from the previous version.
// It correctly identifies parent and item/itemName.

