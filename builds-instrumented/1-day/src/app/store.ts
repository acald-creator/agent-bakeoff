/**
 * store.ts — Solid createStore-based notes index
 *
 * Thin store: holds metadata only (id, title, snippet, updatedAt).
 * Full note bodies live in localStorage, loaded on demand.
 * No reducer, no action types. Plain exported functions + Solid's produce.
 * Hash-based routing syncs activeNoteId ↔ location.hash with no router lib.
 */
import { createStore, produce } from 'solid-js/store';
import { loadAllNotes, persistNote, deleteNote as storageDeleteNote } from '../lib/persistence';
import { generateId } from '../lib/id';

export interface Note {
  id: string;
  title: string;
  snippet: string;
  updatedAt: number;
}

interface NotesState {
  notes: Note[];
  activeNoteId: string | null;
  searchQuery: string;
}

function parseHashNoteId(): string | null {
  const match = location.hash.match(/^#note-(.+)$/);
  return match ? match[1] : null;
}

const [state, setState] = createStore<NotesState>({
  notes: loadAllNotes(),
  activeNoteId: parseHashNoteId(),
  searchQuery: '',
});

// Sync hash → store on browser back/forward
window.addEventListener('hashchange', () => {
  setState('activeNoteId', parseHashNoteId());
});

// ─── Actions ──────────────────────────────────────────────────────────────────

export function createNote(): string {
  const id = generateId();
  const now = Date.now();
  const note: Note = { id, title: 'Untitled', snippet: '', updatedAt: now };
  setState('notes', (notes) => [note, ...notes]);
  persistNote(id, { title: 'Untitled', body: '', updatedAt: now });
  return id;
}

export function setActiveNoteId(id: string | null): void {
  setState('activeNoteId', id);
  if (id) {
    history.replaceState(null, '', `#note-${id}`);
  } else {
    history.replaceState(null, '', location.pathname + location.search);
  }
}

export function applyNoteSave(id: string, title: string, body: string): void {
  const updatedAt = Date.now();
  const snippet = body.slice(0, 120).replace(/\n/g, ' ');
  setState(
    'notes',
    (n) => n.id === id,
    produce<Note>((n) => {
      n.title = title;
      n.snippet = snippet;
      n.updatedAt = updatedAt;
    }),
  );
  setState('notes', (notes) => [...notes].sort((a, b) => b.updatedAt - a.updatedAt));
  persistNote(id, { title, body, updatedAt });
}

export function renameNote(id: string, title: string): void {
  setState('notes', (n) => n.id === id, 'title', title);
}

export function removeNote(id: string): void {
  setState('notes', (notes) => notes.filter((n) => n.id !== id));
  storageDeleteNote(id);
  if (state.activeNoteId === id) setActiveNoteId(null);
}

export function setSearchQuery(q: string): void {
  setState('searchQuery', q);
}

// ─── Derived ──────────────────────────────────────────────────────────────────

export function filteredNotes(): Note[] {
  const q = state.searchQuery.trim().toLowerCase();
  if (!q) return state.notes;
  return state.notes.filter(
    (n) =>
      n.title.toLowerCase().includes(q) ||
      n.snippet.toLowerCase().includes(q),
  );
}

export function activeNote(): Note | null {
  return state.notes.find((n) => n.id === state.activeNoteId) ?? null;
}

export { state as store };
