import { onMount, onCleanup, createEffect, createSignal, type JSX } from 'solid-js';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState, EditorSelection } from '@codemirror/state';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { store, applyNoteSave } from '../app/store';
import { loadNoteBody } from '../lib/persistence';

export const [isDirty, setIsDirty] = createSignal(false);

let saveTimer: ReturnType<typeof setTimeout>;

function scheduleSave(id: string, body: string): void {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    const firstLine = body.split('\n').find((l) => l.trim()) ?? '';
    const title = firstLine.replace(/^#+\s*/, '').trim() || 'Untitled';
    applyNoteSave(id, title, body);
    setIsDirty(false);
  }, 400);
}

const inkTheme = EditorView.theme(
  {
    '&': {
      height: '100%',
      fontFamily: 'var(--font-prose)',
      fontSize: '1rem',
      lineHeight: 'var(--lineHeight-relaxed)',
      color: 'var(--color-ink)',
      backgroundColor: 'var(--color-bg)',
    },
    '.cm-content': {
      maxWidth: 'var(--size-editorMaxWidth)',
      margin: '0 auto',
      padding: 'var(--size-editorPaddingY) var(--size-editorPaddingX)',
      caretColor: 'var(--color-accent)',
    },
    '.cm-cursor': {
      borderLeftColor: 'var(--color-accent)',
      borderLeftWidth: '2px',
    },
    '.cm-activeLine': {
      backgroundColor: 'var(--color-cursorLine)',
    },
    '.cm-selectionBackground': {
      backgroundColor: 'var(--color-selection) !important',
    },
    '.cm-focused .cm-selectionBackground': {
      backgroundColor: 'var(--color-selection) !important',
    },
    '.cm-scroller': {
      overflow: 'auto',
    },
    '.cm-scroller::-webkit-scrollbar': { width: '6px' },
    '.cm-scroller::-webkit-scrollbar-track': { background: 'transparent' },
    '.cm-scroller::-webkit-scrollbar-thumb': {
      background: 'var(--color-inkGhost)',
      borderRadius: '3px',
    },
    '&.cm-focused': { outline: 'none' },
    '.cm-gutters': { display: 'none' },
    // Markdown heading styles
    '.cm-header-1': { fontSize: '1.5rem', lineHeight: '1.3', fontWeight: '700' },
    '.cm-header-2': { fontSize: '1.25rem', lineHeight: '1.4', fontWeight: '600' },
    '.cm-header-3': { fontSize: '1rem', lineHeight: '1.5', fontWeight: '600' },
    '.cm-strong':   { fontWeight: '700' },
    '.cm-em':       { fontStyle: 'italic' },
    '.cm-url':      { color: 'var(--color-inkFaint)' },
    '.cm-link':     { color: 'var(--color-accent)' },
  },
  { dark: false },
);

export function Editor(): JSX.Element {
  let container!: HTMLDivElement;
  let view!: EditorView;
  let isLoadingNote = false;

  onMount(() => {
    view = new EditorView({
      state: EditorState.create({
        doc: '',
        extensions: [
          basicSetup,
          markdown({ base: markdownLanguage, codeLanguages: languages }),
          inkTheme,
          EditorView.updateListener.of((update) => {
            if (!update.docChanged || isLoadingNote) return;
            const id = store.activeNoteId;
            if (!id) return;
            setIsDirty(true);
            scheduleSave(id, update.state.doc.toString());
          }),
          EditorView.lineWrapping,
        ],
      }),
      parent: container,
    });
    // createEffect below will handle initial load since it runs after mount
  });

  // Runs on mount (initial note load) and on every activeNoteId change
  createEffect(() => {
    const id = store.activeNoteId;
    if (!id || !view) return;

    isLoadingNote = true;
    clearTimeout(saveTimer);
    setIsDirty(false);

    const body = loadNoteBody(id);
    container.dataset.transitioning = 'true';

    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: body },
      selection: EditorSelection.cursor(0),
    });
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
    />
  );
}
