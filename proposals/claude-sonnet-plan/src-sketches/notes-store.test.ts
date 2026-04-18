/**
 * Vitest unit tests for the notes store.
 * These tests are the ground truth for action semantics — they run
 * without a DOM and have no SolidJS dependency.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { useNotesStore } from '../src/store/notes-store';

// Reset store state before each test so tests are order-independent.
beforeEach(() => {
  useNotesStore.setState({ notes: {}, activeId: null, searchQuery: '' });
});

describe('createNote', () => {
  it('adds a note and sets it as active', () => {
    const id = useNotesStore.getState().createNote();
    const state = useNotesStore.getState();
    expect(state.notes[id]).toBeDefined();
    expect(state.activeId).toBe(id);
  });

  it('new note has empty content and default title', () => {
    const id = useNotesStore.getState().createNote();
    const note = useNotesStore.getState().notes[id];
    expect(note.title).toBe('Untitled');
    expect(note.content).toBe('');
  });
});

describe('updateContent', () => {
  it('updates note content without changing other fields', () => {
    const id = useNotesStore.getState().createNote();
    const before = useNotesStore.getState().notes[id];
    useNotesStore.getState().updateContent(id, '# Hello');
    const after = useNotesStore.getState().notes[id];
    expect(after.content).toBe('# Hello');
    expect(after.title).toBe(before.title);
    expect(after.id).toBe(before.id);
    expect(after.updatedAt).toBeGreaterThanOrEqual(before.updatedAt);
  });

  it('is a no-op for unknown id', () => {
    const before = useNotesStore.getState().notes;
    useNotesStore.getState().updateContent('nonexistent', 'x');
    expect(useNotesStore.getState().notes).toEqual(before);
  });
});

describe('deleteNote', () => {
  it('removes the note from state', () => {
    const id = useNotesStore.getState().createNote();
    useNotesStore.getState().deleteNote(id);
    expect(useNotesStore.getState().notes[id]).toBeUndefined();
  });

  it('clears activeId when the active note is deleted and no notes remain', () => {
    const id = useNotesStore.getState().createNote();
    useNotesStore.getState().deleteNote(id);
    expect(useNotesStore.getState().activeId).toBeNull();
  });

  it('sets activeId to a remaining note when the active note is deleted', () => {
    const id1 = useNotesStore.getState().createNote();
    const id2 = useNotesStore.getState().createNote();
    // id2 is now active
    useNotesStore.getState().deleteNote(id2);
    expect(useNotesStore.getState().activeId).toBe(id1);
  });
});

describe('setActiveId', () => {
  it('switches the active note', () => {
    const id1 = useNotesStore.getState().createNote();
    const id2 = useNotesStore.getState().createNote();
    useNotesStore.getState().setActiveId(id1);
    expect(useNotesStore.getState().activeId).toBe(id1);
    useNotesStore.getState().setActiveId(id2);
    expect(useNotesStore.getState().activeId).toBe(id2);
  });
});

describe('search filtering (derived)', () => {
  it('setSearchQuery stores the query for components to derive from', () => {
    useNotesStore.getState().setSearchQuery('hello');
    expect(useNotesStore.getState().searchQuery).toBe('hello');
  });
});
