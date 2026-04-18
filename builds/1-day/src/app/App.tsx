import { Show, type JSX } from 'solid-js';
import { Sidebar } from '../sidebar/Sidebar';
import { Editor } from '../editor/Editor';
import { store, createNote, setActiveNoteId } from './store';

export function App(): JSX.Element {
  function handleStart() {
    const id = createNote();
    setActiveNoteId(id);
  }

  return (
    <div class="app-shell">
      <Sidebar />
      <main class="editor-pane">
        <Show
          when={store.activeNoteId}
          fallback={
            <div class="editor-empty-state">
              <div class="empty-state-content">
                <h2 class="empty-state-heading">Nothing open.</h2>
                <p class="empty-state-sub">Select a note from the sidebar, or start a new one.</p>
                <button class="empty-state-btn" onClick={handleStart}>
                  New note
                </button>
              </div>
            </div>
          }
        >
          <Editor />
        </Show>
      </main>
    </div>
  );
}
