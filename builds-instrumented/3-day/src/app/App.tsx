/**
 * App.tsx — root application shell
 *
 * Layout: sidebar | editor, 100vh, no scroll on body.
 * Mobile: sidebar is a CSS-transform overlay; hamburger button toggles it.
 * No router library — hash-based routing is handled in store.ts.
 *
 * Keyboard shortcuts:
 *   Ctrl+N / Cmd+N — new note
 *   Escape         — close sidebar on mobile
 */
import { createSignal, Show, onMount, onCleanup, type JSX } from 'solid-js';
import { store, createNote, setActiveNoteId, activeNote } from './store';
import { Sidebar } from '../sidebar/Sidebar';
import { Editor } from '../editor/Editor';
import * as css from '../design/global.css';

// Side-effect import — registers global styles and CSS custom properties.
// vanilla-extract requires the .css.ts file to be imported somewhere in the
// module graph for the plugin to emit the CSS. global.css.ts does both:
// it registers globalStyle() rules AND exports style() class names.
import '../design/global.css';

export function App(): JSX.Element {
  const [sidebarOpen, setSidebarOpen] = createSignal(false);
  const isNarrow = () => window.matchMedia('(max-width: 768px)').matches;

  function closeSidebar() {
    setSidebarOpen(false);
  }

  function toggleSidebar() {
    setSidebarOpen((v) => !v);
  }

  // Global keyboard shortcut: Ctrl/Cmd+N for new note
  function handleGlobalKeyDown(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
      e.preventDefault();
      const id = createNote();
      setActiveNoteId(id);
      closeSidebar();
    }
    if (e.key === 'Escape' && isNarrow()) {
      closeSidebar();
    }
  }

  onMount(() => {
    window.addEventListener('keydown', handleGlobalKeyDown);
  });

  onCleanup(() => {
    window.removeEventListener('keydown', handleGlobalKeyDown);
  });

  const hasActiveNote = () => store.activeNoteId !== null;

  return (
    <div
      class={css.appShell}
      // data-sidebar-open drives no direct CSS here — we use class composition below
    >
      {/* ── Mobile backdrop ── */}
      <div
        class={`${css.backdrop}${sidebarOpen() ? ` ${css.backdropVisible}` : ''}`}
        onClick={closeSidebar}
        aria-hidden="true"
      />

      {/* ── Sidebar ── */}
      <div
        class={`${css.sidebarShell}${sidebarOpen() ? ` ${css.sidebarShellOpen}` : ''}`}
        aria-hidden={isNarrow() && !sidebarOpen() ? 'true' : 'false'}
      >
        <Sidebar onNewNote={closeSidebar} />
      </div>

      {/* ── Editor pane ── */}
      <div class={css.editorShell}>
        {/* Mobile hamburger */}
        <button
          class={css.mobileMenuBtn}
          onClick={toggleSidebar}
          aria-label={sidebarOpen() ? 'Close notes list' : 'Open notes list'}
          aria-expanded={sidebarOpen()}
          aria-controls="sidebar"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path
              d="M2 4.5h14M2 9h14M2 13.5h14"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
        </button>

        {/* Welcome state when no note selected */}
        <Show
          when={hasActiveNote()}
          fallback={
            <div class={css.welcomePane}>
              <h2 class={css.welcomeTitle}>Ink</h2>
              <p class={css.welcomeSubtitle}>
                Select a note from the sidebar, or create a new one to start writing.
              </p>
            </div>
          }
        >
          <Editor />
        </Show>
      </div>
    </div>
  );
}
