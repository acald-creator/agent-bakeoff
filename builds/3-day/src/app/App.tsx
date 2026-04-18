/**
 * App.tsx — root layout component
 *
 * Layout: sidebar | editor surface. Hard-split, no border-radius.
 * Mobile: sidebar slides in as a sheet over the editor.
 *
 * Design: thin sidebar with warm neutral background, full-height editor
 * surface. The only colored element is the accent red on the active note
 * border and the dirty-dot indicator.
 */
import { createSignal, Show, type JSX } from 'solid-js';
import { Sidebar } from '../sidebar/Sidebar';
import { EditorArea } from '../editor/Editor';
import { appShell, sidebarShell, editorShell, mobileMenuBtn } from '../design/global.css';

export function App(): JSX.Element {
  const [mobileSidebarOpen, setMobileSidebarOpen] = createSignal(false);

  return (
    <div
      class={appShell}
      classList={{ 'sidebar-open': mobileSidebarOpen() }}
    >
      {/* Mobile hamburger — only visible below 768px */}
      <button
        class={mobileMenuBtn}
        onClick={() => setMobileSidebarOpen((v) => !v)}
        aria-label={mobileSidebarOpen() ? 'Close sidebar' : 'Open sidebar'}
        aria-expanded={mobileSidebarOpen()}
      >
        <Show
          when={mobileSidebarOpen()}
          fallback={
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
              <path d="M2 4h12M2 8h12M2 12h12" />
            </svg>
          }
        >
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
            <path d="M2 2l12 12M14 2L2 14" />
          </svg>
        </Show>
      </button>

      {/* Sidebar */}
      <aside class={sidebarShell} aria-label="Notes sidebar">
        <Sidebar />
      </aside>

      {/* Editor area */}
      <main class={editorShell} aria-label="Note editor">
        <EditorArea />
      </main>
    </div>
  );
}
