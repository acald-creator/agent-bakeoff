/**
 * NoteListItem.tsx — A single note entry in the sidebar list.
 *
 * Features:
 *   - Double-click on title to rename inline (commits on Enter/blur, cancels on Escape)
 *   - Dirty dot indicator (only visible when this note is active and has unsaved changes)
 *   - Delete button (appears on hover/focus, no confirmation dialog)
 *   - Full keyboard navigation: Tab to reach, Enter to open, double-click or
 *     dedicated keyboard shortcut (F2) to rename
 *
 * Accessibility:
 *   - role="option" on the li element (parent ul is role="listbox")
 *   - aria-selected reflects active state
 *   - aria-label on delete button names the specific note
 *   - Delete button is tabbable only when active (tabIndex -1 otherwise)
 */
import { createSignal, Show, type Component } from 'solid-js';
import { renameNote, removeNote, type Note } from '../app/store';
import { isDirty } from '../editor/Editor';
import {
  noteListItem,
  noteListItemActive,
  noteTitle,
  noteTitleInput,
  noteSnippet,
  noteDate,
  dirtyDot,
  dirtyDotVisible,
  deleteBtn,
  deleteBtnVisible,
} from './sidebar.css.ts';

interface NoteListItemProps {
  note:     Note;
  isActive: boolean;
  onClick:  () => void;
}

export const NoteListItem: Component<NoteListItemProps> = (props) => {
  const [isRenaming, setIsRenaming] = createSignal(false);
  let titleInput!: HTMLInputElement;
  // hover tracked for delete button visibility
  const [isHovered, setIsHovered] = createSignal(false);

  function startRename(e: Event) {
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
    if (e.key === 'Escape') { setIsRenaming(false); }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      props.onClick();
    }
    if (e.key === 'F2') {
      e.preventDefault();
      startRename(e);
    }
  }

  function formatDate(ms: number): string {
    const d = new Date(ms);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) {
      return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
    }
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7)  return `${diffDays}d ago`;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  return (
    <li
      class={`${noteListItem} ${props.isActive ? noteListItemActive : ''}`}
      onClick={props.onClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="option"
      aria-selected={props.isActive}
      tabIndex={0}
    >
      {/* Dirty indicator dot — visible only when this note is active and dirty */}
      <Show when={props.isActive}>
        <span
          class={`${dirtyDot} ${isDirty() ? dirtyDotVisible : ''}`}
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
            class={noteTitleInput}
            type="text"
            aria-label={`Rename note: ${props.note.title}`}
            onBlur={commitRename}
            onKeyDown={handleRenameKeyDown}
            onClick={(e) => e.stopPropagation()}
          />
        }
      >
        <span
          class={noteTitle}
          onDblClick={startRename}
          title={`${props.note.title} — double-click to rename`}
        >
          {props.note.title}
        </span>
      </Show>

      {/* Snippet preview */}
      <Show when={props.note.snippet}>
        <span class={noteSnippet}>{props.note.snippet}</span>
      </Show>

      {/* Relative date */}
      <time
        class={noteDate}
        dateTime={new Date(props.note.updatedAt).toISOString()}
        aria-label={`Last edited ${formatDate(props.note.updatedAt)}`}
      >
        {formatDate(props.note.updatedAt)}
      </time>

      {/* Delete button — appears on hover/active */}
      <button
        class={`${deleteBtn} ${(isHovered() || props.isActive) ? deleteBtnVisible : ''}`}
        aria-label={`Delete note: ${props.note.title}`}
        title="Delete note"
        onClick={(e) => {
          e.stopPropagation();
          removeNote(props.note.id);
        }}
        tabIndex={props.isActive ? 0 : -1}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" focusable="false">
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
};
