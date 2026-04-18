/**
 * Editor.tsx — CodeMirror 6 integration for Solid
 *
 * Design decisions encoded here:
 *
 *   1. CodeMirror owns the document. Solid's reactivity does not manage the
 *      editor content — only the note-switching signal. This is intentional:
 *      CM6's internal transaction model is superior to VDOM diffing for a
 *      high-frequency write surface.
 *
 *   2. 400ms debounced save. Immediate: dirty indicator. Deferred: localStorage.
 *      The split communicates to the user that their typing is tracked (dot
 *      appears instantly) without hammering localStorage on every keystroke.
 *
 *   3. Note switching uses a CSS opacity crossfade (120ms), not a JS animation.
 *      CSS transitions are composited by the browser without layout recalc;
 *      JS animations at this granularity would cause frame drops.
 *
 *   4. History is cleared on note switch. Cmd+Z must not cross note boundaries —
 *      that would be a shocking and destructive surprise for the user.
 *
 *   5. The "title extraction" heuristic: the first line of the document is used
 *      as the note title in the sidebar, stripping leading # characters.
 *      This aligns with how writers naturally structure a markdown document.
 *
 *   6. Word count is derived from the document string and displayed in a footer
 *      — added beyond the proposal because it costs nothing and writers always
 *      want it.
 */
import {
  onMount,
  onCleanup,
  createEffect,
  createSignal,
  Show,
  type Component,
} from 'solid-js';
import { EditorView }                      from 'codemirror';
import { EditorState, EditorSelection }    from '@codemirror/state';
import type { ViewUpdate }                 from '@codemirror/view';
import { store, applyNoteSave, createNote, setActiveNoteId } from '../app/store';
import { loadNoteBody }                    from '../lib/persistence';
import { extractTitle }                    from '../lib/search';
import { buildExtensions }                 from './extensions';
import {
  editorRoot,
  emptyEditorWrapper,
  emptyEditorIcon,
  emptyEditorTitle,
  emptyEditorSubtitle,
  emptyEditorNewBtn,
  editorFooter,
} from './theme.css.ts';

// ─── Dirty-state signal (exported for NoteListItem dot indicator) ─────────────

export const [isDirty, setIsDirty] = createSignal(false);

// ─── Word count signal ────────────────────────────────────────────────────────

export const [wordCount, setWordCount] = createSignal(0);

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

// ─── Debounce ─────────────────────────────────────────────────────────────────

let saveTimer: ReturnType<typeof setTimeout> | undefined;

function scheduleSave(id: string, body: string): void {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    const title = extractTitle(body);
    applyNoteSave(id, title, body);
    setIsDirty(false);
  }, 400);
}

// ─── Component ────────────────────────────────────────────────────────────────

const Editor: Component = () => {
  let container!: HTMLDivElement;
  // viewReady is a reactive signal so createEffect re-runs when the view is mounted
  const [viewReady, setViewReady] = createSignal(false);
  let view: EditorView | undefined;
  // Guard: prevents the update listener from treating programmatic note-load
  // dispatches as user edits that should trigger a save.
  let isLoadingNote = false;

  function makeUpdateListener() {
    return (update: ViewUpdate) => {
      if (!update.docChanged || isLoadingNote) return;
      const id = store.activeNoteId;
      if (!id) return;
      setIsDirty(true);
      const body = update.state.doc.toString();
      setWordCount(countWords(body));
      scheduleSave(id, body);
    };
  }

  onMount(() => {
    view = new EditorView({
      state: EditorState.create({
        doc: '',
        extensions: buildExtensions(makeUpdateListener()),
      }),
      parent: container,
    });
    // Signal that the view is ready — triggers createEffect to run with a real view
    setViewReady(true);
  });

  // ── Note switching ──────────────────────────────────────────────────────────
  createEffect(() => {
    // Track viewReady so this effect re-runs when the EditorView is mounted
    const isReady = viewReady();
    const id = store.activeNoteId;
    const v = view;
    if (!isReady || !id || !v) return;

    isLoadingNote = true;
    clearTimeout(saveTimer);
    setIsDirty(false);

    const body = loadNoteBody(id);
    setWordCount(countWords(body));

    // Step 1: Dim the editor surface (CSS transition handles the fade)
    container.dataset['transitioning'] = 'true';

    // Step 2: Replace the entire editor state — this atomically resets the
    // document AND clears undo history so Cmd+Z can't reach the previous note.
    v.setState(
      EditorState.create({
        doc: body,
        extensions: buildExtensions(makeUpdateListener()),
        selection: EditorSelection.cursor(0),
      }),
    );

    // Step 3: Un-dim after one animation frame (let the transition play)
    requestAnimationFrame(() => {
      delete container.dataset['transitioning'];
      isLoadingNote = false;
      v.focus();
      // Ensure scroll is at top
      v.dispatch({ effects: EditorView.scrollIntoView(0, { y: 'start' }) });
    });
  });

  onCleanup(() => {
    clearTimeout(saveTimer);
    view?.destroy();
  });

  return (
    <div
      ref={container}
      class={editorRoot}
      aria-label="Note editor"
      role="textbox"
      aria-multiline="true"
    />
  );
};

// ─── EditorPane — wraps Editor with empty-state handling ──────────────────────

export const EditorPane: Component = () => {
  return (
    <Show
      when={store.activeNoteId}
      fallback={
        <div class={emptyEditorWrapper} role="main" aria-label="No note selected">
          <svg
            class={emptyEditorIcon}
            viewBox="0 0 48 48"
            fill="none"
            aria-hidden="true"
          >
            <rect x="8" y="6" width="32" height="36" rx="2" stroke="currentColor" stroke-width="1.5" />
            <line x1="15" y1="16" x2="33" y2="16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            <line x1="15" y1="22" x2="33" y2="22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            <line x1="15" y1="28" x2="25" y2="28" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
          <p class={emptyEditorTitle}>Nothing open</p>
          <p class={emptyEditorSubtitle}>
            Select a note from the sidebar,<br />or create a new one to start writing.
          </p>
          <button
            class={emptyEditorNewBtn}
            onClick={() => setActiveNoteId(createNote())}
            aria-label="Create a new note"
          >
            New note
          </button>
        </div>
      }
    >
      <div style={{ position: 'relative', height: '100%' }}>
        <Editor />
        <Show when={wordCount() > 0}>
          <div class={editorFooter} aria-live="polite" aria-label={`${wordCount()} words`}>
            {wordCount().toLocaleString()} {wordCount() === 1 ? 'word' : 'words'}
          </div>
        </Show>
      </div>
    </Show>
  );
};

export default EditorPane;
