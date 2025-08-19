
import React, { useState, useEffect, useCallback, createContext, useContext, useMemo, useRef } from 'react';
import { ActivityBarView, Extension, Theme, ThemeContextType, ContextMenuData, Command } from './types';
import { mockExtensions } from './data';
import CodeEditor from './components/CodeEditor';
import DiffViewer from './components/DiffViewer';
import FileExplorer from './components/FileExplorer';
import SearchView from './components/SearchView';
import GitView from './components/GitView';
import DebugView from './components/DebugView';
import ExtensionsView from './components/ExtensionsView';
import { ContextMenu, AboutModal, CommandPalette } from './components/Menus';
import { 
    FileExplorerIcon, SearchIcon, GitIcon, DebugIcon, ExtensionsIcon, TerminalIcon, CloseIcon, 
    SunIcon, MoonIcon
} from './components/icons';
import { useFileSystem } from './hooks/useFileSystem';
import { useTerminal } from './hooks/useTerminal';
import { useOpenFiles } from './hooks/useOpenFiles';

// --- THEME MANAGEMENT ---
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<Theme>('dark');

    useEffect(() => {
        const root = window.document.documentElement;
        const isDark = theme === 'dark';
        root.classList.toggle('dark', isDark);
        root.style.backgroundColor = isDark ? '#1e1e1e' : '#f5f5f5';
    }, [theme]);

    const toggleTheme = useCallback(() => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    }, []);

    const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

// --- HELPER COMPONENTS ---

const ActivityBarIcon: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = React.memo(({ icon, label, isActive, onClick }) => {
    const className = React.useMemo(() => (
        `w-full p-3 flex items-center justify-center transition-colors duration-200 ${
            isActive
            ? 'text-white dark:text-white bg-dark-accent/30 dark:bg-dark-accent/30'
            : 'text-dark-text-alt hover:bg-dark-bg-alt/50 dark:text-dark-text-alt dark:hover:bg-dark-bg-alt'
        }`
    ), [isActive]);
    return (
        <button
            onClick={onClick}
            title={label}
            aria-label={label}
            className={className}
        >
            {icon}
        </button>
    );
});

// --- TERMINAL COMPONENT ---
interface IntegratedTerminalProps {
    history: any[];
    onCommand: (command: string) => void;
    onNavigateHistory: (dir: 'up' | 'down') => string | null;
    isTerminalOpen: boolean;
}

const IntegratedTerminal: React.FC<IntegratedTerminalProps> = ({ history, onCommand, onNavigateHistory, isTerminalOpen }) => {
    const [inputValue, setInputValue] = useState('');
    const endOfHistoryRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            onCommand(inputValue);
            setInputValue('');
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prev = onNavigateHistory('up');
            if (prev !== null && prev !== undefined) setInputValue(prev);
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            const next = onNavigateHistory('down');
            if (next !== null && next !== undefined) setInputValue(next);
        }
    };

    useEffect(() => {
        endOfHistoryRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);

    useEffect(() => {
        if (isTerminalOpen) {
            inputRef.current?.focus();
        }
    }, [isTerminalOpen]);

    return (
        <div className="bg-light-bg dark:bg-dark-bg h-full w-full p-2 font-mono text-sm flex flex-col" onClick={() => inputRef.current?.focus()}>
            <div className="flex-grow overflow-y-auto">
                {history.map(line => (
                    <div key={line.id}>
                        {line.type === 'input' && (
                            <div className="flex items-center">
                                <span className="text-green-400 mr-2 flex-shrink-0">nexus-code &gt;</span>
                                <span className="flex-1 text-dark-text dark:text-dark-text">{line.content}</span>
                            </div>
                        )}
                        {line.type === 'output' && (
                            <div className="text-dark-text-alt dark:text-dark-text whitespace-pre-wrap">{line.content}</div>
                        )}
                    </div>
                ))}
                <div ref={endOfHistoryRef} />
            </div>
            <div className="flex items-center mt-1">
                <span className="text-green-400 mr-2 flex-shrink-0">nexus-code &gt;</span>
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-transparent border-none outline-none text-dark-text dark:text-dark-text p-0"
                    aria-label="Terminal input"
                />
            </div>
        </div>
    );
};

// --- MAIN APP COMPONENT ---
const App: React.FC = () => {
    const { theme, toggleTheme } = useTheme();
    const [activeView, setActiveView] = useState<ActivityBarView>(ActivityBarView.EXPLORER);
    const [isTerminalOpen, setTerminalOpen] = useState(false);
    const [isSidebarVisible, setSidebarVisible] = useState(true);
    const [isAboutModalOpen, setAboutModalOpen] = useState(false);
    const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);
    const [diffFile, setDiffFile] = useState<any>(null);
    const [contextMenu, setContextMenu] = useState<ContextMenuData | null>(null);
    const [hoveredTabId, setHoveredTabId] = useState<string | null>(null);

    // Custom hooks
    const {
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
    } = useFileSystem();

    const {
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
    } = useOpenFiles();

    const {
        history: terminalHistory,
        currentDirectory,
        executeCommand,
        navigateHistory,
        addToHistory
    } = useTerminal(fileSystem, openFile, { newItem: handleNewItem, deleteNode: handleDeleteNode });

    // --- Global Event Listeners ---
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                if (activeFileId) {
                    handleSaveFile(activeFileId);
                }
            }
             if (e.key === 'Escape') {
                if (contextMenu) setContextMenu(null);
                if (isCommandPaletteOpen) setCommandPaletteOpen(false);
            }
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
                e.preventDefault();
                setCommandPaletteOpen(v => !v);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeFileId, handleSaveFile, contextMenu, isCommandPaletteOpen]);

    const handleOpenFile = useCallback((file: any) => {
        setDiffFile(null);
        openFile(file);
    }, [openFile]);

    const handleCloseFile = useCallback((e: React.MouseEvent, fileIdToClose: string) => {
        e.stopPropagation();
        if (diffFile?.id === fileIdToClose) {
            setDiffFile(null);
        }
        closeFile(fileIdToClose);
    }, [diffFile, closeFile]);

    const handleCodeChangeLocal = useCallback((fileId: string, newContent: string) => {
        handleCodeChange(fileId, newContent);
        updateFile(fileId, { content: newContent, isDirty: true });
    }, [handleCodeChange, updateFile]);

    const handleSaveFileLocal = useCallback(() => {
        if (!activeFileId) return;
        const success = handleSaveFile(activeFileId);
        if (success) {
            updateFile(activeFileId, { isDirty: false });
            addToHistory('output', `File saved successfully`);
        }
    }, [activeFileId, handleSaveFile, updateFile, addToHistory]);

    const handleNewItemLocal = useCallback((parentId: string | null, type: 'file' | 'folder', name?: string) => {
        const newNode = handleNewItem(parentId, type, name);
        if (newNode && newNode.type === 'file') {
            handleOpenFile(newNode);
        }
    }, [handleNewItem, handleOpenFile]);

    const handleRenameNodeLocal = useCallback((nodeId: string, newName: string) => {
        const success = handleRenameNode(nodeId, newName);
        if (success) {
            // Update open files if the renamed file is open
            const openFile = openFiles.find(f => f.id === nodeId);
            if (openFile) {
                updateFile(nodeId, { name: newName });
            }
        }
        return success;
    }, [handleRenameNode, openFiles, updateFile]);

    const handleDeleteNodeLocal = useCallback((nodeId: string) => {
        const deletedFileIds = handleDeleteNode(nodeId);
        if (deletedFileIds) {
            // Close any deleted files that are open
            deletedFileIds.forEach(fileId => {
                if (isFileOpen(fileId)) {
                    closeFile(fileId);
                }
            });
        }
        return deletedFileIds;
    }, [handleDeleteNode, isFileOpen, closeFile]);

    const handleDuplicateNode = useCallback((nodeId: string) => {
        const duplicatedNode = duplicateNode(nodeId);
        if (duplicatedNode && duplicatedNode.type === 'file') {
            handleOpenFile(duplicatedNode);
        }
    }, [duplicateNode, handleOpenFile]);

    const handleMoveNode = useCallback((nodeId: string, targetParentId: string | null) => {
        return moveNode(nodeId, targetParentId);
    }, [moveNode]);

    const handleShowDiff = useCallback((file: any) => {
        setActiveFileId(null);
        setDiffFile(file);
    }, [setActiveFileId]);

    const originalFileForDiff = useMemo(() => {
        if (!diffFile || diffFile.gitStatus === 'A' || diffFile.gitStatus === 'U') return null;
        return findFileByIdRecursive(savedFileSystem, diffFile.id);
    }, [diffFile, savedFileSystem]);

    const changedFiles = useMemo(() => getGitStatus(), [getGitStatus]);

    const commands: Command[] = useMemo(() => [
        { id: 'toggleTheme', label: 'Theme: Toggle Light/Dark Mode', action: toggleTheme, keywords: 'color theme mode dark light change' },
        { id: 'toggleSidebar', label: 'View: Toggle Sidebar', action: () => setSidebarVisible(v => !v), keywords: 'explorer files hide show panel' },
        { id: 'toggleTerminal', label: 'View: Toggle Terminal', action: () => setTerminalOpen(v => !v), keywords: 'console command line cmd' },
        { id: 'newFile', label: 'File: New File (Root)', action: () => handleNewItemLocal(null, 'file'), keywords: 'create add' },
        { id: 'saveFile', label: 'File: Save Active File', action: handleSaveFileLocal, keywords: 'persist write disk' },
        { id: 'showAbout', label: 'Help: About Nexus Code', action: () => setAboutModalOpen(true), keywords: 'version info help' },
    ], [toggleTheme, handleNewItemLocal, handleSaveFileLocal]);

    const activeFile = getActiveFile();

    return (
        <div 
            className="flex flex-col h-screen w-screen bg-light-bg text-light-text dark:bg-dark-bg dark:text-dark-text text-sm overflow-hidden"
            onClick={() => setContextMenu(null)}
        >
            <div className="flex flex-1 overflow-hidden">
                {/* Activity Bar */}
                <div className="w-12 bg-light-bg-alt dark:bg-dark-bg flex flex-col justify-between items-center py-4">
                    <div className="flex flex-col items-center space-y-2">
                        <ActivityBarIcon icon={<FileExplorerIcon />} label="Explorer" isActive={activeView === ActivityBarView.EXPLORER} onClick={() => setActiveView(ActivityBarView.EXPLORER)} />
                        <ActivityBarIcon icon={<SearchIcon />} label="Search" isActive={activeView === ActivityBarView.SEARCH} onClick={() => setActiveView(ActivityBarView.SEARCH)} />
                        <ActivityBarIcon icon={<GitIcon />} label="Source Control" isActive={activeView === ActivityBarView.GIT} onClick={() => setActiveView(ActivityBarView.GIT)} />
                        <ActivityBarIcon icon={<DebugIcon />} label="Run and Debug" isActive={activeView === ActivityBarView.DEBUG} onClick={() => setActiveView(ActivityBarView.DEBUG)} />
                        <ActivityBarIcon icon={<ExtensionsIcon />} label="Extensions" isActive={activeView === ActivityBarView.EXTENSIONS} onClick={() => setActiveView(ActivityBarView.EXTENSIONS)} />
                    </div>
                    <div className="flex flex-col items-center space-y-2">
                        <ActivityBarIcon icon={theme === 'dark' ? <SunIcon /> : <MoonIcon />} label="Toggle Theme" isActive={false} onClick={toggleTheme} />
                    </div>
                </div>

                {/* Sidebar */}
                {isSidebarVisible && (
                    <div className="w-64 bg-light-sidebar dark:bg-dark-sidebar overflow-hidden flex flex-col">
                        {activeView === ActivityBarView.EXPLORER && (
                            <FileExplorer
                                fileSystem={fileSystem}
                                onFileClick={handleOpenFile}
                                onNewItem={handleNewItemLocal}
                                onRename={handleRenameNodeLocal}
                                onDelete={handleDeleteNodeLocal}
                                onDuplicate={handleDuplicateNode}
                                onMove={handleMoveNode}
                            />
                        )}
                        {activeView === ActivityBarView.SEARCH && (
                            <SearchView
                                fileSystem={fileSystem}
                                theme={theme}
                                onFileOpen={handleOpenFile}
                                onReplaceContent={(fileId, newContent) => handleCodeChangeLocal(fileId, newContent)}
                            />
                        )}
                        {activeView === ActivityBarView.GIT && (
                            <GitView
                                fileSystem={fileSystem}
                                savedFileSystem={savedFileSystem}
                                theme={theme}
                                onFileOpen={handleOpenFile}
                                onResetToSaved={resetToSaved}
                            />
                        )}
                        {activeView === ActivityBarView.DEBUG && (
                            <DebugView theme={theme} />
                        )}
                        {activeView === ActivityBarView.EXTENSIONS && (
                            <ExtensionsView
                                extensions={mockExtensions}
                                theme={theme}
                            />
                        )}
                    </div>
                )}

                {/* Main Content */}
                <main className="flex-1 flex flex-col" aria-label="Main content">
                    <div className="flex-1 flex flex-col bg-light-bg-alt dark:bg-dark-bg-alt overflow-hidden">
                        <div role="tablist" aria-label="Open files" className="flex-shrink-0 flex items-center bg-light-sidebar dark:bg-dark-sidebar">
                             {openFiles.map(file => (
                                <div
                                    key={file.id}
                                    role="tab"
                                    aria-selected={activeFileId === file.id && !diffFile}
                                    aria-controls={`editor-panel-${file.id}`}
                                    onClick={() => handleOpenFile(file)}
                                    onMouseEnter={() => setHoveredTabId(file.id)}
                                    onMouseLeave={() => setHoveredTabId(null)}
                                    className={`flex items-center px-4 py-2 cursor-pointer border-r border-r-dark-bg dark:border-r-dark-bg ${
                                        activeFileId === file.id && !diffFile
                                            ? 'bg-light-bg-alt dark:bg-dark-bg-alt'
                                            : 'hover:bg-light-bg-alt/50 dark:hover:bg-dark-bg-alt/50 text-dark-text-alt'
                                    }`}
                                >
                                    <span className="pr-4">{file.name}</span>
                                    {(file.isDirty && hoveredTabId !== file.id) ? (
                                        <div className="w-2 h-2 rounded-full bg-dark-text-alt dark:bg-gray-400" />
                                    ) : (
                                        <button onClick={(e) => handleCloseFile(e, file.id)} aria-label={`Close ${file.name}`} className="p-0.5 rounded-full hover:bg-dark-accent/20">
                                            <CloseIcon className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="flex-1 relative">
                        {diffFile ? (
                            <DiffViewer
                                    key={diffFile.id}
                                    oldContent={diffFile.gitStatus === 'A' ? '' : originalFileForDiff?.content ?? ''}
                                    newContent={diffFile.content}
                                    fileName={diffFile.name}
                                    theme={theme}
                            />
                        ) : activeFile ? (
                                <CodeEditor key={activeFile.id} file={activeFile} onCodeChange={handleCodeChangeLocal} theme={theme} />
                            ) : (
                                <div className="flex items-center justify-center h-full text-dark-text-alt dark:text-dark-text-alt">
                                    <p>Select a file to begin editing.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Terminal */}
                    {isTerminalOpen && (
                        <div className={`flex-shrink-0 h-64 bg-light-bg dark:bg-dark-bg transition-all duration-300`}>
                             <IntegratedTerminal history={terminalHistory} onCommand={executeCommand} onNavigateHistory={navigateHistory} isTerminalOpen={isTerminalOpen} />
                        </div>
                    )}

                    {/* Status Bar */}
                    <footer className="flex-shrink-0 h-6 bg-dark-accent flex items-center justify-between px-4 text-xs text-white">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                                <GitIcon className="w-4 h-4" />
                                <span>main</span>
                                {changedFiles.length > 0 && <span className="ml-2">({changedFiles.length} changes)</span>}
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span>Ln {activeFile ? activeFile.content.split('\n').length : 0}, Col 0</span>
                            <button onClick={() => setTerminalOpen(!isTerminalOpen)} aria-pressed={isTerminalOpen} className="flex items-center space-x-1 hover:bg-white/10 px-2 rounded">
                                <TerminalIcon className="w-4 h-4" />
                                <span className="sr-only">Toggle Terminal</span>
                            </button>
                        </div>
                    </footer>
                </main>
            </div>
            {contextMenu && <ContextMenu x={contextMenu.x} y={contextMenu.y} items={[]} onClose={() => setContextMenu(null)} />}
            <CommandPalette 
                isOpen={isCommandPaletteOpen}
                onClose={() => setCommandPaletteOpen(false)}
                commands={commands}
            />
            <AboutModal isOpen={isAboutModalOpen} onClose={() => setAboutModalOpen(false)} />
        </div>
    );
};

export default App;
