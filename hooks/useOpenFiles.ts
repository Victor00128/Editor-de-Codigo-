import { useState, useCallback, useEffect } from 'react';
import { File } from '../types';

export const useOpenFiles = () => {
    const [openFiles, setOpenFiles] = useState<File[]>(() => {
        const saved = localStorage.getItem('nexus-code-open-files');
        return saved ? JSON.parse(saved) : [];
    });
    const [activeFileId, setActiveFileId] = useState<string | null>(() => {
        const saved = localStorage.getItem('nexus-code-active-file');
        return saved || null;
    });

    // Persist open files to localStorage
    useEffect(() => {
        localStorage.setItem('nexus-code-open-files', JSON.stringify(openFiles));
    }, [openFiles]);

    // Persist active file to localStorage
    useEffect(() => {
        if (activeFileId) {
            localStorage.setItem('nexus-code-active-file', activeFileId);
        } else {
            localStorage.removeItem('nexus-code-active-file');
        }
    }, [activeFileId]);

    const openFile = useCallback((file: File) => {
        if (!openFiles.some(f => f.id === file.id)) {
            setOpenFiles(prev => [...prev, file]);
        }
        setActiveFileId(file.id);
    }, [openFiles]);

    const closeFile = useCallback((fileId: string) => {
        const fileIndex = openFiles.findIndex(f => f.id === fileId);
        if (fileIndex === -1) return;

        let newActiveFileId: string | null = activeFileId;
        if (activeFileId === fileId) {
            if (openFiles.length > 1) {
                newActiveFileId = fileIndex > 0 ? openFiles[fileIndex - 1].id : openFiles[1].id;
            } else {
                newActiveFileId = null;
            }
        }

        setOpenFiles(prev => prev.filter(f => f.id !== fileId));
        setActiveFileId(newActiveFileId);
    }, [activeFileId, openFiles]);

    const updateFile = useCallback((fileId: string, updates: Partial<File>) => {
        setOpenFiles(prev => prev.map(f => 
            f.id === fileId ? { ...f, ...updates } : f
        ));
        
        if (activeFileId === fileId) {
            setActiveFileId(fileId);
        }
    }, [activeFileId]);

    const closeAllFiles = useCallback(() => {
        setOpenFiles([]);
        setActiveFileId(null);
    }, []);

    const closeOtherFiles = useCallback((fileId: string) => {
        setOpenFiles(prev => prev.filter(f => f.id === fileId));
        setActiveFileId(fileId);
    }, []);

    const closeFilesToTheRight = useCallback((fileId: string) => {
        const fileIndex = openFiles.findIndex(f => f.id === fileId);
        if (fileIndex === -1) return;

        setOpenFiles(prev => prev.slice(0, fileIndex + 1));
        
        if (activeFileId && !openFiles.slice(0, fileIndex + 1).some(f => f.id === activeFileId)) {
            setActiveFileId(fileId);
        }
    }, [openFiles, activeFileId]);

    const getActiveFile = useCallback(() => {
        return openFiles.find(f => f.id === activeFileId) || null;
    }, [openFiles, activeFileId]);

    const isFileOpen = useCallback((fileId: string) => {
        return openFiles.some(f => f.id === fileId);
    }, [openFiles]);

    return {
        openFiles,
        activeFileId,
        openFile,
        closeFile,
        updateFile,
        closeAllFiles,
        closeOtherFiles,
        closeFilesToTheRight,
        getActiveFile,
        isFileOpen,
        setActiveFileId,
    };
};



