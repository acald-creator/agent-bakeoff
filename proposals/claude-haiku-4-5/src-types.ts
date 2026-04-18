// src/lib/types.ts

export interface Note {
  id: string;
  title: string;
  content: string;
  modified: number;
  version: number;
}

export interface NotesState {
  notes: Map<string, Note>;
  activeNoteId: string | null;
  filter: string;
}

export interface NoteSnapshot {
  id: string;
  title: string;
  content: string;
  modified: number;
  version: number;
}

export type NotesDump = Array<[string, NoteSnapshot]>;
