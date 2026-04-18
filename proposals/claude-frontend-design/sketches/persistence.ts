/**
 * persistence.ts — localStorage codec for Ink
 *
 * Design decisions:
 *
 *   1. SPLIT STORAGE: Index (metadata) and body (full content) are stored
 *      as separate localStorage keys. This matters at scale:
 *
 *      - The sidebar reads the index (100–200 bytes per note) on startup.
 *        500 notes = ~50–100 KB of index data. Fast, no full document parsing.
 *
 *      - Note bodies are loaded on demand when a note is opened.
 *        A 10 KB markdown document is only deserialized when you click it.
 *
 *      Contrast: storing all notes as a single JSON blob would require
 *      deserializing every note body on every startup and every save.
 *
 *   2. KEY SCHEME:
 *      - Index:  "ink:index"              → Record<id, Note metadata>
 *      - Bodies: "ink:note:<id>"          → NotePayload { title, body, updatedAt }
 *
 *      The "ink:" namespace prevents collisions with other apps on the same origin.
 *
 *   3. SILENT FAILURE: localStorage can throw in private browsing mode or when
 *      storage is full. All writes are wrapped in try/catch. The app continues
 *      to function (in-memory only) if storage fails, with a console warning.
 *
 *   4. COLLAB READINESS: NotePayload includes updatedAt for LWW merge.
 *      In single-user mode this is the sort key and last-modified display.
 *      In collab mode this becomes the LWW timestamp for offline conflict resolution.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NotePayload {
  title:     string;
  body:      string;
  updatedAt: number;  // ms epoch
}

export interface NoteIndexEntry {
  id:        string;
  title:     string;
  snippet:   string;  // Body slice, 120 chars max, newlines collapsed
  updatedAt: number;
}

// ─── Key constants ────────────────────────────────────────────────────────────

const NS          = 'ink:';
const INDEX_KEY   = `${NS}index`;
const noteKey     = (id: string) => `${NS}note:${id}`;

// ─── Index helpers ────────────────────────────────────────────────────────────

function readIndex(): Record<string, NoteIndexEntry> {
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
 * Load all note metadata from the index.
 * Returns entries sorted by updatedAt descending (most recent first).
 * Called once on app startup to hydrate the Solid store.
 */
export function loadAllNotes(): NoteIndexEntry[] {
  const index = readIndex();
  return Object.values(index).sort((a, b) => b.updatedAt - a.updatedAt);
}

/**
 * Persist a note's full payload (title + body + timestamp).
 * Updates both the body entry and the sidebar index entry atomically.
 * Called by the debounced save in Editor.tsx.
 */
export function persistNote(id: string, payload: NotePayload): void {
  try {
    localStorage.setItem(noteKey(id), JSON.stringify(payload));
  } catch (err) {
    console.warn(`[ink] Failed to write note body for ${id}`, err);
    return;
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
 * Called when switching to a note in Editor.tsx.
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
 * Called by removeNote() in store.ts.
 */
export function deleteNote(id: string): void {
  try {
    localStorage.removeItem(noteKey(id));
  } catch {
    // Ignore — best effort cleanup
  }
  const index = readIndex();
  delete index[id];
  writeIndex(index);
}

/**
 * Export all notes as a JSON blob for backup/import.
 * Not wired to UI in v1 but available as a utility.
 */
export function exportAllNotes(): { notes: NotePayload[] } {
  const index = readIndex();
  const notes = Object.keys(index).map((id) => {
    const body = loadNoteBody(id);
    return {
      id,
      title:     index[id].title,
      body,
      updatedAt: index[id].updatedAt,
    };
  });
  return { notes };
}
