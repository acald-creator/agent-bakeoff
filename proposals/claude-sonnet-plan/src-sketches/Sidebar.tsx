/**
 * Sidebar component — note list, search input, create/delete controls.
 * Demonstrates how SolidJS reactive primitives integrate with the Zustand store.
 */
import { createMemo, For, createSignal } from 'solid-js';
import { useNotesStore, Note } from '../src/store/notes-store';
import styles from './Sidebar.module.css';

export function Sidebar() {
  // Derived: filtered and sorted note list.
  // createMemo re-runs only when the reactive reads inside it change.
  const notes = createMemo((): Note[] => {
    const { notes, searchQuery } = useNotesStore.getState();
    const q = searchQuery.toLowerCase();
    return Object.values(notes)
      .filter(
        (n) =>
          !q ||
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q)
      )
      .sort((a, b) => b.updatedAt - a.updatedAt);
  });

  const activeId = createMemo(() => useNotesStore.getState().activeId);

  const handleCreate = () => {
    useNotesStore.getState().createNote();
  };

  const handleDelete = (id: string, e: MouseEvent) => {
    e.stopPropagation(); // don't also trigger setActiveId
    useNotesStore.getState().deleteNote(id);
  };

  return (
    <aside class={styles.sidebar}>
      <div class={styles.header}>
        <button class={styles.newBtn} onClick={handleCreate}>
          + New note
        </button>
        <SearchInput />
      </div>

      <nav class={styles.noteList} aria-label="Notes">
        <For each={notes()}>
          {(note) => (
            <div
              class={styles.noteItem}
              classList={{ [styles.active]: note.id === activeId() }}
              role="button"
              tabIndex={0}
              aria-current={note.id === activeId() ? 'page' : undefined}
              onClick={() => useNotesStore.getState().setActiveId(note.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ')
                  useNotesStore.getState().setActiveId(note.id);
              }}
            >
              <span class={styles.noteTitle}>{note.title || 'Untitled'}</span>
              <button
                class={styles.deleteBtn}
                aria-label={`Delete note: ${note.title}`}
                onClick={(e) => handleDelete(note.id, e)}
              >
                ×
              </button>
            </div>
          )}
        </For>
      </nav>
    </aside>
  );
}

function SearchInput() {
  const [value, setValue] = createSignal('');

  const handleInput = (e: InputEvent) => {
    const q = (e.currentTarget as HTMLInputElement).value;
    setValue(q);
    useNotesStore.getState().setSearchQuery(q);
  };

  return (
    <input
      type="search"
      class={styles.search}
      placeholder="Search notes…"
      value={value()}
      onInput={handleInput}
      aria-label="Search notes"
    />
  );
}
