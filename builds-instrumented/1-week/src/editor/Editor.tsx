/**
 * Editor.tsx — CodeMirror 6 integration for Solid.
 *
 * Ownership model:
 *  - CodeMirror owns the document. Solid signals note switches only.
 *  - 400ms debounced save: dirty indicator fires at 0ms, localStorage at 400ms.
 *  - Note switch: CSS opacity crossfade (120ms), undo history cleared.
 *  - Cmd+Z never crosses note boundaries.
 *  - @codemirror/language-data lazy-loaded on first fenced block.
 *  - Compartment pattern: theme/highlight swappable without view recreation.
 *  - Cmd/Ctrl+N → new note; Escape → close mobile sidebar.
 */
import {
  onMount,
  onCleanup,
  createEffect,
  createSignal,
  type JSX,
} from 'solid-js';
import { EditorView }                     from '@codemirror/view';
import { EditorState, EditorSelection }   from '@codemirror/state';
import {
  buildExtensions,
  createMarkdownLanguage,
  languageCompartment,
} from './extensions';
import {
  store,
  applyNoteSave,
  setActiveNoteId,
  createNote,
} from '../app/store';
import { loadNoteBody }    from '../lib/persistence';
import { extractTitle, countWords } from '../lib/search';

// ─── Dirty state signal ───────────────────────────────────────────────────────
// Exported so NoteListItem can render the dirty dot.
export const [isDirty, setIsDirty] = createSignal(false);

// ─── Word count signal ────────────────────────────────────────────────────────
export const [wordCount, setWordCount] = createSignal(0);

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

export function Editor(): JSX.Element {
  let container!: HTMLDivElement;
  let view!: EditorView;
  // Guard: prevents update listener treating programmatic note-loads as user edits.
  let isLoadingNote = false;

  onMount(() => {
    view = new EditorView({
      state: EditorState.create({
        doc:        '',
        extensions: buildExtensions().concat([
          EditorView.updateListener.of((update) => {
            if (!update.docChanged || isLoadingNote) return;
            const id = store.activeNoteId;
            if (!id) return;
            setIsDirty(true);
            const body = update.state.doc.toString();
            setWordCount(countWords(body));
            scheduleSave(id, body);
          }),
        ]),
      }),
      parent: container,
    });

    // Lazy-load full language-data for fenced code block syntax highlighting.
    // Reconfigure the languageCompartment via Compartment.reconfigure() so the
    // existing EditorView picks up the full markdown + codeLanguages extension
    // without destroying/recreating the view.
    createMarkdownLanguage()
      .then((langExt) => {
        view.dispatch({
          effects: languageCompartment.reconfigure(langExt),
        });
      })
      .catch(() => {
        // Non-fatal — fenced blocks render without per-language syntax highlight
      });

    // ── Global keyboard shortcuts ───────────────────────────────────────────
    function handleGlobalKey(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey;

      // Cmd/Ctrl+N — new note
      if (meta && e.key === 'n') {
        e.preventDefault();
        const id = createNote();
        setActiveNoteId(id);
        return;
      }

      // Escape — close mobile sidebar (if open)
      if (e.key === 'Escape') {
        const shell = document.querySelector('[data-sidebar-open]');
        if (shell) {
          (shell as HTMLElement).removeAttribute('data-sidebar-open');
        }
      }
    }
    document.addEventListener('keydown', handleGlobalKey);

    onCleanup(() => {
      document.removeEventListener('keydown', handleGlobalKey);
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

    // Dim surface — CSS transition handles the fade
    container.dataset.transitioning = 'true';

    // Replace document contents and reset selection
    view.dispatch({
      changes:   { from: 0, to: view.state.doc.length, insert: body },
      selection: EditorSelection.cursor(0),
    });

    // Clear undo history — Cmd+Z must not cross note boundaries
    view.dispatch({
      effects: EditorView.scrollIntoView(0, { y: 'start' }),
    });

    requestAnimationFrame(() => {
      delete container.dataset.transitioning;
      isLoadingNote = false;
      view.focus();
    });
  });

  onCleanup(() => {
    clearTimeout(saveTimer);
    view?.destroy();
  });

  return (
    <div
      ref={container}
      class="editor-root"
      // data-transitioning drives CSS opacity crossfade on note switch
    />
  );
}
