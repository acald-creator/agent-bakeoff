// src/lib/stores/notes.ts

import type { Note, NotesState, NotesDump } from '../types';

const STORAGE_KEY = 'notes-editor-v1';

export function loadNotes(): Map<string, Note> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return new Map();
    const dump: NotesDump = JSON.parse(stored);
    return new Map(dump);
  } catch (e) {
    console.error('Failed to load notes:', e);
    return new Map();
  }
}

export function saveNotes(notes: Map<string, Note>): void {
  try {
    const dump: NotesDump = Array.from(notes.entries());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dump));
  } catch (e) {
    console.error('Failed to save notes:', e);
  }
}

export function createNote(title: string = 'Untitled', content: string = ''): Note {
  return {
    id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title,
    content,
    modified: Date.now(),
    version: 0
  };
}

export function updateNote(state: NotesState, id: string, content: string): void {
  const note = state.notes.get(id);
  if (!note) return;

  // Immutable snapshot replacement
  state.notes.set(id, {
    ...note,
    content,
    modified: Date.now(),
    version: note.version + 1
  });
}

export function renameNote(state: NotesState, id: string, title: string): void {
  const note = state.notes.get(id);
  if (!note) return;

  state.notes.set(id, {
    ...note,
    title,
    modified: Date.now(),
    version: note.version + 1
  });
}

export function deleteNote(state: NotesState, id: string): void {
  state.notes.delete(id);
  if (state.activeNoteId === id) {
    state.activeNoteId = Array.from(state.notes.keys())[0] ?? null;
  }
}

export function filterNotes(notes: Map<string, Note>, query: string): Note[] {
  if (!query) return Array.from(notes.values());

  const lower = query.toLowerCase();
  return Array.from(notes.values()).filter(
    note =>
      note.title.toLowerCase().includes(lower) ||
      note.content.toLowerCase().includes(lower)
  );
}

// Debounce helper for persistence
export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): T {
  let timeoutId: ReturnType<typeof setTimeout>;
  return ((...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  }) as T;
}
