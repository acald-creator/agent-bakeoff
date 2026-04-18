/**
 * NoteList.tsx — The full sidebar content: header, search, note list, footer.
 *
 * Design decisions:
 *   1. <For> is keyed by note.id. Only items that change (active state toggle)
 *      re-render. 200 notes = 200 stable DOM nodes. No virtual windowing needed.
 *   2. The "Notes" count is an aria-live region — screen readers announce when
 *      notes are added/deleted without requiring focus.
 *   3. Empty state shows different copy for "no notes" vs "no search results"
 *      — the distinction is meaningful to the user.
 */
import { For, Show, type Component } from 'solid-js';
import { store, getFilteredNotes, setActiveNoteId, createNote } from '../app/store';
import { NoteListItem } from './NoteListItem';
import { Search } from './Search';
import {
  sidebar,
  sidebarHeader,
  appName,
  newNoteBtn,
  notesUl,
  emptyList,
  sidebarFooter,
  noteCount,
} from './sidebar.css.ts';

export const NoteList: Component = () => {
  const filtered = () => getFilteredNotes();

  function handleNewNote() {
    const id = createNote();
    setActiveNoteId(id);
  }

  return (
    <nav class={sidebar} aria-label="Notes">
      {/* ── Header ── */}
      <header class={sidebarHeader}>
        <h1 class={appName} aria-label="Ink — notes editor">Ink</h1>
        <button
          class={newNoteBtn}
          onClick={handleNewNote}
          aria-label="New note"
          title="New note"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
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
      <Search />

      {/* ── Note list ── */}
      <Show
        when={filtered().length > 0}
        fallback={
          <p class={emptyList} role="status">
            {store.searchQuery ? 'No matching notes.' : 'No notes yet.\nClick + to create one.'}
          </p>
        }
      >
        <ul
          class={notesUl}
          role="listbox"
          aria-label="Note list"
          aria-activedescendant={store.activeNoteId ?? undefined}
        >
          <For each={filtered()}>
            {(note) => (
              <NoteListItem
                note={note}
                isActive={store.activeNoteId === note.id}
                onClick={() => setActiveNoteId(note.id)}
              />
            )}
          </For>
        </ul>
      </Show>

      {/* ── Footer metadata ── */}
      <footer class={sidebarFooter}>
        <span class={noteCount} aria-live="polite">
          {store.notes.length} {store.notes.length === 1 ? 'note' : 'notes'}
        </span>
      </footer>
    </nav>
  );
};
