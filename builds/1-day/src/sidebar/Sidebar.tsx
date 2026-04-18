import { For, Show, type JSX } from 'solid-js';
import {
  store,
  filteredNotes,
  createNote,
  setActiveNoteId,
  removeNote,
  setSearchQuery,
} from '../app/store';
import { isDirty } from '../editor/Editor';

export function Sidebar(): JSX.Element {
  function handleNewNote() {
    const id = createNote();
    setActiveNoteId(id);
  }

  function handleSearch(e: Event) {
    setSearchQuery((e.target as HTMLInputElement).value);
  }

  function formatDate(ms: number): string {
    const d = new Date(ms);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  return (
    <aside class="sidebar">
      <div class="sidebar-header">
        <h1 class="sidebar-brand">Ink</h1>
        <button class="new-note-btn" onClick={handleNewNote} title="New note">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 2a.75.75 0 0 1 .75.75v4.5h4.5a.75.75 0 0 1 0 1.5h-4.5v4.5a.75.75 0 0 1-1.5 0v-4.5h-4.5a.75.75 0 0 1 0-1.5h4.5v-4.5A.75.75 0 0 1 8 2Z" />
          </svg>
        </button>
      </div>

      <div class="search-container">
        <svg class="search-icon" width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
          <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.099zm-5.242 1.656a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11z"/>
        </svg>
        <input
          type="search"
          class="search-input"
          placeholder="Search notes..."
          value={store.searchQuery}
          onInput={handleSearch}
        />
      </div>

      <div class="note-list">
        <Show
          when={filteredNotes().length > 0}
          fallback={
            <div class="note-list-empty">
              <span>{store.searchQuery ? 'No notes match your search.' : 'No notes yet.'}</span>
              <Show when={!store.searchQuery}>
                <button class="empty-create-btn" onClick={handleNewNote}>
                  Create your first note
                </button>
              </Show>
            </div>
          }
        >
          <For each={filteredNotes()}>
            {(note) => (
              <div
                class={`note-item ${store.activeNoteId === note.id ? 'active' : ''}`}
                onClick={() => setActiveNoteId(note.id)}
              >
                <div class="note-item-header">
                  <span class="note-item-title">{note.title}</span>
                  <Show when={store.activeNoteId === note.id && isDirty()}>
                    <span class="dirty-dot" title="Unsaved changes" />
                  </Show>
                </div>
                <div class="note-item-meta">
                  <span class="note-item-date">{formatDate(note.updatedAt)}</span>
                  <Show when={note.snippet}>
                    <span class="note-item-snippet">{note.snippet.slice(0, 60)}</span>
                  </Show>
                </div>
                <button
                  class="note-item-delete"
                  title="Delete note"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Delete "${note.title}"?`)) removeNote(note.id);
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                    <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                  </svg>
                </button>
              </div>
            )}
          </For>
        </Show>
      </div>
    </aside>
  );
}
