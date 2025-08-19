import React, { useState, useCallback } from 'react';
import { Extension, Theme } from '../types';
import { ExtensionsIcon, DownloadIcon, CheckIcon, StarIcon, UpdateIcon } from './icons';

interface ExtensionsViewProps {
    extensions: Extension[];
    theme: Theme;
}

const ExtensionsView: React.FC<ExtensionsViewProps> = ({ extensions, theme }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [installedExtensions, setInstalledExtensions] = useState<Set<string>>(new Set());
    const [showInstalledOnly, setShowInstalledOnly] = useState(false);

    const categories = [
        { id: 'all', name: 'All', count: extensions.length },
        { id: 'formatters', name: 'Formatters', count: extensions.filter(ext => ext.name.toLowerCase().includes('format')).length },
        { id: 'linters', name: 'Linters', count: extensions.filter(ext => ext.name.toLowerCase().includes('lint')).length },
        { id: 'git', name: 'Git', count: extensions.filter(ext => ext.name.toLowerCase().includes('git')).length },
        { id: 'servers', name: 'Servers', count: extensions.filter(ext => ext.name.toLowerCase().includes('server')).length },
    ];

    const filteredExtensions = extensions.filter(ext => {
        const matchesSearch = ext.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            ext.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            ext.publisher.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesCategory = selectedCategory === 'all' || 
            (selectedCategory === 'formatters' && ext.name.toLowerCase().includes('format')) ||
            (selectedCategory === 'linters' && ext.name.toLowerCase().includes('lint')) ||
            (selectedCategory === 'git' && ext.name.toLowerCase().includes('git')) ||
            (selectedCategory === 'servers' && ext.name.toLowerCase().includes('server'));
        
        const matchesInstalled = !showInstalledOnly || installedExtensions.has(ext.id);
        
        return matchesSearch && matchesCategory && matchesInstalled;
    });

    const handleInstall = useCallback((extensionId: string) => {
        setInstalledExtensions(prev => new Set([...prev, extensionId]));
        // In a real app, this would trigger the actual installation
        alert('Extension installation would be implemented here');
    }, []);

    const handleUninstall = useCallback((extensionId: string) => {
        setInstalledExtensions(prev => {
            const newSet = new Set(prev);
            newSet.delete(extensionId);
            return newSet;
        });
        // In a real app, this would trigger the actual uninstallation
        alert('Extension uninstallation would be implemented here');
    }, []);

    const handleUpdate = useCallback((extensionId: string) => {
        // In a real app, this would trigger the actual update
        alert('Extension update would be implemented here');
    }, []);

    const formatInstalls = (installs: string) => {
        const num = parseInt(installs.replace(/\D/g, ''));
        if (num >= 1000000) {
            return `${(num / 1000000).toFixed(1)}M`;
        } else if (num >= 1000) {
            return `${(num / 1000).toFixed(1)}K`;
        }
        return installs;
    };

    return (
        <div className="h-full flex flex-col p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <ExtensionsIcon className="w-5 h-5 text-dark-text-alt" />
                    <h2 className="text-lg font-semibold text-dark-text dark:text-dark-text">Extensions</h2>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-dark-text-alt">
                        {installedExtensions.size} installed
                    </span>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="space-y-3">
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search extensions..."
                        className="flex-1 px-3 py-2 bg-light-bg dark:bg-dark-bg border-2 border-dark-accent/40 rounded-md text-dark-text dark:text-dark-text focus:outline-none focus:border-dark-accent transition-colors"
                    />
                    <label className="flex items-center space-x-2 text-sm">
                        <input
                            type="checkbox"
                            checked={showInstalledOnly}
                            onChange={(e) => setShowInstalledOnly(e.target.checked)}
                            className="rounded"
                        />
                        <span>Installed only</span>
                    </label>
                </div>

                {/* Categories */}
                <div className="flex items-center space-x-1 overflow-x-auto pb-2">
                    {categories.map(category => (
                        <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            className={`px-2 py-1 rounded-full text-xs whitespace-nowrap transition-colors flex-shrink-0 ${
                                selectedCategory === category.id
                                    ? 'bg-dark-accent text-white'
                                    : 'bg-dark-accent/20 hover:bg-dark-accent/30 text-dark-text dark:text-dark-text'
                            }`}
                        >
                            {category.name} ({category.count})
                        </button>
                    ))}
                </div>
            </div>

            {/* Extensions List */}
            <div className="flex-1 overflow-y-auto space-y-3">
                {filteredExtensions.map((extension) => {
                    const isInstalled = installedExtensions.has(extension.id);
                    
                    return (
                        <div
                            key={extension.id}
                            className="p-3 bg-light-bg-alt dark:bg-dark-bg-alt rounded-md border border-dark-accent/20 hover:border-dark-accent/40 transition-colors"
                        >
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                                        <h3 className="font-medium text-dark-text dark:text-dark-text truncate">
                                            {extension.name}
                                        </h3>
                                        {isInstalled && (
                                            <CheckIcon className="w-4 h-4 flex-shrink-0" style={{color: '#10b981'}} />
                                        )}
                                    </div>
                                    
                                    <div className="flex items-center space-x-2 ml-2 flex-shrink-0">
                                        {isInstalled ? (
                                            <>
                                                <button
                                                    onClick={() => handleUpdate(extension.id)}
                                                    className="p-1.5 bg-dark-accent/20 hover:bg-dark-accent/30 rounded text-dark-text dark:text-dark-text transition-colors"
                                                    title="Update extension"
                                                >
                                                    <UpdateIcon className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleUninstall(extension.id)}
                                                    className="px-2 py-1 bg-red-500/20 hover:bg-red-500/30 rounded text-red-500 text-xs transition-colors"
                                                >
                                                    Uninstall
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                onClick={() => handleInstall(extension.id)}
                                                className="flex items-center space-x-1 px-2 py-1 bg-dark-accent hover:bg-dark-accent/80 rounded text-white text-xs transition-colors"
                                            >
                                                <DownloadIcon className="w-3 h-3" />
                                                <span>Install</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                                
                                <p className="text-sm text-dark-text-alt dark:text-dark-text-alt line-clamp-2">
                                    {extension.description}
                                </p>
                                
                                <div className="flex items-center space-x-3 text-xs text-dark-text-alt overflow-hidden">
                                    <span className="font-medium truncate">{extension.publisher}</span>
                                    <span className="flex-shrink-0">•</span>
                                    <span className="flex-shrink-0">{formatInstalls(extension.installs)} installs</span>
                                    <span className="flex-shrink-0">•</span>
                                    <div className="flex items-center space-x-1 flex-shrink-0">
                                        <StarIcon className="w-3 h-3 text-yellow-500" />
                                        <span>4.8</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {filteredExtensions.length === 0 && (
                    <div className="text-center py-8 text-dark-text-alt">
                        <ExtensionsIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No extensions found</p>
                        <p className="text-sm">Try adjusting your search or filters</p>
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            {installedExtensions.size > 0 && (
                <div className="pt-4 border-t border-dark-accent/20">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-dark-text-alt">
                            {installedExtensions.size} extension{installedExtensions.size !== 1 ? 's' : ''} installed
                        </span>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => {
                                    // In a real app, this would check for updates
                                    alert('Checking for updates...');
                                }}
                                className="px-3 py-1 bg-dark-accent/20 hover:bg-dark-accent/30 rounded text-dark-text dark:text-dark-text text-sm transition-colors"
                            >
                                Check for Updates
                            </button>
                            <button
                                onClick={() => {
                                    if (window.confirm('Are you sure you want to uninstall all extensions?')) {
                                        setInstalledExtensions(new Set());
                                    }
                                }}
                                className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 rounded text-red-500 text-sm transition-colors"
                            >
                                Uninstall All
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExtensionsView;



