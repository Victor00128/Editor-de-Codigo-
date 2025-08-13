
import React from 'react';
import { OpenFile } from '../types';
import CloseIcon from './icons/CloseIcon';
import FileCodeIcon from './icons/FileCodeIcon';

interface TabsBarProps {
  openFiles: OpenFile[];
  activeFileId: string | null;
  onTabClick: (fileId: string) => void;
  onTabClose: (fileId:string) => void;
}

const TabsBar: React.FC<TabsBarProps> = ({ openFiles, activeFileId, onTabClick, onTabClose }) => {
  if (openFiles.length === 0) {
    return (
      <div className="h-10 flex items-center justify-center bg-gray-800 text-gray-500 text-sm">
        Open a file to start working
      </div>
    );
  }

  return (
    <div className="h-10 bg-gray-800 flex items-end">
      {openFiles.map((file) => (
        <div
          key={file.id}
          onClick={() => onTabClick(file.id)}
          className={`h-full flex items-center px-4 pt-1 cursor-pointer border-r border-gray-700/50 relative ${
            activeFileId === file.id
              ? 'bg-[#1e1e1e] border-t-2 border-t-cyan-400 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700/50'
          }`}
        >
          <FileCodeIcon className="w-4 h-4 mr-2" />
          <span className="text-sm">{file.name}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTabClose(file.id);
            }}
            className="ml-3 p-0.5 rounded-md hover:bg-gray-600"
          >
            <CloseIcon className="w-3 h-3" />
          </button>
        </div>
      ))}
      <div className="flex-grow h-full bg-gray-800 border-b border-gray-700/50" />
    </div>
  );
};

export default TabsBar;
