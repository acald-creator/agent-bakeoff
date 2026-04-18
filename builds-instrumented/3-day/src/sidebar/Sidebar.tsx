/**
 * Sidebar.tsx — note list with search and keyboard navigation
 *
 * Accessibility:
 *   - The note list uses role="listbox" / role="option" with aria-selected.
 *   - Keyboard navigation: arrow keys move focus between items; Enter/Space
 *     activate; Delete key triggers delete on focused item.
 *   - Search input is role="searchbox" with aria-controls pointing to the list.
 *   - aria-live="polite" on the note count announces add/remove to screen readers.
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
import * as css from './sidebar.css';

// ─── NoteListItem ─────────────────────────────────────────────────────────────

interface NoteListItemProps {
  note:     Note;
  isActive: boolean;
  onActivate: () => void;
  onDelete:   () => void;
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
    const v = titleInput?.value.trim();
    if (v && v !== props.note.title) renameNote(props.note.id, v);
    setIsRenaming(false);
  }

  function handleRenameKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter')  { e.preventDefault(); commitRename(); }
    if (e.key === 'Escape') { setIsRenaming(false); }
  }

  function handleItemKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      props.onActivate();
    }
    if (e.key === 'Delete' || e.key === 'Backspace') {
      // Only delete via keyboard when item is focused (not input)
      if (document.activeElement !== titleInput) {
        e.preventDefault();
        props.onDelete();
      }
    }
    // Arrow navigation is handled at the list level (see NoteListbox)
  }

  return (
    <li
      class={css.noteItem}
      data-active={String(props.isActive)}
      onClick={props.onActivate}
      onKeyDown={handleItemKeyDown}
      role="option"
      aria-selected={props.isActive}
      tabIndex={0}
    >
      {/* Dirty indicator — only when this note is active */}
      <Show when={props.isActive}>
        <span
          class={css.dirtyDot}
          data-visible={String(isDirty())}
          aria-hidden="true"
          title="Unsaved changes"
        />
      </Show>

      {/* Title — double-click to rename */}
      <Show
        when={!isRenaming()}
        fallback={
          <input
            ref={titleInput}
            class={css.noteTitleInput}
            type="text"
            onBlur={commitRename}
            onKeyDown={handleRenameKeyDown}
            onClick={(e) => e.stopPropagation()}
            aria-label={`Rename note: ${props.note.title}`}
          />
        }
      >
        <span class={css.noteTitle} onDblClick={startRename} title={props.note.title}>
          {props.note.title}
        </span>
      </Show>

      {/* Snippet preview */}
      <Show when={props.note.snippet}>
        <p class={css.noteSnippet}>{props.note.snippet}</p>
      </Show>

      {/* Delete button */}
      <button
        class={css.deleteBtn}
        data-delete-btn
        aria-label={`Delete note: ${props.note.title}`}
        onClick={(e) => { e.stopPropagation(); props.onDelete(); }}
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

// ─── NoteListbox — handles arrow key navigation ───────────────────────────────

function NoteListbox(): JSX.Element {
  let listRef!: HTMLUListElement;

  function handleListKeyDown(e: KeyboardEvent) {
    const items = Array.from(listRef.querySelectorAll<HTMLLIElement>('[role="option"]'));
    const focused = document.activeElement as HTMLElement;
    const currentIndex = items.indexOf(focused as HTMLLIElement);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = items[currentIndex + 1] ?? items[0];
      next?.focus();
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = items[currentIndex - 1] ?? items[items.length - 1];
      prev?.focus();
    }
    if (e.key === 'Home') {
      e.preventDefault();
      items[0]?.focus();
    }
    if (e.key === 'End') {
      e.preventDefault();
      items[items.length - 1]?.focus();
    }
  }

  const notes = filteredNotes;

  return (
    <Show
      when={notes().length > 0}
      fallback={
        <p class={css.emptyState} aria-live="polite">
          {store.searchQuery ? 'No matching notes.' : 'No notes yet. Create one above.'}
        </p>
      }
    >
      <ul
        ref={listRef}
        class={css.notesUl}
        role="listbox"
        aria-label="Notes"
        aria-multiselectable="false"
        onKeyDown={handleListKeyDown}
      >
        <For each={notes()}>
          {(note) => (
            <NoteListItem
              note={note}
              isActive={store.activeNoteId === note.id}
              onActivate={() => setActiveNoteId(note.id)}
              onDelete={() => removeNote(note.id)}
            />
          )}
        </For>
      </ul>
    </Show>
  );
}

// ─── Sidebar root ─────────────────────────────────────────────────────────────

interface SidebarProps {
  onNewNote?: () => void;
}

export function Sidebar(props: SidebarProps): JSX.Element {
  const listboxId = 'note-listbox';

  function handleNewNote() {
    const id = createNote();
    setActiveNoteId(id);
    props.onNewNote?.();
  }

  return (
    <nav class={css.sidebarNav} aria-label="Notes navigation">
      {/* ── Header ── */}
      <header class={css.sidebarHeader}>
        <h1 class={css.appName}>Ink</h1>
        <button
          class={css.newNoteBtn}
          onClick={handleNewNote}
          aria-label="New note (Ctrl+N)"
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

      {/* ── Search ── */}
      <div class={css.searchWrapper} role="search">
        <svg
          class={css.searchIcon}
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
          class={css.searchInput}
          type="search"
          id="note-search"
          placeholder="Search notes…"
          value={store.searchQuery}
          onInput={(e) => setSearchQuery(e.currentTarget.value)}
          aria-label="Search notes"
          aria-controls={listboxId}
          autocomplete="off"
        />
      </div>

      {/* ── Note list ── */}
      <NoteListbox />

      {/* ── Footer ── */}
      <footer class={css.sidebarFooter}>
        <span class={css.noteCount} aria-live="polite">
          {store.notes.length === 1 ? '1 note' : `${store.notes.length} notes`}
        </span>
      </footer>
    </nav>
  );
}
