/**
 * NoteList.tsx — Sidebar note list with search
 *
 * Design decisions encoded here:
 *
 *   1. Solid's <For> is keyed by note.id reference. Only items that change
 *      (active state toggle) re-render. 200 notes in the list = 200 stable DOM
 *      nodes. No virtual windowing needed at realistic note counts.
 *
 *   2. Search is controlled by the store (not local component state) so that
 *      the search query persists across sidebar-collapse/expand cycles on
 *      narrow viewports.
 *
 *   3. The note title is editable via a double-click on the title text. This
 *      avoids a separate "rename" modal and keeps the interaction inline.
 *      The rename commits on blur or Enter; cancels on Escape.
 *
 *   4. The dirty dot is a tiny CSS circle driven by the isDirty signal from
 *      Editor.tsx. It uses a CSS opacity transition (200ms) — appears
 *      immediately on keystroke, fades after the 400ms debounce saves.
 *
 *   5. Delete is a single-click button that appears on hover. No confirmation
 *      dialog — at single-user scale, the cost of accidental deletion is low
 *      and the friction of a confirmation dialog is high. (A future undo stack
 *      would be a better safety net than a modal.)
 *
 * Visual spec (see tokens.ts for values):
 *   - App name "Ink" uses font.display at fontSize['2xl'], fontWeight.bold
 *   - Note titles use font.display at fontSize.md, fontWeight.semibold
 *   - Snippets use font.ui at fontSize.sm, color.inkSecondary
 *   - Active note: bgActive background, left border 2px accent color
 *   - Dirty dot: 6px circle, color.dirty, opacity 0/1 transition
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
} from './store';
import { isDirty } from './Editor';

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
    // Focus the input after Solid renders it
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
      {/* Dirty indicator dot — visible only when this note is active and dirty */}
      <Show when={props.isActive}>
        <span
          class="dirty-dot"
          classList={{ 'is-visible': isDirty() }}
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

      {/* Snippet preview */}
      <Show when={props.note.snippet}>
        <p class="note-snippet">{props.note.snippet}</p>
      </Show>

      {/* Delete button — appears on hover via CSS */}
      <button
        class="note-delete-btn"
        aria-label={`Delete note: ${props.note.title}`}
        onClick={(e) => {
          e.stopPropagation();
          removeNote(props.note.id);
        }}
        tabIndex={props.isActive ? 0 : -1}
      >
        {/* Inline SVG: ×  */}
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

// ─── NoteList (sidebar root) ──────────────────────────────────────────────────

export function NoteList(): JSX.Element {
  return (
    <nav class="sidebar" aria-label="Notes">
      {/* ── Header ── */}
      <header class="sidebar-header">
        <h1 class="app-name">Ink</h1>
        <button
          class="new-note-btn"
          onClick={() => setActiveNoteId(createNote())}
          aria-label="New note"
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

      {/* ── Note list ── */}
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

      {/* ── Footer metadata ── */}
      <footer class="sidebar-footer">
        <span class="note-count" aria-live="polite">
          {store.notes.length} {store.notes.length === 1 ? 'note' : 'notes'}
        </span>
      </footer>
    </nav>
  );
}
