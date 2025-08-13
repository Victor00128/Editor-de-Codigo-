
import React from 'react';
import { FileTreeNode } from '../types';
import FileTree from './FileTree';

interface SidebarProps {
  isVisible: boolean;
  fileTree: FileTreeNode;
  onFileSelect: (file: FileTreeNode) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isVisible, fileTree, onFileSelect }) => {
  if (!isVisible) return null;

  return (
    <aside className="w-64 bg-gray-800/50 border-r border-gray-700/50 flex flex-col shrink-0">
      <div className="p-2 border-b border-gray-700/50">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Explorer</h2>
      </div>
      <div className="flex-grow p-2 overflow-y-auto">
        <FileTree node={fileTree} onFileSelect={onFileSelect} />
      </div>
    </aside>
  );
};

export default Sidebar;
