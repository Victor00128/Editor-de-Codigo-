export enum ActivityBarView {
  EXPLORER = 'EXPLORER',
  SEARCH = 'SEARCH',
  GIT = 'GIT',
  DEBUG = 'DEBUG',
  EXTENSIONS = 'EXTENSIONS',
}

export type Theme = 'light' | 'dark';

export type GitStatus = 'M' | 'A' | 'U' | null;

export type SupportedLanguage = 'html' | 'css' | 'javascript' | 'json' | 'typescript' | 'markdown';

export interface File {
  id: string;
  type: 'file';
  name: string;
  language: SupportedLanguage;
  content: string;
  gitStatus?: GitStatus;
  isDirty?: boolean;
}

export interface Folder {
  id: string;
  type: 'folder';
  name:string;
  children: FileSystemNode[];
}

export type FileSystemNode = File | Folder;

export interface Extension {
  id: string;
  name: string;
  publisher: string;
  description: string;
  installs: string;
}

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

export interface TerminalHistoryLine {
  id: number;
  type: 'input' | 'output';
  content: React.ReactNode;
}

export interface ContextMenuData {
  x: number;
  y: number;
  node: FileSystemNode;
}

export interface Command {
  id: string;
  label: string;
  action: () => void;
  keywords?: string;
}