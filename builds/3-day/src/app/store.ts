/**
 * store.ts — Solid createStore-based notes index
 *
 * Design decisions encoded here:
 *   1. Store holds metadata only (id, title, snippet, updatedAt).
 *      Full note bodies live exclusively in localStorage, loaded on demand.
 *
 *   2. updatedAt is a ms epoch timestamp on every note.
 *      Single-user: sort order. Future collab: LWW merge key.
 *
 *   3. No reducer, no action types, no dispatch.
 *      Actions are plain exported functions. Solid's `produce` gives
 *      structural-sharing immutability without Redux ceremony.
 *
 *   4. Hash-based routing — activeNoteId syncs to location.hash.
 *      ~0 KB overhead; supports browser back/forward and deep-linking.
 */
import { createStore, produce } from 'solid-js/store';
import { loadAllNotes, loadNoteBody, persistNote, deleteNote as storageDeleteNote } from '../lib/persistence';
import { generateId } from '../lib/id';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Note {
  id:        string;
  title:     string;
  snippet:   string;   // First 120 chars of body, newlines → spaces
  updatedAt: number;   // ms epoch — collab LWW key; sort key in single-user
}

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

/** Parse #note-<id> from current URL hash, or null */
function parseHashNoteId(): string | null {
  const match = location.hash.match(/^#note-(.+)$/);
  return match ? match[1] : null;
}

// Sync hash → store on browser back/forward
window.addEventListener('hashchange', () => {
  setState('activeNoteId', parseHashNoteId());
});

// ─── Actions ─────────────────────────────────────────────────────────────────

/** Create a new empty note, persist it immediately, return its id */
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
  // Sort notes by recency after update (most recently edited first)
  setState('notes', (notes) => [...notes].sort((a, b) => b.updatedAt - a.updatedAt));
  persistNote(id, { title, body, updatedAt });
}

/** Rename a note title without touching body */
export function renameNote(id: string, title: string): void {
  const now  = Date.now();
  setState('notes', (n) => n.id === id, 'title',     title);
  setState('notes', (n) => n.id === id, 'updatedAt', now);
  // Load the existing body to re-save with new title
  const body = loadNoteBody(id);
  persistNote(id, { title, body, updatedAt: now });
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

// ─── Derived (computed) ───────────────────────────────────────────────────────

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

// ─── Export read-only state reference ────────────────────────────────────────

export { state as store };
