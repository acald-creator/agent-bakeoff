import { Show, type JSX } from 'solid-js';
import { Sidebar } from '../sidebar/Sidebar';
import { Editor } from '../editor/Editor';
import { store, createNote, setActiveNoteId } from './store';

// Import global styles — vanilla-extract processes .css.ts at build time
import '../design/tokens.css.ts';
import '../design/global.css.ts';

export function App(): JSX.Element {
  return (
    <div class="app-shell">
      <Sidebar />
      <main class="editor-shell">
        <Show
          when={store.activeNoteId}
          fallback={
            <div class="no-note-placeholder">
              <h2>Ink</h2>
              <p>Select a note or create a new one</p>
              <button
                class="new-note-btn"
                style="width: auto; padding: 0.5rem 1rem; font-family: inherit; font-size: 0.875rem;"
                onClick={() => {
                  const id = createNote();
                  setActiveNoteId(id);
                }}
              >
                + New note
              </button>
            </div>
          }
        >
          <Editor />
        </Show>
      </main>
    </div>
  );
}
