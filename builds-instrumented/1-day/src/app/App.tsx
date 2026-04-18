/**
 * App.tsx — root component wiring sidebar + editor
 *
 * Two-zone layout: sidebar (fixed width) | editor (flex: 1).
 * Show/hide overlay keyboard shortcut for new note (Cmd/Ctrl+N).
 * Empty-state prompt when no note is selected.
 */
import { Show, onMount, onCleanup, type JSX } from 'solid-js';
import { Sidebar } from '../sidebar/Sidebar';
import { Editor } from '../editor/Editor';
import { store, createNote, setActiveNoteId } from './store';
import { appShell, sidebarShell, editorShell } from './app.styles';

// Import global styles — vanilla-extract side-effect, registers globalStyle declarations
import '../design/global.styles';

export function App(): JSX.Element {
  // Keyboard shortcut: Cmd/Ctrl+N to create a new note
  function handleKeyDown(e: KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
      e.preventDefault();
      setActiveNoteId(createNote());
    }
  }

  onMount(() => {
    window.addEventListener('keydown', handleKeyDown);
  });

  onCleanup(() => {
    window.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <div class={appShell}>
      <div class={sidebarShell}>
        <Sidebar />
      </div>
      <div class={editorShell}>
        <Show
          when={store.activeNoteId}
          fallback={
            <div class="editor-empty-prompt">
              <span>Select a note to start writing</span>
              <span class="editor-empty-prompt-hint">or press Cmd+N to create one</span>
            </div>
          }
        >
          <Editor />
        </Show>
      </div>
    </div>
  );
}
