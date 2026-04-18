import { Show, type JSX } from 'solid-js';
import { Sidebar } from '../sidebar/Sidebar';
import { Editor, EditorPlaceholder } from '../editor/Editor';
import { store } from './store';
// Import vanilla-extract global styles to register them
import '../design/tokens.css';
import '../design/global.css';

export function App(): JSX.Element {
  return (
    <div class="app-shell">
      <Sidebar />
      <main class="editor-shell">
        <Show when={store.activeNoteId} fallback={<EditorPlaceholder />}>
          <Editor />
        </Show>
      </main>
    </div>
  );
}
