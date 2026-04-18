export type NoteId = string;

export interface NoteRecord {
  id: NoteId;
  title: string;
  body: string;
  createdAt: number;
  updatedAt: number;
}

export interface AppState {
  notes: NoteRecord[];
  selectedNoteId: NoteId | null;
  query: string;
  ui: {
    previewMode: "split" | "edit" | "preview";
    lastSavedAt: number | null;
  };
}

export interface SnapshotV1 {
  version: 1;
  state: AppState;
}

export function makeNote(now = Date.now()): NoteRecord {
  return {
    id: crypto.randomUUID(),
    title: "Untitled note",
    body: "",
    createdAt: now,
    updatedAt: now
  };
}
