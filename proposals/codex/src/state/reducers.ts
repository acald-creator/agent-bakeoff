import { AppState, NoteId, makeNote } from "./model";

export function createInitialState(now = Date.now()): AppState {
  const first = makeNote(now);

  return {
    notes: [first],
    selectedNoteId: first.id,
    query: "",
    ui: {
      previewMode: "split",
      lastSavedAt: null
    }
  };
}

export function createNote(state: AppState, now = Date.now()): AppState {
  const note = makeNote(now);
  return {
    ...state,
    notes: [note, ...state.notes],
    selectedNoteId: note.id
  };
}

export function selectNote(state: AppState, noteId: NoteId): AppState {
  return { ...state, selectedNoteId: noteId };
}

export function renameNote(
  state: AppState,
  payload: { noteId: NoteId; title: string; now?: number }
): AppState {
  const now = payload.now ?? Date.now();
  return {
    ...state,
    notes: state.notes.map((note) =>
      note.id === payload.noteId ? { ...note, title: payload.title, updatedAt: now } : note
    )
  };
}

export function editBody(
  state: AppState,
  payload: { noteId: NoteId; body: string; now?: number }
): AppState {
  const now = payload.now ?? Date.now();
  return {
    ...state,
    notes: state.notes.map((note) =>
      note.id === payload.noteId ? { ...note, body: payload.body, updatedAt: now } : note
    )
  };
}
