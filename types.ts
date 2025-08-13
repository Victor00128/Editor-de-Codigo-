
export enum EditorMode {
  LIGHT = 'LIGHT',
  FULL = 'FULL',
}

export interface FileTreeNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileTreeNode[];
  content?: string;
}

export interface OpenFile {
  id: string;
  name: string;
  content: string;
}
