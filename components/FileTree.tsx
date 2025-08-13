
import React, { useState } from 'react';
import { FileTreeNode } from '../types';
import FileCodeIcon from './icons/FileCodeIcon';
import FolderIcon from './icons/FolderIcon';

interface FileTreeProps {
  node: FileTreeNode;
  onFileSelect: (file: FileTreeNode) => void;
  level?: number;
}

const FileTree: React.FC<FileTreeProps> = ({ node, onFileSelect, level = 0 }) => {
  const [isOpen, setIsOpen] = useState(level < 2); // Auto-open first few levels

  const isFolder = node.type === 'folder';

  const handleToggle = () => {
    if (isFolder) {
      setIsOpen(!isOpen);
    } else {
      onFileSelect(node);
    }
  };

  const paddingLeft = `${level * 1 + 0.5}rem`;

  return (
    <div>
      <div
        onClick={handleToggle}
        className="flex items-center px-2 py-1.5 text-sm rounded-md cursor-pointer hover:bg-gray-700/50 transition-colors duration-150"
        style={{ paddingLeft }}
      >
        <div className="mr-2 flex-shrink-0">
          {isFolder ? <FolderIcon isOpen={isOpen} /> : <FileCodeIcon />}
        </div>
        <span>{node.name}</span>
      </div>
      {isFolder && isOpen && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTree key={child.id} node={child} onFileSelect={onFileSelect} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FileTree;
