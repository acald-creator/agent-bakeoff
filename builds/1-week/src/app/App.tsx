/**
 * App.tsx — Root application component.
 *
 * Owns the two-zone layout: sidebar | editor.
 * Also owns the mobile sidebar toggle (hamburger menu on <768px viewports).
 *
 * The sidebar is always visible on wide viewports. On narrow viewports it slides
 * in as an overlay sheet. This is handled with CSS transforms + a Solid signal.
 *
 * Keyboard global shortcuts:
 *   - Cmd+N / Ctrl+N: New note
 *   - Escape: Close mobile sidebar
 */
import { createSignal, Show, type Component } from 'solid-js';
import { NoteList }   from '../sidebar/NoteList';
import { EditorPane } from '../editor/Editor';
import { createNote, setActiveNoteId } from './store';
import {
  appShell,
  sidebarShell,
  editorShell,
  sidebarOverlay,
  sidebarOverlayOpen,
  mobileBackdrop,
  mobileBackdropVisible,
  mobileMenuBtn,
} from '../design/global.css.ts';

const App: Component = () => {
  const [sidebarOpen, setSidebarOpen] = createSignal(false);

  // Global keyboard shortcuts
  function handleKeyDown(e: KeyboardEvent) {
    // Cmd+N / Ctrl+N — new note
    if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
      e.preventDefault();
      const id = createNote();
      setActiveNoteId(id);
      setSidebarOpen(false); // close on mobile after creating
    }
    // Escape — close mobile sidebar
    if (e.key === 'Escape' && sidebarOpen()) {
      setSidebarOpen(false);
    }
  }

  return (
    <div
      class={appShell}
      onKeyDown={handleKeyDown}
    >
      {/* ── Mobile hamburger ── */}
      <button
        class={mobileMenuBtn}
        onClick={() => setSidebarOpen(true)}
        aria-label="Open note list"
        aria-expanded={sidebarOpen()}
        aria-controls="sidebar"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
          <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
      </button>

      {/* ── Mobile backdrop ── */}
      <div
        class={`${mobileBackdrop} ${sidebarOpen() ? mobileBackdropVisible : ''}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* ── Sidebar ── */}
      <aside
        id="sidebar"
        class={`${sidebarShell} ${sidebarOverlay} ${sidebarOpen() ? sidebarOverlayOpen : ''}`}
        aria-label="Note list"
      >
        <NoteList />
      </aside>

      {/* ── Editor ── */}
      <main class={editorShell} aria-label="Note editor">
        <EditorPane />
      </main>
    </div>
  );
};

export default App;
