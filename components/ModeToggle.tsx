
import React from 'react';
import { EditorMode } from '../types';

interface ModeToggleProps {
  mode: EditorMode;
  onModeChange: (mode: EditorMode) => void;
}

const ModeToggle: React.FC<ModeToggleProps> = ({ mode, onModeChange }) => {
  const isLight = mode === EditorMode.LIGHT;

  const toggle = () => {
    onModeChange(isLight ? EditorMode.FULL : EditorMode.LIGHT);
  };

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-2 px-2 py-0.5 rounded hover:bg-cyan-500 transition-colors"
      title="Toggle Performance Mode"
    >
      <div className="relative w-5 h-5">
        {/* Bolt for Full Mode */}
        <svg xmlns="http://www.w3.org/2000/svg" className={`absolute transition-opacity duration-300 ${isLight ? 'opacity-0' : 'opacity-100'}`} viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 11-12h-9l1-8z"/></svg>
        {/* Feather for Light Mode */}
        <svg xmlns="http://www.w3.org/2000/svg" className={`absolute transition-opacity duration-300 ${isLight ? 'opacity-100' : 'opacity-0'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/><path d="M16 8L2 22"/><path d="M17.5 15H9"/></svg>
      </div>
      <span className="font-semibold">{isLight ? 'Light Mode' : 'Full Mode'}</span>
    </button>
  );
};

export default ModeToggle;
