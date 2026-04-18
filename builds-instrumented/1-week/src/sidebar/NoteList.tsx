/**
 * NoteList.tsx — Full sidebar: app name, search, note list, footer metadata.
 *
 * ARIA:
 *  - role="search" on search wrapper
 *  - role="listbox" on notes list (note items are role="option")
 *  - aria-live="polite" on note count and save status (soft announcements)
 *  - aria-label on all interactive controls
 *
 * Mobile:
 *  - Hamburger button triggers data-sidebar-open on app shell (handled in App.tsx)
 *  - Escape key closes sidebar (handled globally in Editor.tsx)
 */
import { For, Show, type JSX } from 'solid-js';
import {
  store,
  filteredNotes,
  setActiveNoteId,
  setSearchQuery,
  createNote,
} from '../app/store';
import { NoteListItem } from './NoteListItem';
import { wordCount, isDirty } from '../editor/Editor';

export function NoteList(): JSX.Element {
  function handleNewNote() {
    const id = createNote();
    setActiveNoteId(id);
    // On mobile, close the sidebar after creating
    const shell = document.querySelector('[data-sidebar-open]');
    if (shell) (shell as HTMLElement).removeAttribute('data-sidebar-open');
  }

  return (
    <nav class="sidebar" aria-label="Notes navigation">
      {/* ── Header ── */}
      <header class="sidebar-header">
        <h1 class="app-name">Ink</h1>
        <button
          class="new-note-btn"
          onClick={handleNewNote}
          aria-label="New note (Cmd+N)"
          title="New note (⌘N)"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
            <path
              d="M8 2v12M2 8h12"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </header>

      {/* ── Search ── */}
      <div class="search-wrapper" role="search">
        <svg
          class="search-icon"
          width="14"
          height="14"
          viewBox="0 0 14 14"
          aria-hidden="true"
        >
          <circle
            cx="5.5"
            cy="5.5"
            r="4"
            stroke="currentColor"
            stroke-width="1.5"
            fill="none"
          />
          <path
            d="M9 9l3.5 3.5"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          />
        </svg>
        <input
          class="search-input"
          type="search"
          placeholder="Search notes…"
          value={store.searchQuery}
          onInput={(e) => setSearchQuery(e.currentTarget.value)}
          aria-label="Search notes"
          autocomplete="off"
          spellcheck={false}
        />
      </div>

      {/* ── Note list ── */}
      <Show
        when={filteredNotes().length > 0}
        fallback={
          <p class="empty-state" aria-live="polite">
            {store.searchQuery ? 'No matching notes.' : 'No notes yet. Press ⌘N to start.'}
          </p>
        }
      >
        <ul class="notes-ul" role="listbox" aria-label="Notes list">
          <For each={filteredNotes()}>
            {(note) => (
              <NoteListItem
                note={note}
                isActive={store.activeNoteId === note.id}
                onClick={() => {
                  setActiveNoteId(note.id);
                  // Close mobile sidebar on note selection
                  const shell = document.querySelector('[data-sidebar-open]');
                  if (shell) (shell as HTMLElement).removeAttribute('data-sidebar-open');
                }}
              />
            )}
          </For>
        </ul>
      </Show>

      {/* ── Footer ── */}
      <footer class="sidebar-footer">
        <span class="note-count" aria-live="polite" aria-atomic="true">
          {store.notes.length === 0
            ? 'No notes'
            : store.notes.length === 1
            ? '1 note'
            : `${store.notes.length} notes`}
        </span>
        <Show when={store.activeNoteId}>
          <span class="save-status" aria-live="polite" aria-atomic="true">
            {isDirty() ? 'Unsaved…' : 'Saved'}
          </span>
        </Show>
      </footer>
    </nav>
  );
}
