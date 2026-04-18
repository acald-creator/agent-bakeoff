export interface NotePayload {
  title:     string;
  body:      string;
  updatedAt: number;
}

export interface NoteIndexEntry {
  id:        string;
  title:     string;
  snippet:   string;
  updatedAt: number;
}

const NS        = 'ink:';
const INDEX_KEY = `${NS}index`;
const noteKey   = (id: string) => `${NS}note:${id}`;

function readIndex(): Record<string, NoteIndexEntry> {
  try {
    const raw = localStorage.getItem(INDEX_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, NoteIndexEntry>;
  } catch {
    console.warn('[ink] Failed to read notes index');
    return {};
  }
}

function writeIndex(index: Record<string, NoteIndexEntry>): void {
  try {
    localStorage.setItem(INDEX_KEY, JSON.stringify(index));
  } catch (err) {
    console.warn('[ink] Failed to write notes index', err);
  }
}

export function loadAllNotes(): NoteIndexEntry[] {
  const index = readIndex();
  return Object.values(index).sort((a, b) => b.updatedAt - a.updatedAt);
}

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

export function deleteNote(id: string): void {
  try {
    localStorage.removeItem(noteKey(id));
  } catch {
    // best-effort cleanup
  }
  const index = readIndex();
  delete index[id];
  writeIndex(index);
}
