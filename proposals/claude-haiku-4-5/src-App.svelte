<!-- src/lib/components/App.svelte -->

<script>
  import { onMount } from 'svelte';
  import Editor from './Editor.svelte';
  import Preview from './Preview.svelte';
  import NoteList from './NoteList.svelte';
  import {
    loadNotes,
    saveNotes,
    updateNote,
    deleteNote,
    renameNote,
    createNote,
    debounce
  } from '../stores/notes';

  let state = $state({
    notes: new Map(),
    activeNoteId: null,
    filter: ''
  });

  const debouncedSave = debounce(() => saveNotes(state.notes), 500);

  onMount(() => {
    state.notes = loadNotes();
    if (state.notes.size === 0) {
      const newNote = createNote('Welcome', '# My Notes\n\nCreate a new note to get started.');
      state.notes.set(newNote.id, newNote);
      state.activeNoteId = newNote.id;
    } else if (!state.activeNoteId) {
      state.activeNoteId = Array.from(state.notes.keys())[0];
    }
  });

  $effect(() => {
    debouncedSave();
  });

  const activeNote = $derived(
    state.activeNoteId ? state.notes.get(state.activeNoteId) : null
  );

  const filteredNotes = $derived.by(() => {
    if (!state.filter) return Array.from(state.notes.values());
    const lower = state.filter.toLowerCase();
    return Array.from(state.notes.values()).filter(
      note =>
        note.title.toLowerCase().includes(lower) ||
        note.content.toLowerCase().includes(lower)
    );
  });

  function handleAddNote() {
    const newNote = createNote();
    state.notes.set(newNote.id, newNote);
    state.activeNoteId = newNote.id;
  }

  function handleDeleteNote(id) {
    deleteNote(state, id);
  }

  function handleSelectNote(id) {
    state.activeNoteId = id;
  }

  function handleSaveContent(content) {
    if (state.activeNoteId) {
      updateNote(state, state.activeNoteId, content);
    }
  }

  function handleRenameNote(id, title) {
    renameNote(state, id, title);
  }
</script>

<main>
  <header>
    <h1>Notes</h1>
  </header>
  <div class="container">
    <aside>
      <div class="sidebar-header">
        <input
          type="text"
          placeholder="Search notes..."
          bind:value={state.filter}
          class="search-input"
        />
        <button onclick={handleAddNote} class="add-btn">+ New</button>
      </div>
      <NoteList
        notes={filteredNotes}
        activeId={state.activeNoteId}
        onSelect={handleSelectNote}
        onDelete={handleDeleteNote}
        onRename={handleRenameNote}
      />
    </aside>
    <section class="editor-pane">
      {#if activeNote}
        <Editor note={activeNote} onSave={handleSaveContent} />
        <Preview content={activeNote.content} />
      {:else}
        <div class="empty-state">
          <p>No notes found</p>
          <button onclick={handleAddNote}>Create a new note</button>
        </div>
      {/if}
    </section>
  </div>
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    height: 100vh;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    color: #333;
    background: #fafafa;
  }

  header {
    border-bottom: 1px solid #ddd;
    padding: 1rem 1.5rem;
    background: white;
  }

  h1 {
    margin: 0;
    font-size: 1.5rem;
  }

  .container {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  aside {
    width: 280px;
    background: white;
    border-right: 1px solid #ddd;
    display: flex;
    flex-direction: column;
  }

  .sidebar-header {
    padding: 1rem;
    border-bottom: 1px solid #ddd;
    display: flex;
    gap: 0.5rem;
  }

  .search-input {
    flex: 1;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 0.9rem;
  }

  .add-btn {
    padding: 0.5rem 1rem;
    background: #0066cc;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
  }

  .add-btn:hover {
    background: #0052a3;
  }

  .editor-pane {
    flex: 1;
    display: flex;
    overflow: hidden;
  }

  .empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #999;
  }

  .empty-state p {
    margin: 0 0 1rem 0;
    font-size: 1.1rem;
  }

  .empty-state button {
    padding: 0.75rem 1.5rem;
    background: #0066cc;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
  }

  .empty-state button:hover {
    background: #0052a3;
  }
</style>
