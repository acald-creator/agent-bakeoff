import { For, Show, type JSX } from 'solid-js';
import {
  store,
  createNote,
  setActiveNoteId,
  removeNote,
  setSearchQuery,
  filteredNotes,
} from '../app/store';
import { isDirty } from '../editor/Editor';

function formatDate(ms: number): string {
  const d = new Date(ms);
  const now = new Date();
  const diff = now.getTime() - ms;
  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function NoteListItem(props: { note: { id: string; title: string; snippet: string; updatedAt: number } }): JSX.Element {
  const isActive = () => store.activeNoteId === props.note.id;
  const showDirtyDot = () => isActive() && isDirty();

  function handleDelete(e: MouseEvent): void {
    e.stopPropagation();
    if (confirm(`Delete "${props.note.title}"?`)) {
      removeNote(props.note.id);
    }
  }

  return (
    <li
      class={`note-list-item${isActive() ? ' is-active' : ''}`}
      onClick={() => setActiveNoteId(props.note.id)}
      role="option"
      aria-selected={isActive()}
    >
      <span class="note-title">{props.note.title || 'Untitled'}</span>
      <Show when={props.note.snippet}>
        <span class="note-snippet">{props.note.snippet}</span>
      </Show>
      <span class="note-date">{formatDate(props.note.updatedAt)}</span>
      <span class={`dirty-dot${showDirtyDot() ? ' is-visible' : ''}`} aria-hidden="true" />
      <button
        class="note-delete-btn"
        onClick={handleDelete}
        title="Delete note"
        aria-label={`Delete ${props.note.title}`}
      >
        ×
      </button>
    </li>
  );
}

export function Sidebar(): JSX.Element {
  function handleNewNote(): void {
    const id = createNote();
    setActiveNoteId(id);
  }

  const notes = () => filteredNotes();
  const totalCount = () => store.notes.length;

  return (
    <aside class="sidebar" aria-label="Notes sidebar">
      <header class="sidebar-header">
        <span class="app-name">Ink</span>
        <button
          class="new-note-btn"
          onClick={handleNewNote}
          title="New note (Ctrl+N)"
          aria-label="Create new note"
        >
          +
        </button>
      </header>

      <div class="search-wrapper">
        <span class="search-icon" aria-hidden="true">⌕</span>
        <input
          type="search"
          class="search-input"
          placeholder="Search notes…"
          value={store.searchQuery}
          onInput={(e) => setSearchQuery(e.currentTarget.value)}
          aria-label="Search notes"
        />
      </div>

      <ul class="notes-ul" role="listbox" aria-label="Notes">
        <Show
          when={notes().length > 0}
          fallback={
            <li class="empty-state">
              <Show
                when={store.searchQuery}
                fallback={<>No notes yet.<br />Click + to create one.</>}
              >
                No notes match "{store.searchQuery}"
              </Show>
            </li>
          }
        >
          <For each={notes()}>
            {(note) => <NoteListItem note={note} />}
          </For>
        </Show>
      </ul>

      <footer class="sidebar-footer">
        <span class="note-count">
          {totalCount() === 1 ? '1 note' : `${totalCount()} notes`}
        </span>
      </footer>
    </aside>
  );
}
