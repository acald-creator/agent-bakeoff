/**
 * Editor.tsx — CodeMirror 6 integration for Solid
 * CodeMirror owns the document. Solid signals only note-switching.
 */
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

const inkEditorTheme = EditorView.theme(
  {
    '&': {
      height: '100%',
      fontFamily: '"Literata", "Georgia", serif',
      fontSize: '1.05rem',
      lineHeight: '1.75',
      color: '#1A1510',
      backgroundColor: '#F5F0E8',
    },
    '.cm-content': {
      maxWidth: '680px',
      margin: '0 auto',
      padding: '3rem 2.5rem',
      caretColor: '#B8311F',
    },
    '.cm-cursor': {
      borderLeftColor: '#B8311F',
      borderLeftWidth: '2px',
    },
    '.cm-activeLine': {
      backgroundColor: '#ECE6DA',
    },
    '.cm-selectionBackground, .cm-focused .cm-selectionBackground': {
      backgroundColor: '#E8C9C4 !important',
    },
    '.cm-gutters': {
      display: 'none',
    },
    '.cm-lineNumbers': {
      display: 'none',
    },
    '.cm-foldGutter': {
      display: 'none',
    },
    '.cm-scroller': {
      overflow: 'auto',
    },
    '.cm-scroller::-webkit-scrollbar': { width: '6px' },
    '.cm-scroller::-webkit-scrollbar-track': { background: 'transparent' },
    '.cm-scroller::-webkit-scrollbar-thumb': {
      background: '#C8C0B0',
      borderRadius: '3px',
    },
    '&.cm-focused': { outline: 'none' },
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
          inkEditorTheme,
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
  });

  createEffect(() => {
    const id = store.activeNoteId;
    if (!id || !view) return;

    isLoadingNote = true;
    clearTimeout(saveTimer);
    setIsDirty(false);

    const body = loadNoteBody(id);
    container.classList.add('transitioning');

    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: body },
      selection: EditorSelection.cursor(0),
    });

    requestAnimationFrame(() => {
      container.classList.remove('transitioning');
      isLoadingNote = false;
      view.focus();
    });
  });

  onCleanup(() => {
    clearTimeout(saveTimer);
    view?.destroy();
  });

  return <div ref={container} class="editor-root" />;
}
