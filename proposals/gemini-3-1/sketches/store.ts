import { createStore } from "solid-js/store";
import { createMemo } from "solid-js";

export interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
}

interface AppState {
  notes: Record<string, Note>;
  activeNoteId: string | null;
  searchQuery: string;
}

const initialNotes = JSON.parse(localStorage.getItem('notes') || '{}');

export const [state, setState] = createStore<AppState>({
  notes: initialNotes,
  activeNoteId: Object.keys(initialNotes)[0] || null,
  searchQuery: '',
});

export const activeNote = createMemo(() => 
  state.activeNoteId ? state.notes[state.activeNoteId] : null
);

export const filteredNotes = createMemo(() => {
  const query = state.searchQuery.toLowerCase();
  return Object.values(state.notes).filter(n => 
    n.title.toLowerCase().includes(query) || 
    n.content.toLowerCase().includes(query)
  ).sort((a, b) => b.updatedAt - a.updatedAt);
});

export const actions = {
  updateNote: (id: string, content: string) => {
    setState('notes', id, (n) => ({ ...n, content, updatedAt: Date.now() }));
  },
  addNote: () => {
    const id = crypto.randomUUID();
    setState('notes', id, { id, title: 'Untitled', content: '', updatedAt: Date.now() });
    setState('activeNoteId', id);
  },
  deleteNote: (id: string) => {
    setState('notes', id, undefined!);
    if (state.activeNoteId === id) setState('activeNoteId', null);
  }
};
