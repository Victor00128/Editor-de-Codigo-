
import { FileSystemNode, Extension } from './types';

export const initialFileSystem: FileSystemNode[] = [
  {
    id: '1',
    type: 'folder',
    name: 'src',
    children: [
      {
        id: '2',
        type: 'folder',
        name: 'components',
        children: [
          {
            id: '3',
            type: 'file',
            name: 'Button.tsx',
            language: 'typescript',
            content: `import React from 'react';\n\nconst Button = () => <button>Click Me</button>;\n\nexport default Button;`,
            gitStatus: 'A',
          },
        ],
      },
      {
        id: '4',
        type: 'file',
        name: 'App.tsx',
        language: 'typescript',
        content: `import React from 'react';\n\nfunction App() {\n  return <h1>Hello, Nexus Code!</h1>;\n}`,
        gitStatus: 'M',
      },
       {
        id: '5',
        type: 'file',
        name: 'styles.css',
        language: 'css',
        content: `body {\n  font-family: sans-serif;\n  background-color: #1e1e1e;\n}`,
      },
    ],
  },
  {
    id: '6',
    type: 'folder',
    name: 'public',
    children: [
        { id: '7', type: 'file', name: 'index.html', language: 'html', content: `<!DOCTYPE html>\n<html>\n<body>\n  <h1>Nexus Code</h1>\n</body>\n</html>`, gitStatus: 'U' }
    ],
  },
  {
    id: '8',
    type: 'file',
    name: 'package.json',
    language: 'json',
    content: `{\n  "name": "nexus-code",\n  "version": "0.1.0",\n  "private": true\n}`,
  },
  {
    id: '9',
    type: 'file',
    name: 'README.md',
    language: 'markdown',
    content: `# Nexus Code\n\nA lightweight code editor built with React and Tailwind CSS.`,
  }
];

export const mockExtensions: Extension[] = [
    { id: 'ext1', name: 'Prettier - Code formatter', publisher: 'Prettier', description: 'An opinionated code formatter.', installs: '25.4M' },
    { id: 'ext2', name: 'ESLint', publisher: 'Microsoft', description: 'Integrates ESLint JavaScript into VS Code.', installs: '22.1M' },
    { id: 'ext3', name: 'Live Server', publisher: 'Ritwick Dey', description: 'Launch a development local Server with live reload feature.', installs: '21.5M' },
    { id: 'ext4', name: 'GitLens — Git supercharged', publisher: 'GitKraken', description: 'Supercharge the Git capabilities built into Nexus Code.', installs: '18.9M' },
];
