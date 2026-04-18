/**
 * extensions.ts — CodeMirror 6 extension bundle for Ink
 *
 * Bundled separately from the component so extensions can be tested
 * in isolation and swapped without touching the component lifecycle.
 */
import { EditorView, keymap } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import {
  syntaxHighlighting,
  defaultHighlightStyle,
  HighlightStyle,
} from '@codemirror/language';
import {
  closeBrackets,
  closeBracketsKeymap,
} from '@codemirror/autocomplete';
import { searchKeymap, search } from '@codemirror/search';
import { tags } from '@lezer/highlight';

// ─── CodeMirror theme (references CSS custom properties from tokens.ts) ────────
//
// The theme values reference var(--xxx) custom properties that vanilla-extract
// generates at build time from tokens.ts. This keeps the CM6 theme in sync
// with the design token contract without a runtime dependency.
export const inkEditorTheme = EditorView.theme(
  {
    '&': {
      height: '100%',
      fontFamily: 'var(--ink-font-prose)',
      fontSize: '1.05rem',
      lineHeight: 'var(--ink-lh-relaxed)',
      color: 'var(--ink-ink)',
      backgroundColor: 'var(--ink-bg)',
    },
    '.cm-scroller': {
      fontFamily: 'inherit',
      lineHeight: 'inherit',
      overflowY: 'auto',
      scrollbarWidth: 'thin',
      scrollbarColor: 'var(--ink-ink-ghost) transparent',
    },
    '.cm-scroller::-webkit-scrollbar': {
      width: '6px',
    },
    '.cm-scroller::-webkit-scrollbar-track': {
      background: 'transparent',
    },
    '.cm-scroller::-webkit-scrollbar-thumb': {
      background: 'var(--ink-ink-ghost)',
      borderRadius: '3px',
    },
    '.cm-content': {
      maxWidth: 'var(--ink-editor-max-w)',
      margin: '0 auto',
      padding: 'var(--ink-editor-py) var(--ink-editor-px)',
      caretColor: 'var(--ink-accent)',
    },
    '.cm-cursor': {
      borderLeftColor: 'var(--ink-accent)',
      borderLeftWidth: '2px',
    },
    '.cm-activeLine': {
      backgroundColor: 'var(--ink-cursor-line)',
    },
    '.cm-selectionBackground, ::selection': {
      backgroundColor: 'var(--ink-selection) !important',
    },
    '.cm-focused .cm-selectionBackground': {
      backgroundColor: 'var(--ink-selection) !important',
    },
    '.cm-gutters': {
      backgroundColor: 'transparent',
      borderRight: 'none',
    },
    // Search panel styling — themed to match the sidebar palette
    '.cm-search': {
      fontFamily: 'var(--ink-font-ui)',
      fontSize: '0.875rem',
      backgroundColor: 'var(--ink-bg-sidebar)',
      borderTop: '1px solid var(--ink-border)',
      color: 'var(--ink-ink)',
      padding: '4px 8px',
    },
    '.cm-textfield': {
      backgroundColor: 'var(--ink-bg)',
      border: '1px solid var(--ink-border)',
      borderRadius: '2px',
      color: 'var(--ink-ink)',
      padding: '2px 6px',
      fontFamily: 'var(--ink-font-ui)',
    },
    '.cm-button': {
      backgroundColor: 'var(--ink-bg)',
      border: '1px solid var(--ink-border)',
      borderRadius: '2px',
      color: 'var(--ink-ink)',
      cursor: 'pointer',
      fontFamily: 'var(--ink-font-ui)',
    },
    '&.cm-focused': {
      outline: 'none',
    },
  },
  { dark: false },
);

// ─── Markdown highlight style ─────────────────────────────────────────────────
//
// Overlaid on top of the base theme via syntaxHighlighting().
// Uses standard lezer highlight tags for broad compatibility.
export const inkMarkdownHighlight = HighlightStyle.define([
  {
    tag: tags.heading1,
    fontSize: '1.563rem',
    fontWeight: '700',
    lineHeight: '1.3',
    fontFamily: 'var(--ink-font-display)',
  },
  {
    tag: tags.heading2,
    fontSize: '1.25rem',
    fontWeight: '600',
    lineHeight: '1.4',
    fontFamily: 'var(--ink-font-display)',
  },
  {
    tag: tags.heading3,
    fontSize: '1.1rem',
    fontWeight: '600',
    lineHeight: '1.45',
  },
  { tag: tags.strong,                 fontWeight: '700' },
  { tag: tags.emphasis,               fontStyle: 'italic' },
  { tag: tags.link,                   color: 'var(--ink-accent)', textDecoration: 'underline' },
  { tag: tags.url,                    color: 'var(--ink-ink-faint)' },
  { tag: tags.monospace,              fontFamily: 'var(--ink-font-mono)', fontSize: '0.875em' },
  { tag: tags.comment,                color: 'var(--ink-ink-faint)' },
  { tag: tags.processingInstruction,  color: 'var(--ink-ink-2)' },
  { tag: tags.atom,                   color: 'var(--ink-ink-2)' },
  { tag: tags.keyword,                color: 'var(--ink-accent)' },
  { tag: tags.string,                 color: 'var(--ink-ink-2)' },
  { tag: tags.meta,                   color: 'var(--ink-ink-faint)' },
]);

// ─── Extension factory ────────────────────────────────────────────────────────
//
// Returns a fresh extension array. Called on mount and on note switch
// (to reset history). Order matters: syntax → highlighting → keymaps → views.
export function buildExtensions(onUpdate: (docStr: string) => void) {
  return [
    // Language: markdown with fenced code language support
    markdown({
      base: markdownLanguage,
      codeLanguages: languages,
    }),
    // Syntax highlighting
    syntaxHighlighting(inkMarkdownHighlight),
    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    // History (undo/redo via keyboard)
    history(),
    // Bracket closing for `` ` `` pairs etc.
    closeBrackets(),
    // Keymaps
    keymap.of([
      ...closeBracketsKeymap,
      ...defaultKeymap,
      ...historyKeymap,
      ...searchKeymap,
    ]),
    // In-editor search panel (Cmd+F / Ctrl+F)
    search({ top: false }),
    // Line wrapping — essential for a writing tool
    EditorView.lineWrapping,
    // Visual theme
    inkEditorTheme,
    // Update listener — fires on every document change
    EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        onUpdate(update.state.doc.toString());
      }
    }),
  ];
}
