
import React from 'react';
import TerminalIcon from './icons/TerminalIcon';
import CloseIcon from './icons/CloseIcon';

interface TerminalProps {
  isVisible: boolean;
  onClose: () => void;
}

const Terminal: React.FC<TerminalProps> = ({ isVisible, onClose }) => {
  if (!isVisible) return null;

  return (
    <div className="h-64 bg-gray-800/80 border-t border-gray-700/50 flex flex-col backdrop-blur-sm">
      <div className="h-8 bg-gray-700/50 flex items-center justify-between px-4 text-sm">
        <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 text-white"><TerminalIcon /> TERMINAL</button>
            <button className="text-gray-400">PROBLEMS</button>
            <button className="text-gray-400">OUTPUT</button>
        </div>
        <button onClick={onClose} className="p-1 rounded-md hover:bg-gray-600">
            <CloseIcon className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 p-4 font-mono text-sm text-gray-300 overflow-y-auto">
        <p>flux-ide@1.0.0 /workspace</p>
        <p>
          <span className="text-cyan-400">❯</span> This is a simulated terminal.
        </p>
        <p>
          <span className="text-cyan-400">❯</span> In a real app, this would be connected to a system shell via Tauri or another backend.
        </p>
        <p>
            <span className="text-green-400">✓</span> Ready.
        </p>
      </div>
    </div>
  );
};

export default Terminal;
