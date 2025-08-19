import React, { useState, useCallback, useMemo } from 'react';
import { File, Theme, GitStatus } from '../types';
import { GitIcon, FileIcon, JsIcon, CssIcon, HtmlIcon, TypescriptIcon, JsonIcon, ReactIcon, PlusIcon, MinusIcon, CheckIcon } from './icons';

interface GitViewProps {
    fileSystem: any[];
    savedFileSystem: any[];
    theme: Theme;
    onFileOpen: (file: File) => void;
    onResetToSaved: () => void;
}

const GitView: React.FC<GitViewProps> = ({ fileSystem, savedFileSystem, theme, onFileOpen, onResetToSaved }) => {
    const [commitMessage, setCommitMessage] = useState('');
    const [stagedFiles, setStagedFiles] = useState<Set<string>>(new Set());
    const [showCommitForm, setShowCommitForm] = useState(false);

    const getChangedFiles = useMemo((): File[] => {
        let results: File[] = [];
        
        const traverse = (workingNodes: any[], savedNodes: any[], path: string = '') => {
            for (const workingNode of workingNodes) {
                const savedNode = savedNodes.find((n: any) => n.id === workingNode.id);
                const currentPath = path ? `${path}/${workingNode.name}` : workingNode.name;
                
                if (workingNode.type === 'file') {
                    if (!savedNode) {
                        // New file
                        results.push({ ...workingNode, gitStatus: 'A' as GitStatus });
                    } else if (workingNode.content !== savedNode.content || workingNode.isDirty) {
                        // Modified file
                        results.push({ ...workingNode, gitStatus: 'M' as GitStatus });
                    }
                } else if (workingNode.type === 'folder') {
                    if (savedNode) {
                        traverse(workingNode.children, savedNode.children, currentPath);
                    } else {
                        // New folder - check for files inside
                        const collectFiles = (nodes: any[]): File[] => {
                            let files: File[] = [];
                            for (const node of nodes) {
                                if (node.type === 'file') {
                                    files.push({ ...node, gitStatus: 'A' as GitStatus });
                                } else if (node.type === 'folder') {
                                    files.push(...collectFiles(node.children));
                                }
                            }
                            return files;
                        };
                        results.push(...collectFiles(workingNode.children));
                    }
                }
            }
        };
        
        traverse(fileSystem, savedFileSystem);
        return results;
    }, [fileSystem, savedFileSystem]);

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

    const getStatusIcon = (status: GitStatus) => {
        switch (status) {
            case 'A':
                return <PlusIcon className="w-4 h-4" style={{color: '#10b981'}} />;
            case 'M':
                return <MinusIcon className="w-4 h-4" style={{color: '#f59e0b'}} />;
            case 'U':
                return <MinusIcon className="w-4 h-4" style={{color: '#3b82f6'}} />;
            default:
                return null;
        }
    };

    const toggleStaged = useCallback((fileId: string) => {
        setStagedFiles(prev => {
            const newSet = new Set(prev);
            if (newSet.has(fileId)) {
                newSet.delete(fileId);
            } else {
                newSet.add(fileId);
            }
            return newSet;
        });
    }, []);

    const stageAll = useCallback(() => {
        setStagedFiles(new Set(changedFiles.map(f => f.id)));
    }, [changedFiles]);

    const unstageAll = useCallback(() => {
        setStagedFiles(new Set());
    }, []);

    const handleCommit = useCallback(() => {
        if (!commitMessage.trim()) {
            alert('Please enter a commit message');
            return;
        }
        
        if (stagedFiles.size === 0) {
            alert('Please stage some files before committing');
            return;
        }
        
        // This would need to be integrated with the file system hook
        alert(`Commit "${commitMessage}" would be created with ${stagedFiles.size} staged files`);
        setCommitMessage('');
        setStagedFiles(new Set());
        setShowCommitForm(false);
    }, [commitMessage, stagedFiles]);

    const handleDiscardChanges = useCallback(() => {
        if (window.confirm('Are you sure you want to discard all changes? This action cannot be undone.')) {
            onResetToSaved();
            setStagedFiles(new Set());
        }
    }, [onResetToSaved]);

    const getFileDiff = (file: File) => {
        const savedFile = savedFileSystem.find((f: any) => f.id === file.id);
        if (!savedFile) return null;
        
        const workingLines = file.content.split('\n');
        const savedLines = savedFile.content.split('\n');
        
        const diff: { type: 'added' | 'removed' | 'unchanged', line: string, lineNumber: number }[] = [];
        
        const maxLines = Math.max(workingLines.length, savedLines.length);
        for (let i = 0; i < maxLines; i++) {
            const workingLine = workingLines[i] || '';
            const savedLine = savedLines[i] || '';
            
            if (workingLine === savedLine) {
                diff.push({ type: 'unchanged', line: workingLine, lineNumber: i + 1 });
            } else {
                if (savedLine) {
                    diff.push({ type: 'removed', line: savedLine, lineNumber: i + 1 });
                }
                if (workingLine) {
                    diff.push({ type: 'added', line: workingLine, lineNumber: i + 1 });
                }
            }
        }
        
        return diff;
    };

    const changedFiles = getChangedFiles;
    const hasChanges = changedFiles.length > 0;
    const hasStagedFiles = stagedFiles.size > 0;

    return (
        <div className="h-full flex flex-col p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <GitIcon className="w-5 h-5 text-dark-text-alt" />
                    <h2 className="text-lg font-semibold text-dark-text dark:text-dark-text">Source Control</h2>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-dark-text-alt">
                        {changedFiles.length} change{changedFiles.length !== 1 ? 's' : ''}
                    </span>
                    <button
                        onClick={() => setShowCommitForm(!showCommitForm)}
                        disabled={!hasStagedFiles}
                        className="px-3 py-1 bg-dark-accent hover:bg-dark-accent/80 disabled:bg-dark-accent/30 disabled:cursor-not-allowed rounded text-white text-sm transition-colors"
                    >
                        Commit
                    </button>
                </div>
            </div>

            {/* Commit Form */}
            {showCommitForm && (
                <div className="p-4 bg-light-bg-alt dark:bg-dark-bg-alt rounded-md border border-dark-accent/20">
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-dark-text dark:text-dark-text mb-2">
                                Commit Message
                            </label>
                            <textarea
                                value={commitMessage}
                                onChange={(e) => setCommitMessage(e.target.value)}
                                placeholder="Enter commit message..."
                                className="w-full p-3 bg-light-bg dark:bg-dark-bg border border-dark-accent/30 rounded-md text-dark-text dark:text-dark-text focus:outline-none resize-none"
                                rows={3}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-dark-text-alt">
                                {stagedFiles.size} file{stagedFiles.size !== 1 ? 's' : ''} staged
                            </span>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setShowCommitForm(false)}
                                    className="px-3 py-1 bg-dark-accent/20 hover:bg-dark-accent/30 rounded text-dark-text dark:text-dark-text text-sm transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCommit}
                                    disabled={!commitMessage.trim()}
                                    className="px-3 py-1 bg-dark-accent hover:bg-dark-accent/80 disabled:bg-dark-accent/30 disabled:cursor-not-allowed rounded text-white text-sm transition-colors"
                                >
                                    Commit
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Actions */}
            {hasChanges && (
                <div className="flex items-center space-x-2">
                    <button
                        onClick={stageAll}
                        className="px-3 py-1 bg-dark-accent/20 hover:bg-dark-accent/30 rounded text-dark-text dark:text-dark-text text-sm transition-colors"
                    >
                        Stage All
                    </button>
                    <button
                        onClick={unstageAll}
                        disabled={!hasStagedFiles}
                        className="px-3 py-1 bg-dark-accent/20 hover:bg-dark-accent/30 disabled:bg-dark-accent/10 disabled:cursor-not-allowed rounded text-dark-text dark:text-dark-text text-sm transition-colors"
                    >
                        Unstage All
                    </button>
                    <button
                        onClick={handleDiscardChanges}
                        className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 rounded text-red-500 text-sm transition-colors"
                    >
                        Discard All Changes
                    </button>
                </div>
            )}

            {/* Changes */}
            <div className="flex-1 overflow-y-auto space-y-2">
                {changedFiles.map((file) => (
                    <div
                        key={file.id}
                        className="border border-dark-accent/20 rounded-md overflow-hidden"
                    >
                        {/* File Header */}
                        <div className="flex items-center justify-between p-3 bg-light-bg-alt dark:bg-dark-bg-alt">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={stagedFiles.has(file.id)}
                                    onChange={() => toggleStaged(file.id)}
                                    className="rounded"
                                />
                                {getFileIcon(file)}
                                <span className="font-medium text-dark-text dark:text-dark-text">{file.name}</span>
                                <span className="text-xs text-dark-text-alt bg-dark-accent/20 px-2 py-1 rounded">
                                    {file.language}
                                </span>
                            </div>
                            <div className="flex items-center space-x-2">
                                {getStatusIcon(file.gitStatus!)}
                                <span className="text-xs text-dark-text-alt">
                                    {file.gitStatus === 'A' ? 'Added' : file.gitStatus === 'M' ? 'Modified' : 'Untracked'}
                                </span>
                                <button
                                    onClick={() => onFileOpen(file)}
                                    className="px-2 py-1 text-xs bg-dark-accent/20 hover:bg-dark-accent/30 rounded text-dark-text dark:text-dark-text transition-colors"
                                >
                                    Open
                                </button>
                            </div>
                        </div>

                        {/* File Diff */}
                        {file.gitStatus === 'M' && (
                            <div className="p-3 bg-light-bg dark:bg-dark-bg text-xs font-mono">
                                <div className="text-dark-text-alt mb-2">Changes:</div>
                                {getFileDiff(file)?.map((diffLine, index) => (
                                    <div
                                        key={index}
                                        className={`py-1 ${
                                            diffLine.type === 'added' ? 'bg-green-500/20 text-green-700 dark:text-green-400' :
                                            diffLine.type === 'removed' ? 'bg-red-500/20 text-red-700 dark:text-red-400' :
                                            'text-dark-text-alt'
                                        }`}
                                    >
                                        <span className="inline-block w-8 text-right mr-2 opacity-50">
                                            {diffLine.lineNumber}
                                        </span>
                                        <span className={diffLine.type === 'added' ? 'text-green-600' : diffLine.type === 'removed' ? 'text-red-600' : ''}>
                                            {diffLine.type === 'added' ? '+' : diffLine.type === 'removed' ? '-' : ' '}
                                        </span>
                                        {diffLine.line}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}

                {!hasChanges && (
                    <div className="text-center py-8 text-dark-text-alt">
                        <GitIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No changes detected</p>
                        <p className="text-sm">All files are up to date</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GitView;



