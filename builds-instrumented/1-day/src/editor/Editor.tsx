/**
 * Editor.tsx — CodeMirror 6 integration for SolidJS
 *
 * CodeMirror owns the document. Solid signals only drive note-switching.
 * 400ms debounced save: dirty dot at 0ms, localStorage write at 400ms.
 * Cmd+Z never crosses note boundaries (history cleared on note switch).
 * 120ms CSS opacity crossfade on note switch (data-transitioning attribute).
 */
import { onMount, onCleanup, createEffect, createSignal, type JSX } from 'solid-js';
import { basicSetup } from 'codemirror';
import { EditorView } from '@codemirror/view';
import { EditorState, EditorSelection, Compartment } from '@codemirror/state';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { store, applyNoteSave } from '../app/store';
import { loadNoteBody } from '../lib/persistence';

// ─── Dirty signal (exported for sidebar dirty dot) ────────────────────────────
export const [isDirty, setIsDirty] = createSignal(false);

// ─── Debounced save ───────────────────────────────────────────────────────────
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

// ─── CodeMirror theme (references CSS vars set by global.css.ts) ──────────────
const inkTheme = EditorView.theme(
  {
    '&': {
      height: '100%',
      fontFamily: 'var(--font-prose)',
      fontSize: '1rem',
      lineHeight: 'var(--line-height-relaxed)',
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
    '.cm-selectionBackground, .cm-focused .cm-selectionBackground': {
      backgroundColor: 'var(--color-selection) !important',
    },
    // Markdown decorations
    '.cm-header-1': { fontSize: '1.563rem', lineHeight: '1.3', fontWeight: '700' },
    '.cm-header-2': { fontSize: '1.25rem',  lineHeight: '1.4', fontWeight: '600' },
    '.cm-header-3': { fontSize: '1rem',     lineHeight: '1.5', fontWeight: '600' },
    '.cm-strong':   { fontWeight: '700' },
    '.cm-em':       { fontStyle: 'italic' },
    '.cm-link':     { color: 'var(--color-accent)' },
    '.cm-url':      { color: 'var(--color-inkFaint)' },
    '.cm-monospace':{ fontFamily: 'var(--font-mono)', fontSize: '0.875em' },
    '.cm-codeBlock': {
      backgroundColor: 'rgba(26, 21, 16, 0.04)',
      borderRadius: '2px',
      padding: '0 0.25em',
    },
    // Scrollbar (WebKit)
    '.cm-scroller::-webkit-scrollbar': { width: '6px' },
    '.cm-scroller::-webkit-scrollbar-track': { background: 'transparent' },
    '.cm-scroller::-webkit-scrollbar-thumb': {
      background: 'var(--color-inkGhost)',
      borderRadius: '3px',
    },
    '&.cm-focused': { outline: 'none' },
  },
  { dark: false },
);

// ─── Component ────────────────────────────────────────────────────────────────

export function Editor(): JSX.Element {
  let container!: HTMLDivElement;
  let view!: EditorView;
  let isLoadingNote = false;

  /** Load a note into the editor view (shared by onMount + createEffect) */
  function loadNote(id: string) {
    if (!view) return;
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
  }

  onMount(() => {
    // Compartment allows swapping the language-data extension after mount.
    const langDataCompartment = new Compartment();

    const buildMarkdown = (codeLanguages: any[] = []) =>
      markdown({ base: markdownLanguage, codeLanguages });

    const baseExtensions = [
      basicSetup,
      langDataCompartment.of(buildMarkdown()),
      inkTheme,
      EditorView.lineWrapping,
      EditorView.updateListener.of((update) => {
        if (!update.docChanged || isLoadingNote) return;
        const id = store.activeNoteId;
        if (!id) return;
        setIsDirty(true);
        scheduleSave(id, update.state.doc.toString());
      }),
    ];

    view = new EditorView({
      state: EditorState.create({ doc: '', extensions: baseExtensions }),
      parent: container,
    });

    // Load the active note immediately after view creation
    const id = store.activeNoteId;
    if (id) loadNote(id);

    // Lazy-load language-data and reconfigure once ready
    import('@codemirror/language-data').then(({ languages }) => {
      if (!view) return; // component unmounted before load finished
      view.dispatch({
        effects: langDataCompartment.reconfigure(buildMarkdown(languages)),
      });
    });
  });

  // Note switching after initial mount
  createEffect(() => {
    const id = store.activeNoteId;
    // Guard: view not yet created (onMount hasn't fired), handled there instead
    if (!id || !view) return;
    loadNote(id);
  });

  onCleanup(() => {
    clearTimeout(saveTimer);
    view?.destroy();
  });

  return <div ref={container} class="editor-root" />;
}
