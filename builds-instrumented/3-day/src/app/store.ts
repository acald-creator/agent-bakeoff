/**
 * store.ts — Solid createStore-based notes index
 *
 * Design:
 *   1. Store holds metadata only — bodies live in localStorage loaded on demand.
 *   2. updatedAt on every note — sort key in single-user, LWW key for future collab.
 *   3. No reducer, no action types — actions are plain exported functions.
 *   4. Hash-based routing (no router lib) — syncs activeNoteId ↔ location.hash.
 */
import { createStore, produce } from 'solid-js/store';
import {
  loadAllNotes,
  persistNote,
  deleteNote as storageDeleteNote,
  type NoteIndexEntry,
} from '../lib/persistence';
import { generateId } from '../lib/id';

// ─── Types ────────────────────────────────────────────────────────────────────

export type Note = NoteIndexEntry;

interface NotesState {
  notes:        Note[];
  activeNoteId: string | null;
  searchQuery:  string;
}

// ─── Store ────────────────────────────────────────────────────────────────────

function parseHashNoteId(): string | null {
  const match = location.hash.match(/^#note-(.+)$/);
  return match ? match[1] : null;
}

const [state, setState] = createStore<NotesState>({
  notes:        loadAllNotes(),
  activeNoteId: parseHashNoteId(),
  searchQuery:  '',
});

// Sync browser back/forward navigation to store
window.addEventListener('hashchange', () => {
  setState('activeNoteId', parseHashNoteId());
});

// ─── Actions ─────────────────────────────────────────────────────────────────

/** Create a new empty note, persist it, and return its id */
export function createNote(): string {
  const id  = generateId();
  const now = Date.now();
  const note: Note = { id, title: 'Untitled', snippet: '', updatedAt: now };
  setState('notes', (notes) => [note, ...notes]);
  persistNote(id, { title: 'Untitled', body: '', updatedAt: now });
  return id;
}

/** Set the active note; syncs to URL hash */
export function setActiveNoteId(id: string | null): void {
  setState('activeNoteId', id);
  if (id) {
    history.replaceState(null, '', `#note-${id}`);
  } else {
    history.replaceState(null, '', location.pathname + location.search);
  }
}

/** Called by the editor's debounced save path */
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
  // Re-sort so most recently edited note rises to top
  setState('notes', (notes) => [...notes].sort((a, b) => b.updatedAt - a.updatedAt));
  persistNote(id, { title, body, updatedAt });
}

/** Rename a note title without touching body */
export function renameNote(id: string, title: string): void {
  setState('notes', (n) => n.id === id, 'title', title);
}

/** Delete a note and clear activeNoteId if it was active */
export function removeNote(id: string): void {
  setState('notes', (notes) => notes.filter((n) => n.id !== id));
  storageDeleteNote(id);
  if (state.activeNoteId === id) setActiveNoteId(null);
}

/** Update the search query for sidebar filtering */
export function setSearchQuery(q: string): void {
  setState('searchQuery', q);
}

// ─── Derived ──────────────────────────────────────────────────────────────────

/** Returns notes filtered by searchQuery; empty query = all notes */
export function filteredNotes(): Note[] {
  const q = state.searchQuery.trim().toLowerCase();
  if (!q) return state.notes;
  return state.notes.filter(
    (n) =>
      n.title.toLowerCase().includes(q) ||
      n.snippet.toLowerCase().includes(q),
  );
}

/** Returns the active Note object, or null */
export function activeNote(): Note | null {
  return state.notes.find((n) => n.id === state.activeNoteId) ?? null;
}

// Export read-only state reference
export { state as store };
