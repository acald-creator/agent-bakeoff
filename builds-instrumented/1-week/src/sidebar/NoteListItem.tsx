/**
 * NoteListItem.tsx — Single note row in the sidebar.
 *
 * Features:
 *  - Double-click to rename (inline input, commits on blur/Enter, cancels on Escape)
 *  - Dirty dot: shown only when this note is active + isDirty signal is true
 *  - Delete button: appears on hover/focus (no confirmation — low stakes, fast UX)
 *  - aria-selected: for screen reader list semantics
 */
import { Show, createSignal, type JSX } from 'solid-js';
import { isDirty } from '../editor/Editor';
import { renameNote, removeNote, type Note } from '../app/store';

interface NoteListItemProps {
  note:     Note;
  isActive: boolean;
  onClick:  () => void;
}

export function NoteListItem(props: NoteListItemProps): JSX.Element {
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
    if (e.key === 'Enter')  { e.preventDefault(); commitRename(); }
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
      {/* Dirty dot — visible only when this note is active and has unsaved changes */}
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
            aria-label="Rename note"
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

      {/* Delete button */}
      <button
        class="note-delete-btn"
        aria-label={`Delete note: ${props.note.title}`}
        tabIndex={props.isActive ? 0 : -1}
        onClick={(e) => {
          e.stopPropagation();
          removeNote(props.note.id);
        }}
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
