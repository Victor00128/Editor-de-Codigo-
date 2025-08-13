
import React, { useState, useEffect, useCallback } from 'react';
import { EditorMode, FileTreeNode, OpenFile } from './types';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import StatusBar from './components/StatusBar';
import Terminal from './components/Terminal';
import GeminiPanel from './components/GeminiPanel';

// Mock file system data
const mockFileTree: FileTreeNode = {
  id: 'root',
  name: 'flux-project',
  type: 'folder',
  children: [
    {
      id: '1',
      name: 'README.md',
      type: 'file',
      content: '# Flux IDE Project\n\nWelcome to your new project!',
    },
    {
      id: '2',
      name: 'src',
      type: 'folder',
      children: [
        {
          id: '3',
          name: 'index.js',
          type: 'file',
          content: "console.log('Hello, Flux IDE!');",
        },
        {
          id: '4',
          name: 'styles.css',
          type: 'file',
          content: 'body {\n  background-color: #282c34;\n}',
        },
        {
            id: '5',
            name: 'components',
            type: 'folder',
            children: [
                {
                    id: '6',
                    name: 'Button.jsx',
                    type: 'file',
                    content: `import React from 'react';

const Button = ({ children }) => {
    return <button>{children}</button>;
}

export default Button;`
                }
            ]
        }
      ],
    },
  ],
};

const App: React.FC = () => {
  const [editorMode, setEditorMode] = useState<EditorMode>(EditorMode.LIGHT);
  const [openFiles, setOpenFiles] = useState<OpenFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [isTerminalVisible, setTerminalVisible] = useState(false);
  const [isAIPanelVisible, setAIPanelVisible] = useState(false);
  const [selectedText, setSelectedText] = useState('');

  // Auto-detect system resources to set initial mode
  useEffect(() => {
    // This is a simplified heuristic. A real app might use more robust detection.
    // `navigator.deviceMemory` is experimental and might not be available.
    const memory = (navigator as any).deviceMemory || 2; // GB
    const cores = navigator.hardwareConcurrency || 4;

    if (memory >= 8 && cores >= 4) {
      setEditorMode(EditorMode.FULL);
      console.log('High-performance system detected. Starting in Full Mode.');
    } else {
      setEditorMode(EditorMode.LIGHT);
      console.log('Low-resource system detected. Starting in Light Mode for best performance.');
    }
  }, []);

  const handleFileSelect = useCallback((file: FileTreeNode) => {
    if (file.type === 'file') {
      const isAlreadyOpen = openFiles.some(f => f.id === file.id);
      if (!isAlreadyOpen) {
        setOpenFiles(prev => [...prev, { id: file.id, name: file.name, content: file.content || '' }]);
      }
      setActiveFileId(file.id);
    }
  }, [openFiles]);

  const handleTabClick = (fileId: string) => {
    setActiveFileId(fileId);
  };
  
  const handleTabClose = (fileId: string) => {
    setOpenFiles(prev => {
        const newOpenFiles = prev.filter(f => f.id !== fileId);
        if (activeFileId === fileId) {
            setActiveFileId(newOpenFiles.length > 0 ? newOpenFiles[0].id : null);
        }
        return newOpenFiles;
    });
  };

  const handleFileContentChange = (fileId: string, newContent: string) => {
    setOpenFiles(prev =>
      prev.map(file =>
        file.id === fileId ? { ...file, content: newContent } : file
      )
    );
  };

  const activeFile = openFiles.find(f => f.id === activeFileId);

  return (
    <div className="h-screen w-screen bg-gray-900 flex flex-col overflow-hidden">
      <div className="flex-1 flex flex-row overflow-hidden">
        <Sidebar 
          isVisible={true} 
          fileTree={mockFileTree} 
          onFileSelect={handleFileSelect} 
        />
        <MainContent
          openFiles={openFiles}
          activeFile={activeFile}
          activeFileId={activeFileId}
          onTabClick={handleTabClick}
          onTabClose={handleTabClose}
          onFileContentChange={handleFileContentChange}
          onSelectionChange={setSelectedText}
          editorMode={editorMode}
        />
        <GeminiPanel 
            isVisible={isAIPanelVisible} 
            selectedText={selectedText}
            onClose={() => setAIPanelVisible(false)}
        />
      </div>
      <Terminal isVisible={isTerminalVisible} onClose={() => setTerminalVisible(false)} />
      <StatusBar
        mode={editorMode}
        onModeChange={setEditorMode}
        onTerminalToggle={() => setTerminalVisible(v => !v)}
        onAIPanelToggle={() => setAIPanelVisible(v => !v)}
      />
    </div>
  );
};

export default App;
