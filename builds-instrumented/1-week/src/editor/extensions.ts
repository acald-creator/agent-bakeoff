/**
 * extensions.ts — CodeMirror 6 extension bundle for Ink.
 *
 * Key decisions:
 *  - Compartment pattern: theme and language-highlight are swappable at runtime
 *    without destroying/recreating the EditorView.
 *  - @codemirror/language-data is dynamic-imported (lazy chunk). Initial parse
 *    only needs the markdown language; fenced code block highlighting loads
 *    the relevant language on first use.
 *  - HighlightStyle uses @lezer/highlight tags to size headings and style
 *    bold/italic/code/links with the ink editorial palette.
 *  - The inkTheme uses EditorView.theme() so values co-locate with the view.
 *    References CSS custom properties from tokens.css.ts (zero runtime CSS-in-JS).
 */
import { EditorView }                         from '@codemirror/view';
import { Compartment }                        from '@codemirror/state';
import { basicSetup }                         from 'codemirror';
import { markdown, markdownLanguage }         from '@codemirror/lang-markdown';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags }                               from '@lezer/highlight';

// ─── Compartments (allow runtime reconfiguration without view recreation) ─────

export const themeCompartment      = new Compartment();
export const highlightCompartment  = new Compartment();
export const languageCompartment   = new Compartment();

// ─── Editorial ink theme ──────────────────────────────────────────────────────
// References CSS custom properties emitted by tokens.css.ts

export const inkTheme = EditorView.theme(
  {
    '&': {
      height:          '100%',  // Takes full height of .editor-root flex container
      fontFamily:      'var(--font-prose)',
      fontSize:        '1.0625rem',
      lineHeight:      '1.75',
      color:           'var(--color-ink)',
      backgroundColor: 'var(--color-bg)',
    },
    '.cm-content': {
      maxWidth:  'var(--size-editorMaxWidth)',
      margin:    '0 auto',
      padding:   'var(--size-editorPaddingY) var(--size-editorPaddingX)',
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
    '.cm-lineNumbers': {
      display: 'none',
    },
    // Gutters shouldn't show — this is a prose editor
    '.cm-gutters': {
      display: 'none',
    },
    // Scrollbar styling (WebKit) — thin red-ink scrollbar
    '.cm-scroller::-webkit-scrollbar': { width: '5px' },
    '.cm-scroller::-webkit-scrollbar-track': { background: 'transparent' },
    '.cm-scroller::-webkit-scrollbar-thumb': {
      background:   'var(--color-inkGhost)',
      borderRadius: '9999px',
    },
    '.cm-scroller::-webkit-scrollbar-thumb:hover': {
      background: 'var(--color-inkFaint)',
    },
    '&.cm-focused': { outline: 'none' },
    // Search/highlight panel
    '.cm-panels': {
      backgroundColor: 'var(--color-bgSidebar)',
      borderTop:       '1px solid var(--color-border)',
    },
  },
  { dark: false },
);

// ─── HighlightStyle — Lezer tags → editorial visual treatment ────────────────
// Headings are sized; bold/italic/code/links carry semantic color.

export const inkHighlightStyle = HighlightStyle.define([
  // Headings: sized in proportion to the prose baseline
  { tag: tags.heading1,  fontFamily: 'var(--font-display)', fontSize: '1.563rem', fontWeight: '700', lineHeight: '1.3' },
  { tag: tags.heading2,  fontFamily: 'var(--font-display)', fontSize: '1.25rem',  fontWeight: '600', lineHeight: '1.4' },
  { tag: tags.heading3,  fontFamily: 'var(--font-display)', fontSize: '1.0625rem', fontWeight: '600', lineHeight: '1.5' },
  { tag: tags.heading4,  fontFamily: 'var(--font-display)', fontSize: '1rem',     fontWeight: '600' },
  // Emphasis
  { tag: tags.strong,    fontWeight: '700' },
  { tag: tags.emphasis,  fontStyle: 'italic' },
  // Inline code
  { tag: tags.monospace, fontFamily: 'var(--font-mono)', fontSize: '0.875em' },
  // Links
  { tag: tags.link,      color: 'var(--color-accent)', textDecoration: 'underline', textUnderlineOffset: '2px' },
  { tag: tags.url,       color: 'var(--color-inkFaint)' },
  // Block quote
  { tag: tags.quote,     color: 'var(--color-inkSecondary)', fontStyle: 'italic' },
  // List bullets/markers
  { tag: tags.list,      color: 'var(--color-accent)' },
  // Strikethrough
  { tag: tags.strikethrough, textDecoration: 'line-through', color: 'var(--color-inkSecondary)' },
  // HR / thematic break
  { tag: tags.processingInstruction, color: 'var(--color-inkGhost)' },
  // Comment (html comments in markdown)
  { tag: tags.comment,   color: 'var(--color-inkFaint)', fontStyle: 'italic' },
  // Punctuation markers (##, **, __, etc.) — ghost them so text is prominent
  { tag: tags.punctuation,    color: 'var(--color-inkGhost)' },
  { tag: tags.contentSeparator, color: 'var(--color-inkGhost)' },
]);

// ─── Language (with lazy language-data) ──────────────────────────────────────
// @codemirror/language-data is dynamically imported — loaded only when the
// editor first encounters a fenced code block with a named language.

export async function createMarkdownLanguage() {
  const { languages } = await import('@codemirror/language-data');
  return markdown({ base: markdownLanguage, codeLanguages: languages });
}

// Synchronous fallback (used for initial EditorState, before async load)
export const markdownLanguageSync = markdown({ base: markdownLanguage });

// ─── Full extension list ──────────────────────────────────────────────────────

export function buildExtensions() {
  return [
    basicSetup,
    // Language compartment starts with sync markdown (no codeLanguages).
    // After @codemirror/language-data loads, Editor.tsx reconfigures this
    // compartment to include the full language list.
    languageCompartment.of(markdownLanguageSync),
    themeCompartment.of(inkTheme),
    highlightCompartment.of(syntaxHighlighting(inkHighlightStyle)),
    EditorView.lineWrapping,
  ];
}
