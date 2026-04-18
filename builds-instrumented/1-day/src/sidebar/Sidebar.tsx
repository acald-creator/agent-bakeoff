/**
 * Sidebar.tsx — note list + search for Ink
 *
 * Solid's <For> is keyed by note.id. Only changed items re-render.
 * Search is store-controlled (survives narrow-viewport sidebar collapse).
 * Double-click note title to rename inline.
 * Dirty dot appears on active note when editor has unsaved changes.
 */
import { For, Show, createSignal, type JSX } from 'solid-js';
import {
  store,
  filteredNotes,
  setActiveNoteId,
  setSearchQuery,
  createNote,
  removeNote,
  renameNote,
  type Note,
} from '../app/store';
import { isDirty } from '../editor/Editor';

// ─── NoteListItem ─────────────────────────────────────────────────────────────

interface NoteListItemProps {
  note: Note;
  isActive: boolean;
  onClick: () => void;
}

function NoteListItem(props: NoteListItemProps): JSX.Element {
  const [isRenaming, setIsRenaming] = createSignal(false);
  let titleInput!: HTMLInputElement;

  function startRename(e: MouseEvent) {
    e.stopPropagation();
    setIsRenaming(true);
    requestAnimationFrame(() => {
      titleInput.value = props.note.title;
      titleInput.select();
    });
  }

  function commitRename() {
    const v = titleInput.value.trim();
    if (v && v !== props.note.title) renameNote(props.note.id, v);
    setIsRenaming(false);
  }

  function handleRenameKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter') { e.preventDefault(); commitRename(); }
    if (e.key === 'Escape') setIsRenaming(false);
  }

  return (
    <li
      class="note-list-item"
      classList={{ 'is-active': props.isActive }}
      onClick={props.onClick}
      role="option"
      aria-selected={props.isActive}
    >
      <Show when={props.isActive}>
        <span
          class="dirty-dot"
          classList={{ 'is-visible': isDirty() }}
          aria-hidden="true"
          title="Unsaved changes"
        />
      </Show>

      <Show
        when={!isRenaming()}
        fallback={
          <input
            ref={titleInput}
            class="note-title-input"
            type="text"
            onBlur={commitRename}
            onKeyDown={handleRenameKeyDown}
            onClick={(e) => e.stopPropagation()}
          />
        }
      >
        <span class="note-title" onDblClick={startRename}>
          {props.note.title}
        </span>
      </Show>

      <Show when={props.note.snippet}>
        <p class="note-snippet">{props.note.snippet}</p>
      </Show>

      <button
        class="note-delete-btn"
        aria-label={`Delete note: ${props.note.title}`}
        onClick={(e) => {
          e.stopPropagation();
          removeNote(props.note.id);
        }}
        tabIndex={props.isActive ? 0 : -1}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
          <path
            d="M1 1l10 10M11 1L1 11"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          />
        </svg>
      </button>
    </li>
  );
}

// ─── Sidebar root ─────────────────────────────────────────────────────────────

export function Sidebar(): JSX.Element {
  return (
    <nav class="sidebar" aria-label="Notes">
      <header class="sidebar-header">
        <h1 class="app-name">Ink</h1>
        <button
          class="new-note-btn"
          onClick={() => setActiveNoteId(createNote())}
          aria-label="New note"
          title="New note"
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

      <div class="search-wrapper" role="search">
        <svg
          class="search-icon"
          width="14"
          height="14"
          viewBox="0 0 14 14"
          aria-hidden="true"
        >
          <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" stroke-width="1.5" fill="none" />
          <path d="M9 9l3.5 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
        <input
          class="search-input"
          type="search"
          placeholder="Search notes…"
          value={store.searchQuery}
          onInput={(e) => setSearchQuery(e.currentTarget.value)}
          aria-label="Search notes"
        />
      </div>

      <Show
        when={filteredNotes().length > 0}
        fallback={
          <p class="empty-state">
            {store.searchQuery ? 'No matching notes.' : 'No notes yet.'}
          </p>
        }
      >
        <ul class="notes-ul" role="listbox" aria-label="Note list">
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

      <footer class="sidebar-footer">
        <span class="note-count" aria-live="polite">
          {store.notes.length} {store.notes.length === 1 ? 'note' : 'notes'}
        </span>
      </footer>
    </nav>
  );
}
