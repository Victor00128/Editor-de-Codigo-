
import React from 'react';
import { EditorMode, OpenFile } from '../types';
import TabsBar from './TabsBar';
import Editor from './Editor';

interface MainContentProps {
  openFiles: OpenFile[];
  activeFile: OpenFile | undefined;
  activeFileId: string | null;
  onTabClick: (fileId: string) => void;
  onTabClose: (fileId: string) => void;
  onFileContentChange: (fileId: string, newContent: string) => void;
  onSelectionChange: (selectedText: string) => void;
  editorMode: EditorMode;
}

const MainContent: React.FC<MainContentProps> = ({
  openFiles,
  activeFile,
  activeFileId,
  onTabClick,
  onTabClose,
  onFileContentChange,
  onSelectionChange,
  editorMode
}) => {
  return (
    <main className="flex-1 flex flex-col bg-[#1e1e1e]">
      <TabsBar 
        openFiles={openFiles} 
        activeFileId={activeFileId} 
        onTabClick={onTabClick} 
        onTabClose={onTabClose}
      />
      <div className="flex-1 overflow-hidden">
        <Editor
          key={activeFile?.id || 'empty'}
          content={activeFile?.content || ''}
          onChange={(newContent) => {
            if (activeFile) {
              onFileContentChange(activeFile.id, newContent);
            }
          }}
          onSelectionChange={onSelectionChange}
          mode={editorMode}
        />
      </div>
    </main>
  );
};

export default MainContent;
