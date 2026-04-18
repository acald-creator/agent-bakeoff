/**
 * persistence.ts — localStorage codec for Ink.
 *
 * Split storage: index (metadata ~150 bytes/note) and body (full content).
 * Sidebar reads the index on startup; bodies are loaded on demand.
 *
 * Key scheme:
 *   "ink:index"       → Record<id, NoteIndexEntry>  (metadata only)
 *   "ink:note:<id>"   → NotePayload                  (full body)
 *
 * All writes are wrapped in try/catch — localStorage throws in private
 * browsing or when quota is exceeded. The app degrades gracefully to
 * in-memory operation with a console warning.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NotePayload {
  title:     string;
  body:      string;
  updatedAt: number; // ms epoch — collab LWW key in future
}

export interface NoteIndexEntry {
  id:        string;
  title:     string;
  snippet:   string; // Body slice, 120 chars max, newlines collapsed
  updatedAt: number;
}

// ─── Key constants ────────────────────────────────────────────────────────────

const NS        = 'ink:';
const INDEX_KEY = `${NS}index`;

export function noteKey(id: string): string {
  return `${NS}note:${id}`;
}

// ─── Index helpers ────────────────────────────────────────────────────────────

export function readIndex(): Record<string, NoteIndexEntry> {
  try {
    const raw = localStorage.getItem(INDEX_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, NoteIndexEntry>;
  } catch {
    console.warn('[ink] Failed to read notes index from localStorage');
    return {};
  }
}

function writeIndex(index: Record<string, NoteIndexEntry>): void {
  try {
    localStorage.setItem(INDEX_KEY, JSON.stringify(index));
  } catch (err) {
    console.warn('[ink] Failed to write notes index to localStorage', err);
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Load all note metadata from the index, sorted by updatedAt descending.
 * Called once on app startup to hydrate the Solid store.
 */
export function loadAllNotes(): NoteIndexEntry[] {
  const index = readIndex();
  return Object.values(index).sort((a, b) => b.updatedAt - a.updatedAt);
}

/**
 * Persist a note's full payload and update the index entry.
 * Called by the debounced save path in Editor.tsx.
 */
export function persistNote(id: string, payload: NotePayload): void {
  try {
    localStorage.setItem(noteKey(id), JSON.stringify(payload));
  } catch (err) {
    console.warn(`[ink] Failed to write note body for ${id}`, err);
    return; // If body write failed, don't update index
  }
  const index = readIndex();
  index[id] = {
    id,
    title:     payload.title,
    snippet:   payload.body.slice(0, 120).replace(/\n/g, ' '),
    updatedAt: payload.updatedAt,
  };
  writeIndex(index);
}

/**
 * Load the full body of a single note by id.
 * Returns empty string if not found or on parse error.
 */
export function loadNoteBody(id: string): string {
  try {
    const raw = localStorage.getItem(noteKey(id));
    if (!raw) return '';
    const payload = JSON.parse(raw) as NotePayload;
    return payload.body ?? '';
  } catch {
    console.warn(`[ink] Failed to load note body for ${id}`);
    return '';
  }
}

/**
 * Delete a note's body and remove it from the index.
 */
export function deleteNote(id: string): void {
  try {
    localStorage.removeItem(noteKey(id));
  } catch {
    // Best-effort cleanup
  }
  const index = readIndex();
  delete index[id];
  writeIndex(index);
}

/**
 * Export all notes as a JSON blob.
 * Available as a utility; not wired to UI in v1.
 */
export function exportAllNotes(): { notes: (NotePayload & { id: string })[] } {
  const index = readIndex();
  const notes = Object.keys(index).map((id) => ({
    id,
    title:     index[id].title,
    body:      loadNoteBody(id),
    updatedAt: index[id].updatedAt,
  }));
  return { notes };
}
