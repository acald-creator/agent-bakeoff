/**
 * persistence.test.ts — Vitest unit tests for the localStorage persistence codec.
 *
 * Tests the pure codec functions in src/lib/persistence.ts.
 * Uses a mock localStorage to avoid coupling to the DOM environment.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  persistNote,
  loadNoteBody,
  loadAllNotes,
  deleteNote,
  type NotePayload,
} from '../lib/persistence';

// ─── localStorage mock ────────────────────────────────────────────────────────
// jsdom provides a basic localStorage, but we mock explicitly to control failure cases.

const mockStorage: Record<string, string> = {};

beforeEach(() => {
  // Clear storage before each test
  Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => mockStorage[key] ?? null);
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key, value) => { mockStorage[key] = value; });
  vi.spyOn(Storage.prototype, 'removeItem').mockImplementation((key) => { delete mockStorage[key]; });
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('persistNote + loadNoteBody (roundtrip)', () => {
  it('saves and retrieves a note body', () => {
    const payload: NotePayload = { title: 'Test Note', body: '# Hello\n\nWorld', updatedAt: 1000 };
    persistNote('note-1', payload);
    expect(loadNoteBody('note-1')).toBe('# Hello\n\nWorld');
  });

  it('returns empty string for unknown id', () => {
    expect(loadNoteBody('does-not-exist')).toBe('');
  });

  it('updates body on second save', () => {
    persistNote('note-1', { title: 'A', body: 'first', updatedAt: 1 });
    persistNote('note-1', { title: 'A', body: 'second', updatedAt: 2 });
    expect(loadNoteBody('note-1')).toBe('second');
  });
});

describe('loadAllNotes', () => {
  it('returns empty array when no notes exist', () => {
    expect(loadAllNotes()).toEqual([]);
  });

  it('returns all persisted notes', () => {
    persistNote('a', { title: 'A', body: 'body a', updatedAt: 2 });
    persistNote('b', { title: 'B', body: 'body b', updatedAt: 1 });
    const notes = loadAllNotes();
    expect(notes).toHaveLength(2);
  });

  it('sorts notes by updatedAt descending (most recent first)', () => {
    persistNote('old', { title: 'Old', body: '', updatedAt: 1000 });
    persistNote('new', { title: 'New', body: '', updatedAt: 9000 });
    const notes = loadAllNotes();
    expect(notes[0]?.id).toBe('new');
    expect(notes[1]?.id).toBe('old');
  });

  it('includes snippet (first 120 chars of body, newlines collapsed)', () => {
    persistNote('x', { title: 'X', body: 'Line one\nLine two', updatedAt: 1 });
    const notes = loadAllNotes();
    expect(notes[0]?.snippet).toBe('Line one Line two');
  });

  it('truncates snippet to 120 chars', () => {
    const longBody = 'a'.repeat(200);
    persistNote('long', { title: 'Long', body: longBody, updatedAt: 1 });
    const notes = loadAllNotes();
    expect(notes[0]?.snippet?.length).toBe(120);
  });
});

describe('deleteNote', () => {
  it('removes the note from loadAllNotes after deletion', () => {
    persistNote('del', { title: 'Delete me', body: 'content', updatedAt: 1 });
    expect(loadAllNotes()).toHaveLength(1);
    deleteNote('del');
    expect(loadAllNotes()).toHaveLength(0);
  });

  it('returns empty string for deleted note body', () => {
    persistNote('gone', { title: 'Gone', body: 'content', updatedAt: 1 });
    deleteNote('gone');
    expect(loadNoteBody('gone')).toBe('');
  });

  it('does not throw when deleting a non-existent note', () => {
    expect(() => deleteNote('phantom')).not.toThrow();
  });
});
