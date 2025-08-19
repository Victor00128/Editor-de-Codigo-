import { useState, useCallback, useRef } from 'react';
import { TerminalHistoryLine } from '../types';

export interface TerminalCommand {
    name: string;
    description: string;
    usage: string;
    execute: (args: string[], fileSystem: any, onFileOpen?: (file: any) => void) => string;
}

export const useTerminal = (fileSystem: any, onFileOpen?: (file: any) => void) => {
    const [history, setHistory] = useState<TerminalHistoryLine[]>([
        { id: Date.now(), type: 'output', content: 'Welcome to Nexus Code Terminal!' },
        { id: Date.now() + 1, type: 'output', content: "Type 'help' to see available commands." },
    ]);
    
    const [currentDirectory, setCurrentDirectory] = useState<string>('/');
    const commandHistory = useRef<string[]>([]);
    const historyIndex = useRef<number>(-1);

    const addToHistory = useCallback((type: 'input' | 'output', content: string) => {
        setHistory(prev => [...prev, { id: Date.now(), type, content }]);
    }, []);

    const findFileInTree = useCallback((nodes: any[], fileName: string): any => {
        for (const node of nodes) {
            if (node.type === 'file' && node.name === fileName) {
                return node;
            }
            if (node.type === 'folder') {
                const found = findFileInTree(node.children, fileName);
                if (found) return found;
            }
        }
        return null;
    }, []);

    const findFolderInTree = useCallback((nodes: any[], folderName: string): any => {
        for (const node of nodes) {
            if (node.type === 'folder' && node.name === folderName) {
                return node;
            }
            if (node.type === 'folder') {
                const found = findFolderInTree(node.children, folderName);
                if (found) return found;
            }
        }
        return null;
    }, []);

    const getCurrentPathContents = useCallback(() => {
        if (currentDirectory === '/') {
            return fileSystem;
        }
        
        const pathParts = currentDirectory.split('/').filter(Boolean);
        let current = fileSystem;
        
        for (const part of pathParts) {
            const found = findFolderInTree([current], part);
            if (!found) return null;
            current = found.children;
        }
        
        return current;
    }, [currentDirectory, fileSystem, findFolderInTree]);

    const commands: TerminalCommand[] = [
        {
            name: 'help',
            description: 'Show available commands',
            usage: 'help',
            execute: () => {
                return `Available commands:
help - Show this help
ls - List files and directories
cd <directory> - Change directory
pwd - Show current directory
cat <file> - Show file contents
touch <file> - Create new file
mkdir <directory> - Create new directory
rm <file/directory> - Remove file or directory
clear - Clear terminal
echo <text> - Print text
find <pattern> - Search for files
grep <pattern> <file> - Search in file content`;
            }
        },
        {
            name: 'ls',
            description: 'List files and directories',
            usage: 'ls',
            execute: () => {
                const contents = getCurrentPathContents();
                if (!contents) return 'Directory not found';
                
                if (contents.length === 0) return 'Directory is empty';
                
                const items = contents.map((item: any) => {
                    const icon = item.type === 'folder' ? '📁' : '📄';
                    const status = item.gitStatus ? ` [${item.gitStatus}]` : '';
                    return `${icon} ${item.name}${status}`;
                });
                
                return items.join('\n');
            }
        },
        {
            name: 'cd',
            description: 'Change directory',
            usage: 'cd <directory>',
            execute: (args) => {
                if (args.length === 0) {
                    setCurrentDirectory('/');
                    return 'Changed to root directory';
                }
                
                const target = args[0];
                
                if (target === '..') {
                    if (currentDirectory === '/') return 'Already at root';
                    const newPath = currentDirectory.split('/').slice(0, -1).join('/') || '/';
                    setCurrentDirectory(newPath);
                    return `Changed to ${newPath}`;
                }
                
                if (target === '/') {
                    setCurrentDirectory('/');
                    return 'Changed to root directory';
                }
                
                const contents = getCurrentPathContents();
                if (!contents) return 'Directory not found';
                
                const targetFolder = findFolderInTree(contents, target);
                if (!targetFolder) return `Directory '${target}' not found`;
                
                const newPath = currentDirectory === '/' ? `/${target}` : `${currentDirectory}/${target}`;
                setCurrentDirectory(newPath);
                return `Changed to ${newPath}`;
            }
        },
        {
            name: 'pwd',
            description: 'Show current directory',
            usage: 'pwd',
            execute: () => currentDirectory
        },
        {
            name: 'cat',
            description: 'Show file contents',
            usage: 'cat <file>',
            execute: (args) => {
                if (args.length === 0) return 'Usage: cat <file>';
                
                const fileName = args[0];
                const contents = getCurrentPathContents();
                if (!contents) return 'Directory not found';
                
                const file = findFileInTree(contents, fileName);
                if (!file) return `File '${fileName}' not found`;
                
                if (file.type !== 'file') return `'${fileName}' is not a file`;
                
                return `=== ${fileName} ===\n${file.content}`;
            }
        },
        {
            name: 'touch',
            description: 'Create new file',
            usage: 'touch <file>',
            execute: (args) => {
                if (args.length === 0) return 'Usage: touch <file>';
                
                const fileName = args[0];
                // This would need to be integrated with the file system hook
                return `File '${fileName}' would be created (use UI for now)`;
            }
        },
        {
            name: 'mkdir',
            description: 'Create new directory',
            usage: 'mkdir <directory>',
            execute: (args) => {
                if (args.length === 0) return 'Usage: mkdir <directory>';
                
                const dirName = args[0];
                // This would need to be integrated with the file system hook
                return `Directory '${dirName}' would be created (use UI for now)`;
            }
        },
        {
            name: 'rm',
            description: 'Remove file or directory',
            usage: 'rm <file/directory>',
            execute: (args) => {
                if (args.length === 0) return 'Usage: rm <file/directory>';
                
                const target = args[0];
                // This would need to be integrated with the file system hook
                return `'${target}' would be removed (use UI for now)`;
            }
        },
        {
            name: 'clear',
            description: 'Clear terminal',
            usage: 'clear',
            execute: () => {
                setHistory([]);
                return '';
            }
        },
        {
            name: 'echo',
            description: 'Print text',
            usage: 'echo <text>',
            execute: (args) => args.join(' ')
        },
        {
            name: 'find',
            description: 'Search for files',
            usage: 'find <pattern>',
            execute: (args) => {
                if (args.length === 0) return 'Usage: find <pattern>';
                
                const pattern = args[0].toLowerCase();
                const results: string[] = [];
                
                const searchRecursive = (nodes: any[], path: string = '') => {
                    for (const node of nodes) {
                        const currentPath = path ? `${path}/${node.name}` : node.name;
                        if (node.name.toLowerCase().includes(pattern)) {
                            const icon = node.type === 'folder' ? '📁' : '📄';
                            results.push(`${icon} ${currentPath}`);
                        }
                        if (node.type === 'folder') {
                            searchRecursive(node.children, currentPath);
                        }
                    }
                };
                
                searchRecursive(fileSystem);
                
                if (results.length === 0) return `No files found matching '${pattern}'`;
                return results.join('\n');
            }
        },
        {
            name: 'grep',
            description: 'Search in file content',
            usage: 'grep <pattern> <file>',
            execute: (args) => {
                if (args.length < 2) return 'Usage: grep <pattern> <file>';
                
                const pattern = args[0].toLowerCase();
                const fileName = args[1];
                
                const file = findFileInTree(fileSystem, fileName);
                if (!file || file.type !== 'file') return `File '${fileName}' not found`;
                
                const lines = file.content.split('\n');
                const matches: string[] = [];
                
                lines.forEach((line: string, index: number) => {
                    if (line.toLowerCase().includes(pattern)) {
                        matches.push(`${fileName}:${index + 1}: ${line}`);
                    }
                });
                
                if (matches.length === 0) return `No matches found in '${fileName}'`;
                return matches.join('\n');
            }
        }
    ];

    const executeCommand = useCallback((commandLine: string) => {
        const trimmed = commandLine.trim();
        if (!trimmed) return;
        
        addToHistory('input', trimmed);
        commandHistory.current.push(trimmed);
        historyIndex.current = -1;
        
        const parts = trimmed.split(' ');
        const commandName = parts[0];
        const args = parts.slice(1);
        
        const command = commands.find(cmd => cmd.name === commandName);
        
        if (!command) {
            addToHistory('output', `Command not found: ${commandName}. Type 'help' for available commands.`);
            return;
        }
        
        try {
            const result = command.execute(args, fileSystem, onFileOpen);
            if (result !== '') {
                addToHistory('output', result);
            }
        } catch (error) {
            addToHistory('output', `Error executing command: ${error}`);
        }
    }, [commands, fileSystem, onFileOpen, addToHistory]);

    const navigateHistory = useCallback((direction: 'up' | 'down') => {
        if (direction === 'up' && historyIndex.current < commandHistory.current.length - 1) {
            historyIndex.current++;
            return commandHistory.current[commandHistory.current.length - 1 - historyIndex.current];
        } else if (direction === 'down' && historyIndex.current > 0) {
            historyIndex.current--;
            return commandHistory.current[commandHistory.current.length - 1 - historyIndex.current];
        } else if (direction === 'down' && historyIndex.current === 0) {
            historyIndex.current = -1;
            return '';
        }
        return null;
    }, []);

    return {
        history,
        currentDirectory,
        executeCommand,
        navigateHistory,
        addToHistory
    };
};



