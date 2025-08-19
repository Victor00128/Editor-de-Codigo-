import React, { useState, useCallback, useRef, useEffect } from 'react';
import { FileSystemNode, File, Folder } from '../types';
import { 
    FileIcon, FolderIcon, ChevronRightIcon, ChevronDownIcon, 
    TypescriptIcon, JsIcon, CssIcon, HtmlIcon, JsonIcon, ReactIcon
} from './icons';
import { NewItemModal } from './Menus';

interface FileExplorerProps {
    fileSystem: FileSystemNode[];
    onFileClick: (file: File) => void;
    onNewItem: (parentId: string | null, type: 'file' | 'folder', name?: string) => FileSystemNode | null;
    onRename: (nodeId: string, newName: string) => boolean;
    onDelete: (nodeId: string) => boolean;
    onDuplicate: (nodeId: string) => void;
    onMove: (nodeId: string, targetParentId: string | null) => boolean;
}

interface DragState {
    isDragging: boolean;
    draggedNode: FileSystemNode | null;
    dragOverNode: FileSystemNode | null;
}

export default function FileExplorer({ 
    fileSystem, 
    onFileClick, 
    onNewItem, 
    onRename, 
    onDelete, 
    onDuplicate, 
    onMove 
}: FileExplorerProps) {
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
    const [renamingNodeId, setRenamingNodeId] = useState<string | null>(null);
    const [tempName, setTempName] = useState('');
    const [dragState, setDragState] = useState<DragState>({
        isDragging: false,
        draggedNode: null,
        dragOverNode: null
    });
    const [contextMenu, setContextMenu] = useState<{
        x: number;
        y: number;
        node: FileSystemNode;
    } | null>(null);
    const [isRenaming, setIsRenaming] = useState<string | null>(null);
    const [renameValue, setRenameValue] = useState('');
    const [newItemModal, setNewItemModal] = useState<{
        isOpen: boolean;
        type: 'file' | 'folder';
        parentId: string | null;
        parentName?: string;
    } | null>(null);

    const renameInputRef = useRef<HTMLInputElement>(null);

    const toggleFolder = useCallback((folderId: string) => {
        setExpandedFolders(prev => {
            const newSet = new Set(prev);
            if (newSet.has(folderId)) {
                newSet.delete(folderId);
            } else {
                newSet.add(folderId);
            }
            return newSet;
        });
    }, []);

    const startRename = useCallback((node: FileSystemNode) => {
        setRenamingNodeId(node.id);
        setTempName(node.name);
        setTimeout(() => renameInputRef.current?.focus(), 0);
    }, []);

    const confirmRename = useCallback(() => {
        if (renamingNodeId && tempName.trim() && tempName !== '') {
            if (onRename(renamingNodeId, tempName.trim())) {
                setRenamingNodeId(null);
                setTempName('');
            }
        }
    }, [renamingNodeId, tempName, onRename]);

    const cancelRename = useCallback(() => {
        setRenamingNodeId(null);
        setTempName('');
    }, []);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            confirmRename();
        } else if (e.key === 'Escape') {
            cancelRename();
        }
    }, [confirmRename, cancelRename]);

    const handleDragStart = useCallback((e: React.DragEvent, node: FileSystemNode) => {
        setDragState(prev => ({
            ...prev,
            isDragging: true,
            draggedNode: node
        }));
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', node.id);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent, node: FileSystemNode) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        if (dragState.draggedNode && dragState.draggedNode.id !== node.id) {
            setDragState(prev => ({
                ...prev,
                dragOverNode: node
            }));
        }
    }, [dragState.draggedNode]);

    const handleDragLeave = useCallback(() => {
        setDragState(prev => ({
            ...prev,
            dragOverNode: null
        }));
    }, []);

    const handleDrop = useCallback((e: React.DragEvent, targetNode: FileSystemNode) => {
        e.preventDefault();
        
        if (!dragState.draggedNode || dragState.draggedNode.id === targetNode.id) {
            return;
        }

        // Don't allow dropping a folder into itself or its children
        if (targetNode.type === 'folder') {
            const isChild = (parent: FileSystemNode, childId: string): boolean => {
                if (parent.id === childId) return true;
                if (parent.type === 'folder') {
                    return parent.children.some(child => isChild(child, childId));
                }
                return false;
            };

            if (isChild(targetNode, dragState.draggedNode.id)) {
                return;
            }
        }

        const targetParentId = targetNode.type === 'folder' ? targetNode.id : null;
        onMove(dragState.draggedNode.id, targetParentId);
        
        setDragState({
            isDragging: false,
            draggedNode: null,
            dragOverNode: null
        });
    }, [dragState.draggedNode, onMove]);

    const handleContextMenu = useCallback((e: React.MouseEvent, node: FileSystemNode) => {
        e.preventDefault();
        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            node
        });
    }, []);

    const closeContextMenu = useCallback(() => {
        setContextMenu(null);
    }, []);

    const getFileIcon = (file: File) => {
        const commonProps = { className: "w-4 h-4" };
        if (file.name.endsWith('.tsx')) {
            return <ReactIcon {...commonProps} />;
        }
        switch (file.language) {
            case 'typescript':
                return <TypescriptIcon {...commonProps} />;
            case 'javascript':
                return <JsIcon {...commonProps} />;
            case 'css':
                return <CssIcon {...commonProps} />;
            case 'html':
                return <HtmlIcon {...commonProps} />;
            case 'json':
                return <JsonIcon {...commonProps} />;
            default:
                return <FileIcon {...commonProps} />;
        }
    };

    const renderNode = (node: FileSystemNode, level: number = 0): React.ReactNode => {
        const isExpanded = expandedFolders.has(node.id);
        const isDragOver = dragState.dragOverNode?.id === node.id;
        const isBeingDragged = dragState.draggedNode?.id === node.id;

        if (renamingNodeId === node.id) {
            return (
                <div className="flex items-center p-1" style={{ paddingLeft: `${level * 1.5}rem` }}>
                    {node.type === 'folder' && (
                        isExpanded ? <ChevronDownIcon className="w-4 h-4 mr-1 flex-shrink-0" /> : <ChevronRightIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                    )}
                    {node.type === 'file' && <FileIcon className="w-4 h-4 mr-2 flex-shrink-0" />}
                    <input
                        ref={renameInputRef}
                        type="text"
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        onBlur={confirmRename}
                        onKeyDown={handleKeyDown}
                        className="flex-grow bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text border border-dark-accent rounded px-1 text-sm"
                    />
                </div>
            );
        }

        const nodeClasses = [
            "w-full flex items-center p-1 text-left cursor-pointer rounded transition-colors",
            "hover:bg-dark-accent/20 dark:hover:bg-dark-accent/30",
            isDragOver && "bg-dark-accent/40 dark:bg-dark-accent/50",
            isBeingDragged && "opacity-50",
            level > 0 && "ml-2"
        ].filter(Boolean).join(" ");

        if (node.type === 'folder') {
            return (
                <div
                    draggable
                    onDragStart={(e) => handleDragStart(e, node)}
                    onDragOver={(e) => handleDragOver(e, node)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, node)}
                    onContextMenu={(e) => handleContextMenu(e, node)}
                >
                    <button
                        className={nodeClasses}
                        style={{ paddingLeft: `${level * 1.5}rem` }}
                        onClick={() => toggleFolder(node.id)}
                        aria-expanded={isExpanded}
                    >
                        {isExpanded ? <ChevronDownIcon className="w-4 h-4 mr-1 flex-shrink-0" /> : <ChevronRightIcon className="w-4 h-4 mr-1 flex-shrink-0" />}
                        <FolderIcon className="w-4 h-4 mr-2 flex-shrink-0 text-blue-500" />
                        <span className="font-bold">{node.name}</span>
                    </button>
                    
                    {isExpanded && (
                        <div className="ml-2">
                            {node.children.map(child => renderNode(child, level + 1))}
                        </div>
                    )}
                </div>
            );
        }

        return (
            <div
                draggable
                onDragStart={(e) => handleDragStart(e, node)}
                onDragOver={(e) => handleDragOver(e, node)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, node)}
                onContextMenu={(e) => handleContextMenu(e, node)}
            >
                <button
                    className={nodeClasses}
                    style={{ paddingLeft: `${level * 1.5}rem` }}
                    onClick={() => onFileClick(node)}
                >
                    {getFileIcon(node)}
                    <span className="flex-grow truncate">{node.name}</span>
                    {node.isDirty && (
                        <div className="w-2 h-2 rounded-full bg-dark-text-alt dark:bg-gray-400 ml-2" />
                    )}
                </button>
            </div>
        );
    };

    const handleNewItemClick = useCallback((type: 'file' | 'folder', parentId: string | null = null, parentName?: string) => {
        setNewItemModal({
            isOpen: true,
            type,
            parentId,
            parentName
        });
    }, []);

    const handleNewItemConfirm = useCallback((name: string, type: 'file' | 'folder') => {
        if (newItemModal) {
            const result = onNewItem(newItemModal.parentId, type, name);
            if (result && result.type === 'file') {
                // Si es un archivo, abrirlo automáticamente
                onFileClick(result);
            }
        }
        setNewItemModal(null);
    }, [newItemModal, onNewItem, onFileClick]);

    const handleContextMenuAction = useCallback((action: string, node: FileSystemNode) => {
        closeContextMenu();
        
        switch (action) {
            case 'newFile':
                if (node.type === 'folder') {
                    handleNewItemClick('file', node.id, node.name);
                } else {
                    // Si es un archivo, crear en el mismo nivel
                    const parentNode = findParentNode(fileSystem, node.id);
                    handleNewItemClick('file', parentNode?.id || null, parentNode?.name);
                }
                break;
            case 'newFolder':
                if (node.type === 'folder') {
                    handleNewItemClick('folder', node.id, node.name);
                } else {
                    // Si es un archivo, crear en el mismo nivel
                    const parentNode = findParentNode(fileSystem, node.id);
                    handleNewItemClick('folder', parentNode?.id || null, parentNode?.name);
                }
                break;
            case 'rename':
                startRename(node);
                break;
            case 'duplicate':
                onDuplicate(node.id);
                break;
            case 'delete':
                onDelete(node.id);
                break;
        }
    }, [closeContextMenu, handleNewItemClick, startRename, onDuplicate, onDelete, fileSystem]);

    // Función auxiliar para encontrar el nodo padre
    const findParentNode = (nodes: FileSystemNode[], targetId: string): FileSystemNode | null => {
        for (const node of nodes) {
            if (node.type === 'folder' && node.children.some(child => child.id === targetId)) {
                return node;
            }
            if (node.type === 'folder') {
                const found = findParentNode(node.children, targetId);
                if (found) return found;
            }
        }
        return null;
    };

    // Cerrar el menú contextual cuando se hace clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (contextMenu) {
                closeContextMenu();
            }
        };

        if (contextMenu) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [contextMenu, closeContextMenu]);

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-dark-accent/20">
                <h2 className="text-sm font-semibold text-dark-text dark:text-dark-text">Explorer</h2>
                <div className="flex items-center space-x-1">
                    <button
                        onClick={() => handleNewItemClick('file')}
                        className="p-1 hover:bg-dark-accent/20 rounded text-dark-text-alt hover:text-dark-text transition-colors"
                        title="New File"
                    >
                        <FileIcon className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleNewItemClick('folder')}
                        className="p-1 hover:bg-dark-accent/20 rounded text-dark-text-alt hover:text-dark-text transition-colors"
                        title="New Folder"
                    >
                        <FolderIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* File Tree */}
            <div className="flex-1 overflow-y-auto p-2">
                {fileSystem.map(node => renderNode(node))}
            </div>

            {/* Context Menu */}
            {contextMenu && (
                <div
                    className="fixed z-50 bg-light-bg dark:bg-dark-bg border border-dark-accent/30 rounded-md shadow-lg py-1 min-w-48"
                    style={{ left: contextMenu.x, top: contextMenu.y }}
                >
                    <button
                        onClick={() => handleContextMenuAction('newFile', contextMenu.node)}
                        className="w-full px-4 py-2 text-left text-dark-text dark:text-dark-text hover:bg-dark-accent/20 text-sm"
                    >
                        New File
                    </button>
                    <button
                        onClick={() => handleContextMenuAction('newFolder', contextMenu.node)}
                        className="w-full px-4 py-2 text-left text-dark-text dark:text-dark-text hover:bg-dark-accent/20 text-sm"
                    >
                        New Folder
                    </button>
                    <div className="border-t border-dark-accent/20 my-1" />
                    <button
                        onClick={() => handleContextMenuAction('rename', contextMenu.node)}
                        className="w-full px-4 py-2 text-left text-dark-text dark:text-dark-text hover:bg-dark-accent/20 text-sm"
                    >
                        Rename
                    </button>
                    <button
                        onClick={() => handleContextMenuAction('duplicate', contextMenu.node)}
                        className="w-full px-4 py-2 text-left text-dark-text dark:text-dark-text hover:bg-dark-accent/20 text-sm"
                    >
                        Duplicate
                    </button>
                    <div className="border-t border-dark-accent/20 my-1" />
                    <button
                        onClick={() => handleContextMenuAction('delete', contextMenu.node)}
                        className="w-full px-4 py-2 text-left text-red-500 hover:bg-red-500/20 text-sm"
                    >
                        Delete
                    </button>
                </div>
            )}

            {/* Click outside to close context menu */}
            {contextMenu && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={closeContextMenu}
                />
            )}

            {/* New Item Modal */}
            {newItemModal && (
                <NewItemModal
                    isOpen={newItemModal.isOpen}
                    onClose={() => setNewItemModal(null)}
                    onConfirm={handleNewItemConfirm}
                    type={newItemModal.type}
                    parentName={newItemModal.parentName}
                />
            )}
        </div>
    );
};



