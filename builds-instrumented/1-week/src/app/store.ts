/**
 * store.ts — Solid createStore-based notes index.
 *
 * Design:
 *  1. Store holds metadata only (id, title, snippet, updatedAt).
 *     Full bodies live in localStorage, loaded on demand.
 *  2. updatedAt is a ms epoch on every note — sort key + collab LWW key.
 *  3. No reducer, no action types. Plain exported functions + Solid produce.
 *  4. Hash-based routing: activeNoteId syncs to location.hash. ~0 KB overhead.
 */
import { createStore, produce } from 'solid-js/store';
import {
  loadAllNotes,
  persistNote,
  deleteNote as storageDeleteNote,
  type NoteIndexEntry,
} from '../lib/persistence';
import { filterNotes } from '../lib/search';
import { generateId } from '../lib/id';

// ─── Types ────────────────────────────────────────────────────────────────────

export type Note = NoteIndexEntry;

interface NotesState {
  notes:        Note[];
  activeNoteId: string | null;
  searchQuery:  string;
}

// ─── Store ────────────────────────────────────────────────────────────────────

const [state, setState] = createStore<NotesState>({
  notes:        loadAllNotes(),
  activeNoteId: parseHashNoteId(),
  searchQuery:  '',
});

function parseHashNoteId(): string | null {
  const match = location.hash.match(/^#note-(.+)$/);
  return match ? match[1] : null;
}

// Sync hash → store on browser back/forward
window.addEventListener('hashchange', () => {
  setState('activeNoteId', parseHashNoteId());
});

// ─── Actions ─────────────────────────────────────────────────────────────────

/** Create a new empty note, persist it, and return its id. */
export function createNote(): string {
  const id  = generateId();
  const now = Date.now();
  const note: Note = { id, title: 'Untitled', snippet: '', updatedAt: now };
  setState('notes', (notes) => [note, ...notes]);
  persistNote(id, { title: 'Untitled', body: '', updatedAt: now });
  return id;
}

/** Set the active note; syncs to URL hash. */
export function setActiveNoteId(id: string | null): void {
  setState('activeNoteId', id);
  if (id) {
    history.replaceState(null, '', `#note-${id}`);
  } else {
    history.replaceState(null, '', location.pathname + location.search);
  }
}

/** Called by the editor's debounced save path. */
export function applyNoteSave(id: string, title: string, body: string): void {
  const updatedAt = Date.now();
  const snippet   = body.slice(0, 120).replace(/\n/g, ' ');
  setState(
    'notes',
    (n) => n.id === id,
    produce<Note>((n) => {
      n.title     = title;
      n.snippet   = snippet;
      n.updatedAt = updatedAt;
    }),
  );
  setState('notes', (notes) =>
    [...notes].sort((a, b) => b.updatedAt - a.updatedAt),
  );
  persistNote(id, { title, body, updatedAt });
}

/** Rename a note title without touching body. */
export function renameNote(id: string, title: string): void {
  setState('notes', (n) => n.id === id, 'title', title);
}

/** Delete a note and clear activeNoteId if it was active. */
export function removeNote(id: string): void {
  setState('notes', (notes) => notes.filter((n) => n.id !== id));
  storageDeleteNote(id);
  if (state.activeNoteId === id) setActiveNoteId(null);
}

/** Update the search query for sidebar filtering. */
export function setSearchQuery(q: string): void {
  setState('searchQuery', q);
}

// ─── Derived ─────────────────────────────────────────────────────────────────

/** Notes filtered by the current search query. */
export function filteredNotes(): Note[] {
  return filterNotes(state.notes, state.searchQuery);
}

/** The active Note object, or null. */
export function activeNote(): Note | null {
  return state.notes.find((n) => n.id === state.activeNoteId) ?? null;
}

export { state as store };
