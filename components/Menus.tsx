import React, { useState, useEffect, useRef, useMemo } from 'react';
import { CloseIcon } from './icons';
import { Command } from '../types';


// --- Context Menu Component ---
interface ContextMenuItem {
    label: string;
    onClick: () => void;
    disabled?: boolean;
}
interface ContextMenuProps {
    x: number;
    y: number;
    items: ContextMenuItem[];
    onClose: () => void;
}
export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, items, onClose }) => {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    return (
        <div
            ref={menuRef}
            style={{ top: y, left: x }}
            className="absolute w-48 bg-light-sidebar dark:bg-dark-sidebar shadow-lg rounded-md border border-light-border dark:border-dark-border z-50"
        >
            <ul className="py-1">
                {items.map((item, index) => (
                     <li key={index}>
                        <button
                            onClick={() => {
                                if (!item.disabled) {
                                    item.onClick();
                                    onClose();
                                }
                            }}
                            disabled={item.disabled}
                            className="w-full text-left px-4 py-1.5 text-sm hover:bg-dark-accent/20 dark:hover:bg-dark-accent/30 disabled:opacity-50 disabled:hover:bg-transparent"
                        >
                            {item.label}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};


// --- About Modal Component ---
interface AboutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={onClose}>
            <div
                className="bg-light-sidebar dark:bg-dark-sidebar p-6 rounded-lg shadow-2xl w-full max-w-md border border-light-border dark:border-dark-border"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">About Nexus Code</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-dark-accent/20">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="text-sm space-y-2">
                    <p><span className="font-semibold">Version:</span> 1.0.0</p>
                    <p>A minimalist, clean, and modern code editor designed for speed, simplicity, and efficiency.</p>
                    <p>Built with React, TypeScript, and Tailwind CSS.</p>
                </div>
            </div>
        </div>
    );
};

// --- Command Palette Component ---
interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
    commands: Command[];
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, commands }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const resultsRef = useRef<HTMLUListElement>(null);

    const filteredCommands = useMemo(() => {
        if (!searchTerm) return commands;
        const lowerCaseSearch = searchTerm.toLowerCase();
        return commands.filter(cmd =>
            cmd.label.toLowerCase().includes(lowerCaseSearch) ||
            cmd.keywords?.toLowerCase().includes(lowerCaseSearch)
        );
    }, [searchTerm, commands]);

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
            setSearchTerm('');
        }
    }, [isOpen]);
    
    useEffect(() => {
      setActiveIndex(0);
    }, [filteredCommands]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex(prev => (prev + 1) % filteredCommands.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
        } else if (e.key === 'Enter') {
            if (filteredCommands[activeIndex]) {
                filteredCommands[activeIndex].action();
                onClose();
            }
        }
    };
    
    useEffect(() => {
        // Scroll active item into view
        const activeItem = resultsRef.current?.children[activeIndex] as HTMLLIElement;
        activeItem?.scrollIntoView({ block: 'nearest' });
    }, [activeIndex]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/30 z-50 flex justify-center pt-20" onClick={onClose}>
            <div
                className="w-full max-w-xl bg-light-bg-alt dark:bg-dark-bg-alt rounded-lg shadow-2xl flex flex-col overflow-hidden border border-dark-border"
                onClick={e => e.stopPropagation()}
                onKeyDown={handleKeyDown}
            >
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Type a command..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full p-4 bg-transparent text-lg border-b border-light-border dark:border-dark-border outline-none"
                />
                <ul ref={resultsRef} className="max-h-80 overflow-y-auto p-2">
                    {filteredCommands.length > 0 ? (
                        filteredCommands.map((cmd, index) => (
                            <li
                                key={cmd.id}
                                onMouseDown={(e) => { e.preventDefault(); cmd.action(); onClose(); }}
                                onMouseMove={() => setActiveIndex(index)}
                                className={`p-3 rounded-md cursor-pointer text-left flex items-center justify-between ${
                                    index === activeIndex ? 'bg-dark-accent/30' : ''
                                }`}
                            >
                               <span>{cmd.label}</span>
                            </li>
                        ))
                    ) : (
                        <li className="p-3 text-dark-text-alt">No commands found.</li>
                    )}
                </ul>
            </div>
        </div>
    );
};

// --- New Item Modal Component ---
interface NewItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (name: string, type: 'file' | 'folder') => void;
    type: 'file' | 'folder';
    parentName?: string;
}

export const NewItemModal: React.FC<NewItemModalProps> = ({ isOpen, onClose, onConfirm, type, parentName }) => {
    const [itemName, setItemName] = useState('');
    const [error, setError] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setItemName('');
            setError('');
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!itemName.trim()) {
            setError('Name cannot be empty');
            return;
        }
        
        if (itemName.includes('/') || itemName.includes('\\')) {
            setError('Name cannot contain slashes');
            return;
        }
        
        if (itemName === '.' || itemName === '..') {
            setError('Invalid name');
            return;
        }

        onConfirm(itemName.trim(), type);
        onClose();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={onClose}>
            <div
                className="bg-light-sidebar dark:bg-dark-sidebar p-6 rounded-lg shadow-2xl w-full max-w-md border border-light-border dark:border-dark-border"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-dark-text dark:text-dark-text">
                        New {type === 'file' ? 'File' : 'Folder'}
                        {parentName && ` in ${parentName}`}
                    </h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-dark-accent/20">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="itemName" className="block text-sm font-medium text-dark-text dark:text-dark-text mb-2">
                            {type === 'file' ? 'File' : 'Folder'} Name
                        </label>
                        <input
                            ref={inputRef}
                            id="itemName"
                            type="text"
                            value={itemName}
                            onChange={(e) => {
                                setItemName(e.target.value);
                                setError('');
                            }}
                            onKeyDown={handleKeyDown}
                            className="w-full px-3 py-2 bg-light-bg dark:bg-dark-bg border border-dark-accent/30 rounded-md text-dark-text dark:text-dark-text focus:outline-none"
                            placeholder={`Enter ${type} name...`}
                            autoComplete="off"
                        />
                        {error && (
                            <p className="text-red-500 text-sm mt-1">{error}</p>
                        )}
                    </div>
                    
                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-dark-text-alt dark:text-dark-text-alt hover:text-dark-text dark:hover:text-dark-text transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-dark-accent hover:bg-dark-accent/80 text-white rounded-md transition-colors"
                        >
                            Create {type === 'file' ? 'File' : 'Folder'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};