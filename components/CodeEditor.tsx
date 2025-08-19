
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { File, Theme } from '../types';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark, atomOneLight } from 'react-syntax-highlighter/dist/esm/styles/hljs';

interface CodeEditorProps {
  file: File;
  onCodeChange: (fileId: string, newContent: string) => void;
  theme: Theme;
}

interface Cursor {
  line: number;
  column: number;
  id: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ file, onCodeChange, theme }) => {
  const [code, setCode] = useState(file.content);
  const [cursors, setCursors] = useState<Cursor[]>([{ line: 0, column: 0, id: 'primary' }]);
  const [activeCursor, setActiveCursor] = useState<string>('primary');
  const [foldedLines, setFoldedLines] = useState<Set<number>>(new Set());
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Common programming keywords for autocomplete
  const commonKeywords = [
    'function', 'const', 'let', 'var', 'if', 'else', 'for', 'while', 'return', 'import', 'export',
    'class', 'interface', 'type', 'enum', 'try', 'catch', 'finally', 'throw', 'new', 'this',
    'super', 'extends', 'implements', 'static', 'async', 'await', 'Promise', 'Array', 'Object',
    'String', 'Number', 'Boolean', 'null', 'undefined', 'true', 'false'
  ];

  const languageSpecificKeywords: Record<string, string[]> = {
    typescript: ['React', 'useState', 'useEffect', 'useCallback', 'useMemo', 'useRef', 'FC'],
    javascript: ['console', 'setTimeout', 'setInterval', 'fetch', 'localStorage', 'sessionStorage'],
    css: ['display', 'position', 'margin', 'padding', 'border', 'background', 'color', 'font'],
    html: ['div', 'span', 'p', 'h1', 'h2', 'h3', 'button', 'input', 'form', 'img', 'a']
  };

  const getKeywords = useCallback(() => {
    const baseKeywords = [...commonKeywords];
    const langKeywords = languageSpecificKeywords[file.language] || [];
    return [...baseKeywords, ...langKeywords];
  }, [file.language]);

  const getSuggestions = useCallback((input: string) => {
    if (!input.trim()) return [];
    const keywords = getKeywords();
    return keywords.filter(keyword => 
      keyword.toLowerCase().includes(input.toLowerCase())
    ).slice(0, 10);
  }, [getKeywords]);

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    setCode(newCode);
    onCodeChange(file.id, newCode);
    
    // Check for autocomplete trigger
    const cursorPos = e.currentTarget.selectionStart;
    const beforeCursor = newCode.substring(0, cursorPos);
    const lastWord = beforeCursor.split(/\s+/).pop() || '';
    
    if (lastWord.length >= 2) {
      const suggestions = getSuggestions(lastWord);
      if (suggestions.length > 0) {
        setSuggestions(suggestions);
        setShowSuggestions(true);
        setSuggestionIndex(0);
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const syncScroll = useCallback(() => {
    if (textareaRef.current && preRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const { selectionStart, selectionEnd, value } = e.currentTarget;
      const newCode = `${value.substring(0, selectionStart)}\t${value.substring(selectionEnd)}`;
      setCode(newCode);
      onCodeChange(file.id, newCode);
      
      setTimeout(() => {
        if(textareaRef.current) {
            textareaRef.current.selectionStart = textareaRef.current.selectionEnd = selectionStart + 1;
        }
      }, 0);
    } else if (e.key === 'Enter' && showSuggestions) {
      e.preventDefault();
      if (suggestions.length > 0) {
        const selectedSuggestion = suggestions[suggestionIndex];
        insertSuggestion(selectedSuggestion);
      }
    } else if (e.key === 'ArrowDown' && showSuggestions) {
      e.preventDefault();
      setSuggestionIndex(prev => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp' && showSuggestions) {
      e.preventDefault();
      setSuggestionIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    } else if (e.ctrlKey || e.metaKey) {
      if (e.key === 'd') {
        e.preventDefault();
        duplicateLine();
      } else if (e.key === 'k') {
        e.preventDefault();
        deleteLine();
      } else if (e.key === 'l') {
        e.preventDefault();
        selectLine();
      }
    }
  };

  const insertSuggestion = (suggestion: string) => {
    if (!textareaRef.current) return;
    
    const { selectionStart, selectionEnd, value } = textareaRef.current;
    const beforeCursor = value.substring(0, selectionStart);
    const afterCursor = value.substring(selectionEnd);
    
    // Find the start of the current word
    const wordStart = beforeCursor.lastIndexOf(' ') + 1;
    const newCode = value.substring(0, wordStart) + suggestion + afterCursor;
    
    setCode(newCode);
    onCodeChange(file.id, newCode);
    
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = wordStart + suggestion.length;
        textareaRef.current.selectionStart = newCursorPos;
        textareaRef.current.selectionEnd = newCursorPos;
        textareaRef.current.focus();
      }
    }, 0);
    
    setShowSuggestions(false);
  };

  const duplicateLine = () => {
    if (!textareaRef.current) return;
    
    const { selectionStart, value } = textareaRef.current;
    const lines = value.split('\n');
    const currentLine = Math.floor(value.substring(0, selectionStart).split('\n').length - 1);
    
    const newLines = [...lines];
    newLines.splice(currentLine + 1, 0, lines[currentLine]);
    
    const newCode = newLines.join('\n');
    setCode(newCode);
    onCodeChange(file.id, newCode);
  };

  const deleteLine = () => {
    if (!textareaRef.current) return;
    
    const { selectionStart, value } = textareaRef.current;
    const lines = value.split('\n');
    const currentLine = Math.floor(value.substring(0, selectionStart).split('\n').length - 1);
    
    const newLines = lines.filter((_, index) => index !== currentLine);
    const newCode = newLines.join('\n');
    
    setCode(newCode);
    onCodeChange(file.id, newCode);
  };

  const selectLine = () => {
    if (!textareaRef.current) return;
    
    const { selectionStart, value } = textareaRef.current;
    const lines = value.split('\n');
    const currentLine = Math.floor(value.substring(0, selectionStart).split('\n').length - 1);
    
    const lineStart = lines.slice(0, currentLine).join('\n').length + (currentLine > 0 ? 1 : 0);
    const lineEnd = lineStart + lines[currentLine].length;
    
    textareaRef.current.selectionStart = lineStart;
    textareaRef.current.selectionEnd = lineEnd;
  };

  const toggleLineFold = (lineNumber: number) => {
    setFoldedLines(prev => {
      const newSet = new Set(prev);
      if (newSet.has(lineNumber)) {
        newSet.delete(lineNumber);
      } else {
        newSet.add(lineNumber);
      }
      return newSet;
    });
  };

  const isLineFolded = (lineNumber: number) => {
    return foldedLines.has(lineNumber);
  };

  const getFoldedContent = () => {
    const lines = code.split('\n');
    let result = '';
    let i = 0;
    
    while (i < lines.length) {
      if (isLineFolded(i)) {
        result += '// ... folded code ...\n';
        // Skip to the next non-folded line or end
        while (i < lines.length && isLineFolded(i)) {
          i++;
        }
      } else {
        result += lines[i] + '\n';
        i++;
      }
    }
    
    return result;
  };

  const handleClick = (e: React.MouseEvent<HTMLPreElement>) => {
    if (!textareaRef.current) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate line and column from click position
    const lineHeight = 20; // Approximate line height
    const charWidth = 8; // Approximate character width
    
    const line = Math.floor(y / lineHeight);
    const column = Math.floor(x / charWidth);
    
    // Set cursor position
    const lines = code.split('\n');
    let charIndex = 0;
    for (let i = 0; i < line && i < lines.length; i++) {
      charIndex += lines[i].length + 1; // +1 for newline
    }
    charIndex += Math.min(column, lines[line]?.length || 0);
    
    textareaRef.current.selectionStart = charIndex;
    textareaRef.current.selectionEnd = charIndex;
    textareaRef.current.focus();
  };

  useEffect(() => {
    if (showSuggestions && suggestionsRef.current) {
      suggestionsRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [showSuggestions, suggestionIndex]);

  const codeStyle = theme === 'dark' ? atomOneDark : atomOneLight;
  const caretColor = theme === 'dark' ? 'white' : 'black';

  return (
    <div className="relative h-full w-full font-mono text-sm">
      <textarea
        ref={textareaRef}
        value={code}
        onChange={handleCodeChange}
        onScroll={syncScroll}
        onKeyDown={handleKeyDown}
        spellCheck="false"
        className="absolute top-0 left-0 w-full h-full p-2.5 box-border resize-none border-none bg-transparent outline-none text-transparent leading-relaxed tracking-wide"
        style={{
          caretColor: theme === 'dark' ? '#ffffff' : '#000000',
          fontFamily: 'inherit',
          fontSize: 'inherit',
          lineHeight: 'inherit',
          letterSpacing: 'inherit',
          paddingLeft: '45px' // Space for line numbers
        }}
        aria-label={`Code editor for ${file.name}`}
      />
      
      <SyntaxHighlighter
        language={file.language}
        style={codeStyle}
        showLineNumbers
        wrapLines={true}
        customStyle={{
          width: '100%',
          height: '100%',
          margin: 0,
          padding: '10px',
          boxSizing: 'border-box',
          backgroundColor: theme === 'dark' ? '#1e1e1e' : '#f5f5f5',
          fontFamily: 'inherit',
          fontSize: 'inherit',
          lineHeight: 'inherit',
          letterSpacing: 'inherit',
          cursor: 'text',
        }}
        lineNumberStyle={{
          minWidth: '30px',
          paddingRight: '15px',
          textAlign: 'right',
          opacity: 0.5,
          userSelect: 'none',
        }}
        ref={preRef as any}
        onClick={handleClick}
      >
        {getFoldedContent()}
      </SyntaxHighlighter>

      {/* Autocomplete Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute bg-light-bg dark:bg-dark-bg border border-dark-accent/30 rounded-md shadow-lg max-h-48 overflow-y-auto z-10"
          style={{
            top: '50px',
            left: '45px',
            minWidth: '200px'
          }}
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion}
              className={`px-3 py-2 cursor-pointer hover:bg-dark-accent/20 ${
                index === suggestionIndex ? 'bg-dark-accent/30' : ''
              }`}
              onClick={() => insertSuggestion(suggestion)}
            >
              <span className="text-dark-text dark:text-dark-text">{suggestion}</span>
            </div>
          ))}
        </div>
      )}

      {/* Line Folding Controls */}
      <div className="absolute left-2 top-0 h-full pointer-events-none">
        {code.split('\n').map((line, index) => {
          const isFolded = isLineFolded(index);
          const hasContent = line.trim().length > 0;
          
          if (!hasContent) return <div key={index} className="h-5" />;
          
          return (
            <button
              key={index}
              onClick={() => toggleLineFold(index)}
              className={`w-4 h-5 flex items-center justify-center text-xs text-dark-text-alt hover:text-dark-text transition-colors pointer-events-auto ${
                isFolded ? 'opacity-50' : ''
              }`}
              title={isFolded ? 'Expand line' : 'Collapse line'}
            >
              {isFolded ? '▶' : '▼'}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CodeEditor;