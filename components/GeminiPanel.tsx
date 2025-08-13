
import React, { useState, useEffect } from 'react';
import { explainCode } from '../services/geminiService';
import SparklesIcon from './icons/SparklesIcon';
import CloseIcon from './icons/CloseIcon';

interface GeminiPanelProps {
  isVisible: boolean;
  selectedText: string;
  onClose: () => void;
}

const GeminiPanel: React.FC<GeminiPanelProps> = ({ isVisible, selectedText, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [lastQueriedText, setLastQueriedText] = useState('');

  useEffect(() => {
    if (!isVisible) {
      // Reset when panel is closed
      setExplanation('');
      setLastQueriedText('');
    }
  }, [isVisible]);

  const handleExplainClick = async () => {
    if (!selectedText || isLoading || selectedText === lastQueriedText) return;
    setIsLoading(true);
    setExplanation('');
    setLastQueriedText(selectedText);
    const result = await explainCode(selectedText);
    setExplanation(result);
    setIsLoading(false);
  };

  if (!isVisible) return null;

  return (
    <aside className="w-80 bg-gray-800/80 border-l border-gray-700/50 flex flex-col shrink-0 backdrop-blur-sm">
      <div className="h-10 p-2 flex items-center justify-between border-b border-gray-700/50">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <SparklesIcon className="text-cyan-400" />
          AI Assistant
        </h2>
        <button onClick={onClose} className="p-1 rounded-md hover:bg-gray-600">
          <CloseIcon className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-grow p-3 flex flex-col gap-4 overflow-y-auto">
        <div>
          <label className="text-xs font-bold text-gray-400">Selected Code</label>
          <pre className="mt-1 p-2 bg-gray-900/50 rounded-md text-xs text-gray-300 max-h-32 overflow-auto font-mono">
            {selectedText || 'Select text in the editor...'}
          </pre>
        </div>
        <button
          onClick={handleExplainClick}
          disabled={!selectedText || isLoading || selectedText === lastQueriedText}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-md font-semibold transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-cyan-500"
        >
          {isLoading ? 'Thinking...' : 'Explain Code'}
        </button>
        <div className="flex-1 border-t border-gray-700/50 pt-3">
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <SparklesIcon className="w-8 h-8 animate-pulse" />
              <p className="mt-2">Generating explanation...</p>
            </div>
          )}
          {explanation && (
             <div className="prose prose-sm prose-invert max-w-none text-gray-300" dangerouslySetInnerHTML={{ __html: explanation.replace(/\n/g, '<br />').replace(/`([^`]+)`/g, '<code class="bg-gray-700 rounded px-1 py-0.5 font-mono">$1</code>') }}></div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default GeminiPanel;
