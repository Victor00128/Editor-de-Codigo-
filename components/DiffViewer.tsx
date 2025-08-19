
import React from 'react';
import { Theme } from '../types';
import { diffLines, Change } from 'diff';

interface DiffViewerProps {
  oldContent: string;
  newContent: string;
  fileName: string;
  theme: Theme;
}

const generateDiff = (oldStr: string, newStr: string) => {
    const changes: Change[] = diffLines(oldStr, newStr);
    const diff: { type: 'common' | 'add' | 'del', content: string }[] = [];
    changes.forEach(change => {
        const lines = change.value.split('\n');
        const normalized = lines[lines.length - 1] === '' ? lines.slice(0, -1) : lines;
        normalized.forEach(line => {
            if (change.added) {
                diff.push({ type: 'add', content: line });
            } else if (change.removed) {
                diff.push({ type: 'del', content: line });
            } else {
                diff.push({ type: 'common', content: line });
            }
        });
    });
    return diff;
};

const DiffViewer: React.FC<DiffViewerProps> = ({ oldContent, newContent, fileName, theme }) => {
    const diffs = React.useMemo(() => generateDiff(oldContent, newContent), [oldContent, newContent]);
    
    const bgColor = theme === 'dark' ? '#1e1e1e' : '#fafafa';
    const addColor = theme === 'dark' ? 'rgba(22, 74, 45, 0.5)' : '#e6ffed';
    const delColor = theme === 'dark' ? 'rgba(92, 26, 26, 0.5)' : '#ffebe9';
    const addTextColor = theme === 'dark' ? '#57d682' : '#22863a';
    const delTextColor = theme === 'dark' ? '#ff8179' : '#b31d1d';
    const commonTextColor = theme === 'dark' ? '#cccccc' : '#24292e';
    const lineNumColor = theme === 'dark' ? 'rgba(204, 204, 204, 0.5)' : 'rgba(27, 31, 35, 0.3)';

    let oldLineNum = 1;
    let newLineNum = 1;

    return (
        <div className="h-full w-full bg-light-bg-alt dark:bg-dark-bg p-4 overflow-auto">
            <h2 className="text-lg font-bold mb-2">Diff: {fileName}</h2>
            <div
                className="font-mono text-sm p-2 rounded whitespace-pre-wrap"
                style={{ backgroundColor: bgColor }}
                aria-label={`Diff view for ${fileName}`}
            >
                {diffs.map((line, index) => {
                    let backgroundColor: string | undefined;
                    let prefix: string;
                    let currentOldLine: number | null = null;
                    let currentNewLine: number | null = null;
                    let textColor = commonTextColor;

                    switch (line.type) {
                        case 'add':
                            backgroundColor = addColor;
                            prefix = '+';
                            textColor = addTextColor;
                            currentNewLine = newLineNum++;
                            break;
                        case 'del':
                            backgroundColor = delColor;
                            prefix = '-';
                            textColor = delTextColor;
                            currentOldLine = oldLineNum++;
                            break;
                        default:
                            backgroundColor = undefined;
                            prefix = ' ';
                            currentOldLine = oldLineNum++;
                            currentNewLine = newLineNum++;
                            break;
                    }
                    
                    return (
                        <div key={index} style={{ backgroundColor }} className="flex w-full leading-relaxed">
                           <span style={{ color: lineNumColor, userSelect: 'none', width: '45px', display: 'inline-block', textAlign: 'right', flexShrink: 0, paddingRight: '10px' }}>
                               {currentOldLine}
                           </span>
                           <span style={{ color: lineNumColor, userSelect: 'none', width: '45px', display: 'inline-block', textAlign: 'right', flexShrink: 0, paddingRight: '10px' }}>
                               {currentNewLine}
                           </span>
                           <span className="flex-grow" style={{ color: textColor, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                             <span style={{userSelect: 'none', width: '2ch', display: 'inline-block', textAlign: 'center', flexShrink: 0}}>{prefix}</span>
                             <span style={{ paddingLeft: '5px' }}>{line.content || ' '}</span>
                           </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default DiffViewer;