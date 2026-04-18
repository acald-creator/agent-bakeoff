/**
 * App.tsx — Root layout shell.
 *
 * Layout: flex row, sidebar | editor.
 * Mobile: sidebar is a translateX-off-screen sheet; hamburger toggle opens it.
 * Clicking the overlay or pressing Escape closes it.
 *
 * Word count is shown in the editor pane toolbar.
 * Keyboard shortcuts: Cmd/Ctrl+N (new note), Escape (close sidebar) — handled
 * in Editor.tsx's global keydown listener so they work even when sidebar focused.
 */
import { Show, createSignal, type JSX } from 'solid-js';
import { appShell, sidebarShell, editorShell, sidebarOverlay, hamburgerBtn } from '../design/global.css';
import { NoteList }  from '../sidebar/NoteList';
import { Editor }    from '../editor/Editor';
import { store }     from './store';
import { wordCount } from '../editor/Editor';

export function App(): JSX.Element {
  const [sidebarOpen, setSidebarOpen] = createSignal(false);

  function toggleSidebar() {
    setSidebarOpen((v) => !v);
  }

  function closeSidebar() {
    setSidebarOpen(false);
  }

  return (
    <div
      class={appShell}
      data-sidebar-open={sidebarOpen() ? '' : undefined}
    >
      {/* Mobile overlay — click to close sidebar */}
      <div
        class={sidebarOverlay}
        onClick={closeSidebar}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside id="sidebar" class={sidebarShell} aria-label="Sidebar">
        <NoteList />
      </aside>

      {/* Editor pane */}
      <main class={editorShell}>
        {/* Mobile hamburger — only visible at ≤768px via CSS */}
        <button
          class={hamburgerBtn}
          onClick={toggleSidebar}
          aria-label={sidebarOpen() ? 'Close sidebar' : 'Open sidebar'}
          aria-expanded={sidebarOpen()}
          aria-controls="sidebar"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path
              d="M2 4h14M2 9h14M2 14h14"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
        </button>

        {/* Word count bar — only when a note is open */}
        <Show when={store.activeNoteId}>
          <div class="editor-toolbar" role="toolbar" aria-label="Editor tools">
            <span
              class="editor-word-count"
              aria-live="polite"
              aria-atomic="true"
              aria-label={`Word count: ${wordCount()}`}
            >
              {wordCount() === 1 ? '1 word' : `${wordCount()} words`}
            </span>
          </div>
        </Show>

        {/* Editor or placeholder */}
        <Show
          when={store.activeNoteId}
          fallback={
            <div class="editor-placeholder" aria-label="No note selected">
              <span class="editor-placeholder-title">Ink</span>
              <span class="editor-placeholder-hint">
                Select a note or press <kbd>⌘N</kbd> to create one.
              </span>
            </div>
          }
        >
          <Editor />
        </Show>
      </main>
    </div>
  );
}
