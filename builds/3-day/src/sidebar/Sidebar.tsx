/**
 * Sidebar.tsx — full sidebar component: header + search + note list + footer
 *
 * Solid's <For> is keyed by note.id reference. Only items that change
 * (active state toggle) re-render. 200 notes = 200 stable DOM nodes.
 *
 * Search is controlled by the store (not local state) so the query
 * persists across sidebar-collapse/expand cycles on narrow viewports.
 */
import { For, Show, type JSX } from 'solid-js';
import {
  store,
  filteredNotes,
  setActiveNoteId,
  createNote,
} from '../app/store';
import { NoteListItem } from './NoteListItem';
import { Search } from './Search';

export function Sidebar(): JSX.Element {
  return (
    <nav
      class="sidebar"
      aria-label="Notes sidebar"
      style={{ display: 'flex', 'flex-direction': 'column', height: '100%' }}
    >
      {/* ── Header ── */}
      <header class="sidebar-header">
        <h1 class="app-name">
          Ink<span class="app-name-dot">.</span>
        </h1>
        <button
          class="new-note-btn"
          onClick={() => {
            const id = createNote();
            setActiveNoteId(id);
          }}
          aria-label="New note"
          title="New note"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            stroke-width="1.75"
            stroke-linecap="round"
          >
            <path d="M8 2v12M2 8h12" />
          </svg>
        </button>
      </header>

      {/* ── Search ── */}
      <Search />

      {/* ── Note list ── */}
      <Show
        when={filteredNotes().length > 0}
        fallback={
          <p class="empty-state">
            {store.searchQuery
              ? `No notes matching "${store.searchQuery}".`
              : 'No notes yet. Press + to create one.'}
          </p>
        }
      >
        <ul
          class="notes-ul"
          role="listbox"
          aria-label="Note list"
          aria-multiselectable="false"
        >
          <For each={filteredNotes()}>
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
      <footer class="sidebar-footer">
        <span
          class="note-count"
          aria-live="polite"
          aria-label={`${store.notes.length} notes total`}
        >
          {store.notes.length} {store.notes.length === 1 ? 'note' : 'notes'}
        </span>
      </footer>
    </nav>
  );
}
