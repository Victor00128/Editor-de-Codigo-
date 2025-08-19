import { describe, it, expect } from 'vitest';
import {
  insertTabAtSelection,
  duplicateLineAtIndex,
  deleteLineAtIndex,
  getLineSelectionRange,
  replaceInText,
  buildSearchPattern
} from '../utils/editorText';

describe('editorText utilities', () => {
  it('insertTabAtSelection inserts a tab and updates cursor', () => {
    const value = 'abc';
    const res = insertTabAtSelection(value, 1, 1);
    expect(res.newValue).toBe('a\tbc');
    expect(res.newCursorPosition).toBe(2);
  });

  it('duplicateLineAtIndex duplicates the current line', () => {
    const value = 'l1\nl2\nl3';
    const selectionStart = 3; // in l2
    const res = duplicateLineAtIndex(value, selectionStart);
    expect(res).toBe('l1\nl2\nl2\nl3');
  });

  it('deleteLineAtIndex deletes the current line', () => {
    const value = 'l1\nl2\nl3';
    const selectionStart = 3; // in l2
    const res = deleteLineAtIndex(value, selectionStart);
    expect(res).toBe('l1\nl3');
  });

  it('getLineSelectionRange returns correct range', () => {
    const value = 'foo\nbarbaz\nqux';
    const selectionStart = 5; // inside second line
    const { start, end } = getLineSelectionRange(value, selectionStart);
    expect(value.slice(start, end)).toBe('barbaz');
  });

  it('replaceInText plain substring, case-insensitive, replaces all occurrences', () => {
    const value = 'Hello hello HeLLo';
    const res = replaceInText(value, 'hello', 'hi', { useRegex: false, caseSensitive: false, wholeWord: false });
    expect(res).toBe('hi hi hi');
  });

  it('replaceInText whole word only', () => {
    const value = 'foo foobar foo barfoo';
    const res = replaceInText(value, 'foo', 'X', { useRegex: false, caseSensitive: true, wholeWord: true });
    expect(res).toBe('X foobar X barfoo');
  });

  it('buildSearchPattern respects regex option', () => {
    const pattern = buildSearchPattern('f.o', { useRegex: true, caseSensitive: false, wholeWord: false });
    expect('foo'.match(pattern)).not.toBeNull();
  });
});