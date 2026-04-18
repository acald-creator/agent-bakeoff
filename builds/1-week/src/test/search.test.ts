/**
 * search.test.ts — Vitest unit tests for pure search/filter utilities.
 *
 * These test the functions in src/lib/search.ts.
 * Pure functions — no DOM, no Solid, no localStorage.
 */
import { describe, it, expect } from 'vitest';
import { filterNotes, noteMatchesQuery, extractTitle } from '../lib/search';

describe('filterNotes', () => {
  const notes = [
    { id: '1', title: 'Shopping list',  snippet: 'Milk, eggs, bread',      updatedAt: 1 },
    { id: '2', title: 'Meeting notes',  snippet: 'Project status update',  updatedAt: 2 },
    { id: '3', title: 'Recipe ideas',   snippet: 'Pasta carbonara...',     updatedAt: 3 },
    { id: '4', title: 'Untitled',       snippet: '',                        updatedAt: 4 },
  ];

  it('returns all notes when query is empty', () => {
    expect(filterNotes(notes, '')).toHaveLength(4);
  });

  it('returns all notes when query is only whitespace', () => {
    expect(filterNotes(notes, '   ')).toHaveLength(4);
  });

  it('filters by title (case-insensitive)', () => {
    const result = filterNotes(notes, 'meeting');
    expect(result).toHaveLength(1);
    expect(result[0]?.title).toBe('Meeting notes');
  });

  it('filters by snippet content', () => {
    const result = filterNotes(notes, 'carbonara');
    expect(result).toHaveLength(1);
    expect(result[0]?.title).toBe('Recipe ideas');
  });

  it('is case-insensitive on both query and title', () => {
    expect(filterNotes(notes, 'MILK')).toHaveLength(1);
    expect(filterNotes(notes, 'SHOPPING')).toHaveLength(1);
  });

  it('returns empty array when no matches', () => {
    expect(filterNotes(notes, 'zzz_no_match')).toHaveLength(0);
  });

  it('matches partial substrings', () => {
    // "list" matches "Shopping list"
    expect(filterNotes(notes, 'list')).toHaveLength(1);
  });

  it('matches multiple notes when query matches both', () => {
    // "notes" matches "Meeting notes"; it's in no snippet
    expect(filterNotes(notes, 'notes')).toHaveLength(1);
  });

  it('preserves original array reference when no filter applied', () => {
    const result = filterNotes(notes, '');
    expect(result).toBe(notes);  // Same reference — no copy needed
  });
});

describe('noteMatchesQuery', () => {
  it('always matches when query is empty', () => {
    expect(noteMatchesQuery({ title: 'Test', snippet: '' }, '')).toBe(true);
  });

  it('matches title', () => {
    expect(noteMatchesQuery({ title: 'Hello world', snippet: '' }, 'hello')).toBe(true);
  });

  it('matches snippet', () => {
    expect(noteMatchesQuery({ title: 'Test', snippet: 'foobar' }, 'foo')).toBe(true);
  });

  it('returns false for no match', () => {
    expect(noteMatchesQuery({ title: 'Test', snippet: '' }, 'xyz')).toBe(false);
  });
});

describe('extractTitle', () => {
  it('returns first line stripped of # markers', () => {
    expect(extractTitle('# Hello\n\nBody text')).toBe('Hello');
  });

  it('handles ## and ###', () => {
    expect(extractTitle('## My Title\nContent')).toBe('My Title');
    expect(extractTitle('### Deep Header')).toBe('Deep Header');
  });

  it('returns first non-empty line if no heading marker', () => {
    expect(extractTitle('\n\nPlain text')).toBe('Plain text');
  });

  it('returns Untitled for empty body', () => {
    expect(extractTitle('')).toBe('Untitled');
    expect(extractTitle('   ')).toBe('Untitled');
  });

  it('handles body with only whitespace lines', () => {
    expect(extractTitle('\n\n\n')).toBe('Untitled');
  });

  it('trims whitespace from extracted title', () => {
    expect(extractTitle('#   Padded Title   ')).toBe('Padded Title');
  });
});
