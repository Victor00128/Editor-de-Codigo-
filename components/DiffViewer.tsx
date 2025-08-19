
import React from 'react';
import { Theme } from '../types';

interface DiffViewerProps {
  oldContent: string;
  newContent: string;
  fileName: string;
  theme: Theme;
}

const generateDiff = (oldStr: string, newStr: string) => {
    const oldLines = oldStr.split('\n');
    const newLines = newStr.split('\n');
    
    if (oldLines.length === 1 && oldLines[0] === '' && oldStr.length === 0) {
      return newLines.map(line => ({ type: 'add' as const, content: line }));
    }

    const dp = Array(oldLines.length + 1).fill(null).map(() => Array(newLines.length + 1).fill(0));

    for (let i = oldLines.length - 1; i >= 0; i--) {
        for (let j = newLines.length - 1; j >= 0; j--) {
            if (oldLines[i] === newLines[j]) {
                dp[i][j] = 1 + dp[i + 1][j + 1];
            } else {
                dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
            }
        }
    }

    const diff: { type: 'common' | 'add' | 'del', content: string }[] = [];
    let i = 0, j = 0;
    while (i < oldLines.length && j < newLines.length) {
        if (oldLines[i] === newLines[j]) {
            diff.push({ type: 'common', content: oldLines[i] });
            i++; j++;
        } else if (dp[i + 1][j] >= dp[i][j + 1]) {
            diff.push({ type: 'del', content: oldLines[i] });
            i++;
        } else {
            diff.push({ type: 'add', content: newLines[j] });
            j++;
        }
    }

    while (i < oldLines.length) {
        diff.push({ type: 'del', content: oldLines[i] });
        i++;
    }
    while (j < newLines.length) {
        diff.push({ type: 'add', content: newLines[j] });
        j++;
    }

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