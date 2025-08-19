import React, { useState, useCallback, useMemo } from 'react';
import { File, FileSystemNode, Theme } from '../types';
import { 
    FileIcon, TypescriptIcon, JsIcon, CssIcon, HtmlIcon, JsonIcon, ReactIcon,
    SearchIcon, ReplaceIcon, PlusIcon, MinusIcon
} from './icons';

interface SearchViewProps {
    fileSystem: any[];
    theme: Theme;
    onFileOpen: (file: File) => void;
}

const SearchView: React.FC<SearchViewProps> = ({ fileSystem, theme, onFileOpen }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [replaceTerm, setReplaceTerm] = useState('');
    const [searchInContent, setSearchInContent] = useState(true);
    const [useRegex, setUseRegex] = useState(false);
    const [caseSensitive, setCaseSensitive] = useState(false);
    const [showReplace, setShowReplace] = useState(false);

    const searchFiles = useCallback((term: string) => {
        if (!term.trim()) return [];
        
        const results: File[] = [];
        const lowerCaseTerm = term.toLowerCase();
        
        const searchRecursive = (nodes: FileSystemNode[]) => {
            for (const node of nodes) {
                if (node.type === 'file') {
                    const nameMatch = caseSensitive 
                        ? node.name.includes(term)
                        : node.name.toLowerCase().includes(lowerCaseTerm);
                    
                    let contentMatch = false;
                    if (searchInContent) {
                        if (useRegex) {
                            try {
                                const searchPattern = new RegExp(term, caseSensitive ? 'g' : 'gi');
                                contentMatch = searchPattern.test(node.content);
                            } catch (e) {
                                // Invalid regex, skip
                            }
                        } else {
                            contentMatch = caseSensitive 
                                ? node.content.includes(term)
                                : node.content.toLowerCase().includes(lowerCaseTerm);
                        }
                    }
                    
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
    }, [fileSystem, searchInContent, useRegex, caseSensitive]);

    const searchResults = useMemo(() => searchFiles(searchTerm), [searchFiles, searchTerm]);

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

    const highlightMatches = (text: string, term: string) => {
        if (!term || !text) return text;
        
        if (useRegex) {
            try {
                const regex = new RegExp(`(${term})`, caseSensitive ? 'g' : 'gi');
                return text.replace(regex, '<mark class="bg-yellow-300 dark:bg-yellow-600">$1</mark>');
            } catch (e) {
                return text;
            }
        } else {
            const regex = new RegExp(`(${term})`, caseSensitive ? 'gi' : 'gi');
            return text.replace(regex, '<mark class="bg-yellow-300 dark:bg-yellow-600">$1</mark>');
        }
    };

    const getMatchCount = (file: File) => {
        if (!searchTerm) return 0;
        
        let count = 0;
        const term = caseSensitive ? searchTerm : searchTerm.toLowerCase();
        const content = caseSensitive ? file.content : file.content.toLowerCase();
        
        if (file.name.toLowerCase().includes(term.toLowerCase())) count++;
        
        if (searchInContent) {
            const matches = content.match(new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'));
            count += matches ? matches.length : 0;
        }
        
        return count;
    };

    const handleReplace = useCallback((file: File) => {
        if (!searchTerm || !replaceTerm) return;
        
        // This would need to be integrated with the file system hook
        alert(`Replace functionality would be implemented here for ${file.name}`);
    }, [searchTerm, replaceTerm]);

    const handleReplaceAll = useCallback(() => {
        if (!searchTerm || !replaceTerm) return;
        
        // This would need to be integrated with the file system hook
        alert(`Replace all functionality would be implemented here`);
    }, [searchTerm, replaceTerm]);

    return (
        <div className="h-full flex flex-col p-4 space-y-4">
            {/* Search Controls */}
            <div className="space-y-3">
                <div className="flex items-center space-x-2">
                    <SearchIcon className="w-5 h-5 text-dark-text-alt" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search files..."
                        className="flex-1 bg-transparent text-dark-text dark:text-dark-text focus:outline-none"
                    />
                    <button
                        onClick={() => setShowReplace(!showReplace)}
                        className="px-3 py-2 bg-dark-accent/20 hover:bg-dark-accent/30 rounded-md text-dark-text dark:text-dark-text transition-colors"
                    >
                        <ReplaceIcon className="w-4 h-4" />
                    </button>
                </div>

                {showReplace && (
                    <div className="flex items-center space-x-2">
                        <ReplaceIcon className="w-5 h-5 text-dark-text-alt" />
                        <input
                            type="text"
                            value={replaceTerm}
                            onChange={(e) => setReplaceTerm(e.target.value)}
                            placeholder="Replace with..."
                            className="flex-1 px-3 py-2 bg-light-bg dark:bg-dark-bg border border-dark-accent/30 rounded-md text-dark-text dark:text-dark-text focus:outline-none"
                        />
                        <button
                            onClick={handleReplaceAll}
                            className="px-3 py-2 bg-dark-accent hover:bg-dark-accent/80 rounded-md text-white transition-colors"
                        >
                            Replace All
                        </button>
                    </div>
                )}

                {/* Search Options */}
                <div className="flex items-center space-x-4 text-sm">
                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={searchInContent}
                            onChange={(e) => setSearchInContent(e.target.checked)}
                            className="rounded"
                        />
                        <span>Search in content</span>
                    </label>
                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={useRegex}
                            onChange={(e) => setUseRegex(e.target.checked)}
                            className="rounded"
                        />
                        <span>Use regex</span>
                    </label>
                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={caseSensitive}
                            onChange={(e) => setCaseSensitive(e.target.checked)}
                            className="rounded"
                        />
                        <span>Case sensitive</span>
                    </label>
                </div>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto">
                {searchTerm && (
                    <div className="mb-4 text-sm text-dark-text-alt">
                        Found {searchResults.length} file{searchResults.length !== 1 ? 's' : ''} with matches
                    </div>
                )}
                
                <div className="space-y-2">
                    {searchResults.map((file) => (
                        <div
                            key={file.id}
                            className="p-3 bg-light-bg-alt dark:bg-dark-bg-alt rounded-md border border-dark-accent/20 hover:border-dark-accent/40 transition-colors cursor-pointer"
                            onClick={() => onFileOpen(file)}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                    {getFileIcon(file)}
                                    <span className="font-medium text-dark-text dark:text-dark-text">{file.name}</span>
                                    <span className="text-xs text-dark-text-alt bg-dark-accent/20 px-2 py-1 rounded">
                                        {file.language}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-xs text-dark-text-alt">
                                        {getMatchCount(file)} match{getMatchCount(file) !== 1 ? 'es' : ''}
                                    </span>
                                    {showReplace && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleReplace(file);
                                            }}
                                            className="px-2 py-1 text-xs bg-dark-accent/20 hover:bg-dark-accent/30 rounded text-dark-text dark:text-dark-text transition-colors"
                                        >
                                            Replace
                                        </button>
                                    )}
                                </div>
                            </div>
                            
                            {searchInContent && file.content && (
                                <div className="text-sm text-dark-text-alt">
                                    <div 
                                        className="line-clamp-2"
                                        dangerouslySetInnerHTML={{
                                            __html: highlightMatches(
                                                file.content.substring(0, 200) + (file.content.length > 200 ? '...' : ''),
                                                searchTerm
                                            )
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {searchTerm && searchResults.length === 0 && (
                    <div className="text-center py-8 text-dark-text-alt">
                        <SearchIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No files found matching "{searchTerm}"</p>
                    </div>
                )}

                {!searchTerm && (
                    <div className="text-center py-8 text-dark-text-alt">
                        <SearchIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Enter a search term to find files</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchView;



