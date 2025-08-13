
import React from 'react';
import { EditorMode } from '../types';
import ModeToggle from './ModeToggle';
import TerminalIcon from './icons/TerminalIcon';
import SparklesIcon from './icons/SparklesIcon';

interface StatusBarProps {
  mode: EditorMode;
  onModeChange: (mode: EditorMode) => void;
  onTerminalToggle: () => void;
  onAIPanelToggle: () => void;
}

const StatusBar: React.FC<StatusBarProps> = ({ mode, onModeChange, onTerminalToggle, onAIPanelToggle }) => {
  return (
    <footer className="h-8 bg-cyan-600 text-white flex items-center justify-between px-4 text-sm shrink-0">
      <div className="flex items-center gap-4">
        <ModeToggle mode={mode} onModeChange={onModeChange} />
        {/* Placeholder for more status items like Git branch, line/col number etc. */}
      </div>
      <div className="flex items-center gap-4">
        <button onClick={onAIPanelToggle} className="flex items-center gap-1 hover:bg-cyan-500 px-2 py-0.5 rounded">
          <SparklesIcon className="w-4 h-4" />
          <span>AI Assistant</span>
        </button>
        <button onClick={onTerminalToggle} className="flex items-center gap-1 hover:bg-cyan-500 px-2 py-0.5 rounded">
          <TerminalIcon className="w-4 h-4" />
          <span>Terminal</span>
        </button>
      </div>
    </footer>
  );
};

export default StatusBar;
