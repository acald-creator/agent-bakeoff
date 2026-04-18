/**
 * persistence.test.ts — Unit tests for the localStorage codec.
 *
 * Uses vitest's built-in jsdom environment (configured in vitest.config.ts).
 * localStorage is available via jsdom; we clear it before each test.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  persistNote,
  loadNoteBody,
  loadAllNotes,
  deleteNote,
  noteKey,
  readIndex,
  type NotePayload,
} from '../lib/persistence';

beforeEach(() => {
  localStorage.clear();
});

// ─── persistNote / loadNoteBody ───────────────────────────────────────────────

describe('persistNote + loadNoteBody', () => {
  it('writes and reads back a note body', () => {
    const payload: NotePayload = {
      title:     'Test Note',
      body:      'Hello world',
      updatedAt: 1_700_000_000_000,
    };
    persistNote('note-1', payload);
    expect(loadNoteBody('note-1')).toBe('Hello world');
  });

  it('returns empty string for unknown id', () => {
    expect(loadNoteBody('non-existent-id')).toBe('');
  });

  it('updates the index with metadata', () => {
    const payload: NotePayload = {
      title:     'Index Test',
      body:      'First 120 chars become snippet',
      updatedAt: 1_700_000_000_001,
    };
    persistNote('note-2', payload);
    const index = readIndex();
    expect(index['note-2']).toBeDefined();
    expect(index['note-2'].title).toBe('Index Test');
    expect(index['note-2'].id).toBe('note-2');
    expect(index['note-2'].updatedAt).toBe(1_700_000_000_001);
  });

  it('snippet is max 120 chars with newlines collapsed', () => {
    const longBody = 'A'.repeat(200);
    persistNote('note-3', { title: 'Long', body: longBody, updatedAt: 0 });
    const index = readIndex();
    expect(index['note-3'].snippet.length).toBe(120);
  });

  it('collapses newlines in snippet', () => {
    const body = 'Line one\nLine two\nLine three';
    persistNote('note-4', { title: 'T', body, updatedAt: 0 });
    const index = readIndex();
    expect(index['note-4'].snippet).not.toContain('\n');
  });

  it('overwrites on re-persist', () => {
    persistNote('note-5', { title: 'v1', body: 'original', updatedAt: 1 });
    persistNote('note-5', { title: 'v2', body: 'updated',  updatedAt: 2 });
    expect(loadNoteBody('note-5')).toBe('updated');
    expect(readIndex()['note-5'].title).toBe('v2');
  });
});

// ─── loadAllNotes ─────────────────────────────────────────────────────────────

describe('loadAllNotes', () => {
  it('returns empty array when storage is empty', () => {
    expect(loadAllNotes()).toEqual([]);
  });

  it('returns notes sorted by updatedAt descending', () => {
    persistNote('a', { title: 'Oldest', body: '', updatedAt: 1_000 });
    persistNote('b', { title: 'Newest', body: '', updatedAt: 3_000 });
    persistNote('c', { title: 'Middle', body: '', updatedAt: 2_000 });

    const notes = loadAllNotes();
    expect(notes[0].title).toBe('Newest');
    expect(notes[1].title).toBe('Middle');
    expect(notes[2].title).toBe('Oldest');
  });

  it('returns all persisted notes', () => {
    for (let i = 0; i < 5; i++) {
      persistNote(`n${i}`, { title: `Note ${i}`, body: `body ${i}`, updatedAt: i });
    }
    expect(loadAllNotes()).toHaveLength(5);
  });
});

// ─── deleteNote ───────────────────────────────────────────────────────────────

describe('deleteNote', () => {
  it('removes the body from localStorage', () => {
    persistNote('del-1', { title: 'To delete', body: 'content', updatedAt: 1 });
    deleteNote('del-1');
    expect(localStorage.getItem(noteKey('del-1'))).toBeNull();
  });

  it('removes the entry from the index', () => {
    persistNote('del-2', { title: 'To delete', body: 'content', updatedAt: 1 });
    deleteNote('del-2');
    expect(readIndex()['del-2']).toBeUndefined();
  });

  it('is idempotent (deleting non-existent note does not throw)', () => {
    expect(() => deleteNote('ghost-id')).not.toThrow();
  });

  it('does not affect other notes in the index', () => {
    persistNote('keep', { title: 'Keep', body: 'stays', updatedAt: 1 });
    persistNote('remove', { title: 'Remove', body: 'goes', updatedAt: 2 });
    deleteNote('remove');
    const index = readIndex();
    expect(index['keep']).toBeDefined();
    expect(index['remove']).toBeUndefined();
  });
});

// ─── noteKey ──────────────────────────────────────────────────────────────────

describe('noteKey', () => {
  it('returns the correct localStorage key for a note id', () => {
    expect(noteKey('abc-123')).toBe('ink:note:abc-123');
  });

  it('is namespaced with ink: prefix', () => {
    expect(noteKey('x').startsWith('ink:')).toBe(true);
  });
});
