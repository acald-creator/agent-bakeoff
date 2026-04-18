/**
 * NoteListItem.tsx — individual note item in sidebar
 *
 * Features:
 *   - Click to switch notes
 *   - Double-click title to rename (inline editing, no modal)
 *   - Delete button on hover
 *   - Dirty indicator dot for active + unsaved note
 *   - Full keyboard accessibility
 */
import { createSignal, Show, type JSX } from 'solid-js';
import {
  renameNote,
  removeNote,
  type Note,
} from '../app/store';
import { isDirty } from '../editor/Editor';

interface NoteListItemProps {
  note:     Note;
  isActive: boolean;
  onClick:  () => void;
}

function formatDate(ms: number): string {
  const d = new Date(ms);
  const now = new Date();
  // Same day: show time
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  // Within a week: show day name
  const diffDays = Math.floor((now.getTime() - ms) / (1000 * 60 * 60 * 24));
  if (diffDays < 7) {
    return d.toLocaleDateString([], { weekday: 'short' });
  }
  // Otherwise: month + day
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function NoteListItem(props: NoteListItemProps): JSX.Element {
  const [isRenaming, setIsRenaming] = createSignal(false);
  let titleInputRef!: HTMLInputElement;

  function startRename(e: MouseEvent) {
    e.stopPropagation();
    setIsRenaming(true);
    requestAnimationFrame(() => {
      titleInputRef.value = props.note.title;
      titleInputRef.select();
    });
  }

  function commitRename() {
    const v = titleInputRef.value.trim();
    if (v && v !== props.note.title) {
      renameNote(props.note.id, v);
    }
    setIsRenaming(false);
  }

  function handleRenameKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter')  { e.preventDefault(); commitRename(); }
    if (e.key === 'Escape') { setIsRenaming(false); }
  }

  function handleDeleteKey(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      removeNote(props.note.id);
    }
  }

  return (
    <li
      class="note-list-item"
      classList={{ 'is-active': props.isActive }}
      onClick={props.onClick}
      role="option"
      aria-selected={props.isActive}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          props.onClick();
        }
      }}
    >
      {/* Dirty indicator dot — only for active + unsaved note */}
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
            ref={titleInputRef}
            class="note-title-input"
            type="text"
            aria-label="Rename note"
            onBlur={commitRename}
            onKeyDown={handleRenameKeyDown}
            onClick={(e) => e.stopPropagation()}
          />
        }
      >
        <span
          class="note-title"
          onDblClick={startRename}
          title={`${props.note.title} (double-click to rename)`}
        >
          {props.note.title}
        </span>
      </Show>

      {/* Snippet preview */}
      <Show when={props.note.snippet}>
        <p class="note-snippet">{props.note.snippet}</p>
      </Show>

      {/* Date */}
      <time
        class="note-meta"
        dateTime={new Date(props.note.updatedAt).toISOString()}
      >
        {formatDate(props.note.updatedAt)}
      </time>

      {/* Delete button — appears on hover via CSS */}
      <button
        class="note-delete-btn"
        aria-label={`Delete "${props.note.title}"`}
        tabIndex={props.isActive ? 0 : -1}
        onClick={(e) => {
          e.stopPropagation();
          removeNote(props.note.id);
        }}
        onKeyDown={handleDeleteKey}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
        >
          <path d="M1 1l10 10M11 1L1 11" />
        </svg>
      </button>
    </li>
  );
}
