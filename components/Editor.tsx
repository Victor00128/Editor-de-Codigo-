
import React, { useEffect, useRef, useState } from 'react';
import { EditorMode } from '../types';

interface EditorProps {
  content: string;
  onChange: (newContent: string) => void;
  onSelectionChange: (selectedText: string) => void;
  mode: EditorMode;
}

const Editor: React.FC<EditorProps> = ({ content, onChange, onSelectionChange, mode }) => {
  const [internalContent, setInternalContent] = useState(content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setInternalContent(content);
  }, [content]);

  // This effect simulates the adaptive nature of the editor.
  // In a real CodeMirror implementation, we would dynamically load extensions here.
  useEffect(() => {
    console.log(`Editor mode changed to: ${mode}.`);
    if (mode === EditorMode.FULL) {
      console.log("-> Initializing advanced features: autocompletion, linting, etc.");
    } else {
      console.log("-> Using lightweight setup for maximum performance.");
    }
  }, [mode]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInternalContent(e.target.value);
    onChange(e.target.value);
  };
  
  const handleSelection = () => {
      const textarea = textareaRef.current;
      if (textarea) {
          const selectedText = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
          if (selectedText) {
              onSelectionChange(selectedText);
          }
      }
  };


  return (
    <div className="relative w-full h-full bg-[#1e1e1e] flex flex-col">
      <div className="absolute top-2 right-4 z-10 bg-gray-900/80 px-2 py-1 rounded-md text-xs text-cyan-400 border border-cyan-400/30">
        {/*
          This is where you would integrate CodeMirror.
          The div below would be the target for the CodeMirror instance.
        */}
        Mode: {mode}
      </div>
      <textarea
        ref={textareaRef}
        value={internalContent}
        onChange={handleTextChange}
        onSelect={handleSelection}
        spellCheck="false"
        autoCorrect="off"
        autoCapitalize="off"
        className="w-full h-full p-4 font-mono text-base bg-transparent resize-none focus:outline-none leading-relaxed text-gray-300"
        placeholder="// Select a file from the explorer to begin editing..."
      />
      <div className="p-4 text-gray-500 text-sm border-t border-gray-700/50">
        <h3 className="font-bold text-gray-400">How to integrate CodeMirror:</h3>
        <p className="font-mono text-xs mt-2">
          1. Install CodeMirror packages: `npm install @codemirror/state @codemirror/view @codemirror/lang-javascript ...`
          <br/>
          2. Create a `ref` for a `div` element instead of using this `textarea`.
          <br/>
          3. In a `useEffect`, initialize `EditorView` with `EditorState`.
          <br/>
          4. Conditionally push extensions (e.g., `autocompletion()`) to your configuration array based on the `mode` prop.
        </p>
      </div>
    </div>
  );
};

export default Editor;
