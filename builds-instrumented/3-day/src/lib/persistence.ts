/**
 * persistence.ts — localStorage codec for Ink
 *
 * Split storage model:
 *   - Index ("ink:index"): metadata only (~150 bytes/note) — loaded on startup
 *   - Bodies ("ink:note:<id>"): full content — loaded on demand when note opens
 *
 * All writes are wrapped in try/catch; app continues in-memory if storage fails.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NotePayload {
  title:     string;
  body:      string;
  updatedAt: number;
}

export interface NoteIndexEntry {
  id:        string;
  title:     string;
  snippet:   string;   // up to 120 chars, newlines collapsed
  updatedAt: number;
}

// ─── Key scheme ───────────────────────────────────────────────────────────────

const NS        = 'ink:';
const INDEX_KEY = `${NS}index`;
const noteKey   = (id: string) => `${NS}note:${id}`;

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

/** Load all note metadata sorted by updatedAt descending. Called once on startup. */
export function loadAllNotes(): NoteIndexEntry[] {
  const index = readIndex();
  return Object.values(index).sort((a, b) => b.updatedAt - a.updatedAt);
}

/** Persist a note's full payload. Updates body entry and index entry. */
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

/** Load the full body of a note by id. Returns '' if not found. */
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

/** Delete a note's body and remove it from the index. */
export function deleteNote(id: string): void {
  try {
    localStorage.removeItem(noteKey(id));
  } catch {
    // Best effort cleanup
  }
  const index = readIndex();
  delete index[id];
  writeIndex(index);
}
