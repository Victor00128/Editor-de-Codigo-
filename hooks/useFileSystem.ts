import { useState, useCallback, useEffect } from 'react';
import { FileSystemNode, File, Folder } from '../types';
import { initialFileSystem } from '../data';

// Helper functions
const findNodeRecursive = (nodes: FileSystemNode[], id: string): FileSystemNode | null => {
    for (const node of nodes) {
        if (node.id === id) return node;
        if (node.type === 'folder') {
            const found = findNodeRecursive(node.children, id);
            if (found) return found;
        }
    }
    return null;
};

const findFileByIdRecursive = (nodes: FileSystemNode[], id: string): File | null => {
    const node = findNodeRecursive(nodes, id);
    return node?.type === 'file' ? node : null;
};

const updateNodeInTree = (nodes: FileSystemNode[], nodeId: string, updateFn: (node: FileSystemNode) => FileSystemNode): FileSystemNode[] => {
    return nodes.map(node => {
        if (node.id === nodeId) {
            return updateFn(node);
        }
        if (node.type === 'folder') {
            return { ...node, children: updateNodeInTree(node.children, nodeId, updateFn) };
        }
        return node;
    });
};

const addNodeToFolder = (nodes: FileSystemNode[], parentId: string, newNode: FileSystemNode): FileSystemNode[] => {
    return nodes.map(node => {
        if (node.id === parentId && node.type === 'folder') {
            return { ...node, children: [...node.children, newNode] };
        }
        if (node.type === 'folder') {
            return { ...node, children: addNodeToFolder(node.children, parentId, newNode) };
        }
        return node;
    });
};

const validateFileName = (name: string): boolean => {
    if (!name.trim()) return false;
    if (name.includes('/') || name.includes('\\')) return false;
    if (name === '.' || name === '..') return false;
    return true;
};

export const useFileSystem = () => {
    const [fileSystem, setFileSystem] = useState<FileSystemNode[]>(() => {
        const saved = localStorage.getItem('nexus-code-filesystem');
        return saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(initialFileSystem));
    });
    
    const [savedFileSystem, setSavedFileSystem] = useState<FileSystemNode[]>(() => {
        const saved = localStorage.getItem('nexus-code-filesystem-saved');
        return saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(initialFileSystem));
    });

    // Persist to localStorage whenever fileSystem changes
    useEffect(() => {
        localStorage.setItem('nexus-code-filesystem', JSON.stringify(fileSystem));
    }, [fileSystem]);

    // Persist saved state
    useEffect(() => {
        localStorage.setItem('nexus-code-filesystem-saved', JSON.stringify(savedFileSystem));
    }, [savedFileSystem]);

    const handleCodeChange = useCallback((fileId: string, newContent: string) => {
        const updater = (node: FileSystemNode): FileSystemNode => {
            if (node.id === fileId && node.type === 'file') {
                return { 
                    ...node, 
                    content: newContent, 
                    gitStatus: node.gitStatus === 'A' ? 'A' : 'M',
                    isDirty: true 
                };
            }
            return node;
        };
        
        setFileSystem(prev => updateNodeInTree(prev, fileId, updater));
    }, []);

    const handleSaveFile = useCallback((fileId: string) => {
        const fileToSave = findFileByIdRecursive(fileSystem, fileId);
        if (!fileToSave || !fileToSave.isDirty) return false;

        const savedStateUpdater = (node: FileSystemNode): FileSystemNode => {
            if (node.id === fileId && node.type === 'file') {
                return { ...node, content: fileToSave.content };
            }
            return node;
        };
        
        setSavedFileSystem(prev => updateNodeInTree(prev, fileId, savedStateUpdater));

        const workingStateUpdater = (node: FileSystemNode): FileSystemNode => {
            if (node.id === fileId && node.type === 'file') {
                return { ...node, isDirty: false };
            }
            return node;
        };
        
        setFileSystem(prev => updateNodeInTree(prev, fileId, workingStateUpdater));
        return true;
    }, [fileSystem]);

    const handleNewItem = useCallback((parentId: string | null, type: 'file' | 'folder', name?: string) => {
        // Si no se proporciona un nombre, retornamos null para que el componente padre
        // abra el modal personalizado
        if (!name) {
            return null;
        }

        if (!validateFileName(name)) {
            return null;
        }

        const newNode: FileSystemNode = type === 'file'
            ? {
                id: String(Date.now()),
                type: 'file',
                name: name,
                language: name.split('.').pop() as any || 'typescript',
                content: '',
                gitStatus: 'A',
                isDirty: true,
            }
            : {
                id: String(Date.now()),
                type: 'folder',
                name: name,
                children: [],
            };

        if (parentId) {
            setFileSystem(prev => addNodeToFolder(prev, parentId, newNode));
        } else {
            setFileSystem(prev => [newNode, ...prev]);
        }

        return newNode;
    }, []);

    const handleRenameNode = useCallback((nodeId: string, newName: string) => {
        if (!validateFileName(newName)) {
            alert('Invalid name. Names cannot be empty, contain slashes, or be "." or ".."');
            return false;
        }

        const updater = (node: FileSystemNode): FileSystemNode => {
            const isFile = node.type === 'file';
            const newGitStatus = isFile ? ((node as File).gitStatus === 'A' ? 'A' : 'M') : undefined;
            
            return { 
                ...node, 
                name: newName, 
                ...(isFile && { gitStatus: newGitStatus, isDirty: true })
            };
        };

        setFileSystem(prev => updateNodeInTree(prev, nodeId, updater));
        return true;
    }, []);

    const handleDeleteNode = useCallback((nodeId: string) => {
        if (!window.confirm("Are you sure you want to delete this? This action cannot be undone.")) return false;

        let deletedFileIds: string[] = [];
        const deleteRecursive = (nodes: FileSystemNode[], idToDelete: string): FileSystemNode[] => {
            return nodes.filter(node => {
                if (node.id === idToDelete) {
                    if (node.type === 'file') {
                        deletedFileIds.push(node.id);
                    } else { 
                        const collectIds = (n: Folder) => {
                           n.children.forEach(child => {
                               if (child.type === 'file') deletedFileIds.push(child.id);
                               else collectIds(child);
                           });
                        };
                        collectIds(node as Folder);
                    }
                    return false;
                }
                if (node.type === 'folder') {
                    node.children = deleteRecursive(node.children, idToDelete);
                }
                return true;
            });
        };

        setFileSystem(prev => deleteRecursive(JSON.parse(JSON.stringify(prev)), nodeId));
        return deletedFileIds;
    }, []);

    const duplicateNode = useCallback((nodeId: string) => {
        const node = findNodeRecursive(fileSystem, nodeId);
        if (!node) return null;

        const newNode: FileSystemNode = node.type === 'file'
            ? {
                ...node,
                id: String(Date.now()),
                name: `${node.name} (copy)`,
                gitStatus: 'A',
                isDirty: true,
            } as File
            : {
                ...node,
                id: String(Date.now()),
                name: `${node.name} (copy)`,
                children: [...(node as Folder).children],
            } as Folder;

        // Find parent folder
        const findParent = (nodes: FileSystemNode[], targetId: string): string | null => {
            for (const n of nodes) {
                if (n.type === 'folder' && n.children.some(child => child.id === targetId)) {
                    return n.id;
                }
                if (n.type === 'folder') {
                    const found = findParent(n.children, targetId);
                    if (found) return found;
                }
            }
            return null;
        };

        const parentId = findParent(fileSystem, nodeId);
        if (parentId) {
            setFileSystem(prev => addNodeToFolder(prev, parentId, newNode));
        } else {
            setFileSystem(prev => [newNode, ...prev]);
        }

        return newNode;
    }, [fileSystem]);

    const moveNode = useCallback((nodeId: string, targetParentId: string | null) => {
        const node = findNodeRecursive(fileSystem, nodeId);
        if (!node) return false;

        // Remove from current location
        const removeFromCurrent = (nodes: FileSystemNode[], idToRemove: string): FileSystemNode[] => {
            return nodes.filter(n => n.id !== idToRemove).map(n => {
                if (n.type === 'folder') {
                    return { ...n, children: removeFromCurrent(n.children, idToRemove) };
                }
                return n;
            });
        };

        // Add to new location
        if (targetParentId) {
            setFileSystem(prev => {
                const withoutNode = removeFromCurrent(prev, nodeId);
                return addNodeToFolder(withoutNode, targetParentId, node);
            });
        } else {
            setFileSystem(prev => {
                const withoutNode = removeFromCurrent(prev, nodeId);
                return [node, ...withoutNode];
            });
        }

        return true;
    }, [fileSystem]);

    const searchFiles = useCallback((term: string, searchInContent: boolean = false): File[] => {
        if (!term) return [];
        let results: File[] = [];
        const lowerCaseTerm = term.toLowerCase();
    
        const searchRecursive = (nodes: FileSystemNode[]) => {
            for (const node of nodes) {
                if (node.type === 'file') {
                    const nameMatch = node.name.toLowerCase().includes(lowerCaseTerm);
                    const contentMatch = searchInContent && node.content.toLowerCase().includes(lowerCaseTerm);
                    
                    if (nameMatch || contentMatch) {
                        results.push(node);
                    }
                }
                if (node.type === 'folder') {
                    searchRecursive(node.children);
                }
            }
        };
        
        searchRecursive(fileSystem);
        return results;
    }, [fileSystem]);

    const getGitStatus = useCallback((): File[] => {
        let results: File[] = [];
        const traverse = (nodeList: FileSystemNode[]) => {
            for (const node of nodeList) {
                if (node.type === 'file' && node.gitStatus) {
                    results.push(node);
                } else if (node.type === 'folder') {
                    traverse(node.children);
                }
            }
        }
        traverse(fileSystem);
        return results;
    }, [fileSystem]);

    const resetToSaved = useCallback(() => {
        setFileSystem(JSON.parse(JSON.stringify(savedFileSystem)));
    }, [savedFileSystem]);

    return {
        fileSystem,
        savedFileSystem,
        handleCodeChange,
        handleSaveFile,
        handleNewItem,
        handleRenameNode,
        handleDeleteNode,
        duplicateNode,
        moveNode,
        searchFiles,
        getGitStatus,
        resetToSaved,
        findFileByIdRecursive,
        findNodeRecursive,
    };
};



