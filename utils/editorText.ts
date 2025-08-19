export interface InsertTabResult {
  newValue: string;
  newCursorPosition: number;
}

export const insertTabAtSelection = (
  value: string,
  selectionStart: number,
  selectionEnd: number
): InsertTabResult => {
  const before = value.substring(0, selectionStart);
  const after = value.substring(selectionEnd);
  const newValue = `${before}\t${after}`;
  return {
    newValue,
    newCursorPosition: selectionStart + 1,
  };
};

export const getCurrentLineIndex = (value: string, selectionStart: number): number => {
  // Count how many newlines are before selectionStart
  return value.substring(0, selectionStart).split('\n').length - 1;
};

export const duplicateLineAtIndex = (value: string, selectionStart: number): string => {
  const lines = value.split('\n');
  const currentLineIndex = getCurrentLineIndex(value, selectionStart);
  const newLines = [...lines];
  newLines.splice(currentLineIndex + 1, 0, lines[currentLineIndex] ?? '');
  return newLines.join('\n');
};

export const deleteLineAtIndex = (value: string, selectionStart: number): string => {
  const lines = value.split('\n');
  const currentLineIndex = getCurrentLineIndex(value, selectionStart);
  const newLines = lines.filter((_, index) => index !== currentLineIndex);
  return newLines.join('\n');
};

export interface LineRange {
  start: number;
  end: number;
}

export const getLineSelectionRange = (value: string, selectionStart: number): LineRange => {
  const lines = value.split('\n');
  const currentLineIndex = getCurrentLineIndex(value, selectionStart);
  const lineStart = lines.slice(0, currentLineIndex).join('\n').length + (currentLineIndex > 0 ? 1 : 0);
  const lineEnd = lineStart + (lines[currentLineIndex]?.length ?? 0);
  return { start: lineStart, end: lineEnd };
};

export interface ReplaceOptions {
  useRegex: boolean;
  caseSensitive: boolean;
  wholeWord: boolean;
}

export const buildSearchPattern = (term: string, options: ReplaceOptions): RegExp => {
  const flags = options.caseSensitive ? 'g' : 'gi';
  if (options.useRegex) {
    return new RegExp(term, flags);
  }
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const bounded = options.wholeWord ? `\\b${escaped}\\b` : escaped;
  return new RegExp(bounded, flags);
};

export const replaceInText = (
  value: string,
  term: string,
  replacement: string,
  options: ReplaceOptions
): string => {
  if (!term) return value;
  const pattern = buildSearchPattern(term, options);
  return value.replace(pattern, replacement);
};

