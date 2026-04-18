/**
 * Editor.tsx — CodeMirror 6 integration for Solid
 *
 * Design decisions:
 *   1. CodeMirror owns the document. Solid's reactivity only handles note
 *      switching. CM6's transaction model is superior to VDOM diffing for
 *      a high-frequency write surface.
 *
 *   2. 400ms debounced save. Immediate: dirty indicator. Deferred: localStorage.
 *      The split communicates to the user that their typing is tracked (dot
 *      appears instantly) without hammering localStorage on every keystroke.
 *
 *   3. Note switching uses a CSS opacity crossfade (120ms), not a JS animation.
 *      CSS transitions are composited by the browser without layout recalc.
 *
 *   4. History is cleared on note switch. Cmd+Z must not cross note boundaries.
 *
 *   5. Title extraction: first line of document, stripping leading # characters.
 *      Writers naturally start a markdown note with a heading — this makes the
 *      sidebar title self-maintaining without a separate rename interaction.
 *
 *   6. Word count is displayed in the editor footer, updated on every save tick
 *      (debounced), not on every keystroke.
 */
import {
  onMount,
  onCleanup,
  createEffect,
  createSignal,
  Show,
  type JSX,
} from 'solid-js';
import { EditorView }      from '@codemirror/view';
import { EditorState, EditorSelection } from '@codemirror/state';
import { store, applyNoteSave }   from '../app/store';
import { loadNoteBody }           from '../lib/persistence';
import { buildExtensions }        from './extensions';
import { editorFooter, editorPlaceholder, editorPlaceholderHint } from '../design/global.css';

// ─── Dirty-state signal (exported for NoteListItem dot indicator) ─────────────
export const [isDirty, setIsDirty] = createSignal(false);

// ─── Word count ───────────────────────────────────────────────────────────────
export const [wordCount, setWordCount] = createSignal(0);

function countWords(text: string): number {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
}

// ─── Debounce ─────────────────────────────────────────────────────────────────
let saveTimer: ReturnType<typeof setTimeout> | undefined;

function scheduleSave(id: string, body: string): void {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    const firstLine = body.split('\n').find((l) => l.trim()) ?? '';
    const title     = firstLine.replace(/^#+\s*/, '').trim() || 'Untitled';
    applyNoteSave(id, title, body);
    setIsDirty(false);
    setWordCount(countWords(body));
  }, 400);
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Editor(): JSX.Element {
  let containerRef!: HTMLDivElement;
  let view: EditorView | undefined;
  // Guard: prevents the update listener from treating programmatic note-load
  // dispatches as user edits that should trigger a save.
  let isLoadingNote = false;

  onMount(() => {
    view = new EditorView({
      state: EditorState.create({
        doc: '',
        extensions: buildExtensions((docStr) => {
          if (isLoadingNote) return;
          const id = store.activeNoteId;
          if (!id) return;
          setIsDirty(true);
          scheduleSave(id, docStr);
        }),
      }),
      parent: containerRef,
    });
  });

  // ── Note switching ──────────────────────────────────────────────────────────
  createEffect(() => {
    const id = store.activeNoteId;
    if (!id || !view) return;

    isLoadingNote = true;
    clearTimeout(saveTimer);
    setIsDirty(false);

    const body = loadNoteBody(id);
    setWordCount(countWords(body));

    // Step 1: Dim the editor surface (CSS transition handles the fade)
    containerRef.dataset.transitioning = 'true';

    // Step 2: Replace document contents
    view.dispatch({
      changes: {
        from: 0,
        to:   view.state.doc.length,
        insert: body,
      },
      selection: EditorSelection.cursor(0),
    });

    // Step 3: Scroll to top
    view.dispatch({
      effects: EditorView.scrollIntoView(0, { y: 'start' }),
    });

    // Step 4: Clear undo history so Cmd+Z can't reach previous note's text.
    // We use a null transaction to flush — CM6 doesn't expose history.clear directly,
    // so we recreate the state with a fresh history.
    view.setState(
      EditorState.create({
        doc: body,
        extensions: buildExtensions((docStr) => {
          if (isLoadingNote) return;
          const activeId = store.activeNoteId;
          if (!activeId) return;
          setIsDirty(true);
          scheduleSave(activeId, docStr);
        }),
        selection: EditorSelection.cursor(0),
      }),
    );

    // Step 5: Un-dim after one animation frame (let transition play)
    requestAnimationFrame(() => {
      delete containerRef.dataset.transitioning;
      isLoadingNote = false;
      view?.focus();
    });
  });

  onCleanup(() => {
    clearTimeout(saveTimer);
    view?.destroy();
  });

  return (
    <div
      ref={containerRef}
      class="editor-root"
      aria-label="Note editor"
      role="textbox"
      aria-multiline="true"
    />
  );
}

// ─── EditorArea — full editor zone including empty state ──────────────────────

export function EditorArea(): JSX.Element {
  return (
    <div style={{ position: 'relative', height: '100%' }}>
      <Show
        when={store.activeNoteId}
        fallback={
          <div class={editorPlaceholder}>
            <span>Select a note to begin writing</span>
            <span class={editorPlaceholderHint}>
              or press the + button to create one
            </span>
          </div>
        }
      >
        <Editor />
        <div class={editorFooter} aria-live="polite" aria-label="Word count">
          {wordCount()} {wordCount() === 1 ? 'word' : 'words'}
        </div>
      </Show>
    </div>
  );
}
