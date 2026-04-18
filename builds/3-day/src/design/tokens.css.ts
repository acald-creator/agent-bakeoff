/**
 * Design tokens for Ink — the single source of truth for every visual decision.
 *
 * Implementation approach:
 *   - CSS custom properties are defined on :root with known, predictable names.
 *   - TypeScript token objects reference those CSS variable names as strings.
 *   - The CM6 editor theme uses var(--ink-xxx) directly for runtime theming.
 *   - vanilla-extract style() functions use the token object for type safety.
 *
 * This approach (manual CSS vars + TypeScript token object) avoids the
 * vanilla-extract createGlobalTheme hashed-variable problem, while preserving
 * the single-source-of-truth contract. The tradeoff: we maintain the CSS vars
 * and the token object in parallel, but they're adjacent so drift is caught easily.
 *
 * Philosophy:
 *   - One chromatic accent (red ink). Everything else is warm neutrals.
 *   - Two editorial serif typefaces: display for headings, prose for editor body.
 *   - Type scale uses Major Third (1.250) ratio from a 1rem base.
 *   - 4px base spacing unit.
 */
import { globalStyle } from '@vanilla-extract/css';

// ─── CSS custom properties on :root (known names for CM6 theme compatibility) ──
// vanilla-extract globalStyle supports CSS custom properties as top-level keys
// when prefixed with '--'. This emits them as-is into the generated stylesheet.

/* eslint-disable @typescript-eslint/no-explicit-any */
globalStyle(':root', {
  // Colors
  '--ink-bg':            '#F5F0E8',
  '--ink-bg-sidebar':    '#EDE8DF',
  '--ink-bg-active':     '#E8DFD0',
  '--ink-bg-hover':      '#F0EBE2',
  '--ink-ink':           '#1A1510',
  '--ink-ink-2':         '#5C5248',
  '--ink-ink-faint':     '#9E9282',
  '--ink-ink-ghost':     '#C8C0B0',
  '--ink-accent':        '#B8311F',
  '--ink-accent-hover':  '#9E2A19',
  '--ink-accent-faint':  '#F2DDD9',
  '--ink-border':        '#D8D0C0',
  '--ink-border-strong': '#B8B0A0',
  '--ink-dirty':         '#B8311F',
  '--ink-selection':     '#E8C9C4',
  '--ink-cursor-line':   '#ECE6DA',
  // Fonts (as CSS custom property values; applied via var() references)
  '--ink-font-display':  '"Playfair Display", "Georgia", "Times New Roman", serif',
  '--ink-font-prose':    '"Literata", "Georgia", "Book Antiqua", serif',
  '--ink-font-mono':     '"Fira Code", "Cascadia Code", "Consolas", monospace',
  '--ink-font-ui':       '"DM Sans", "Helvetica Neue", system-ui, sans-serif',
  // Sizes
  '--ink-sidebar-w':     '280px',
  '--ink-editor-max-w':  '680px',
  '--ink-editor-px':     '2.5rem',
  '--ink-editor-py':     '3rem',
  // Motion
  '--ink-dur-fast':      '120ms',
  '--ink-dur-medium':    '200ms',
  '--ink-dur-slow':      '350ms',
  '--ink-ease-out':      'cubic-bezier(0.0, 0.0, 0.2, 1)',
  '--ink-ease-in-out':   'cubic-bezier(0.4, 0.0, 0.2, 1)',
  // Line heights
  '--ink-lh-tight':      '1.25',
  '--ink-lh-normal':     '1.5',
  '--ink-lh-relaxed':    '1.7',
  '--ink-lh-display':    '1.2',
} as any);

// ─── TypeScript token object — mirrors the CSS vars above ─────────────────────
//
// Used in vanilla-extract style() calls. Values are the actual CSS var() references
// OR literal values where a number/unitless value is needed by vanilla-extract.

export const tokens = {
  color: {
    bg:           'var(--ink-bg)',
    bgSidebar:    'var(--ink-bg-sidebar)',
    bgActive:     'var(--ink-bg-active)',
    bgHover:      'var(--ink-bg-hover)',
    ink:          'var(--ink-ink)',
    inkSecondary: 'var(--ink-ink-2)',
    inkFaint:     'var(--ink-ink-faint)',
    inkGhost:     'var(--ink-ink-ghost)',
    accent:       'var(--ink-accent)',
    accentHover:  'var(--ink-accent-hover)',
    accentFaint:  'var(--ink-accent-faint)',
    border:       'var(--ink-border)',
    borderStrong: 'var(--ink-border-strong)',
    dirty:        'var(--ink-dirty)',
    selection:    'var(--ink-selection)',
    cursorLine:   'var(--ink-cursor-line)',
  },

  font: {
    display: 'var(--ink-font-display)',
    prose:   'var(--ink-font-prose)',
    mono:    'var(--ink-font-mono)',
    ui:      'var(--ink-font-ui)',
  },

  // Literal values for use where vanilla-extract needs non-var() strings
  // (e.g., fontSize in style() needs a string but some properties are unitless)
  fontSize: {
    xs:   '0.64rem',
    sm:   '0.8rem',
    md:   '1rem',
    lg:   '1.25rem',
    xl:   '1.563rem',
    '2xl':'1.953rem',
    '3xl':'2.441rem',
  },

  lineHeight: {
    tight:   '1.25',
    normal:  '1.5',
    relaxed: '1.7',
    display: '1.2',
  },

  fontWeight: {
    regular: '400',
    medium:  '500',
    semibold:'600',
    bold:    '700',
  },

  size: {
    sidebarWidth:    'var(--ink-sidebar-w)',
    sidebarMinWidth: '200px',
    editorMaxWidth:  'var(--ink-editor-max-w)',
    editorPaddingX:  'var(--ink-editor-px)',
    editorPaddingY:  'var(--ink-editor-py)',
  },

  space: {
    '0':  '0',
    '1':  '0.25rem',
    '2':  '0.5rem',
    '3':  '0.75rem',
    '4':  '1rem',
    '5':  '1.25rem',
    '6':  '1.5rem',
    '8':  '2rem',
    '10': '2.5rem',
    '12': '3rem',
    '16': '4rem',
  },

  radius: {
    none: '0',
    sm:   '2px',
    md:   '4px',
    lg:   '8px',
    full: '9999px',
  },

  shadow: {
    sm:  '0 1px 3px rgba(26, 21, 16, 0.06)',
    md:  '0 2px 8px rgba(26, 21, 16, 0.10)',
    lg:  '0 4px 20px rgba(26, 21, 16, 0.14)',
  },

  motion: {
    durationFast:   'var(--ink-dur-fast)',
    durationMedium: 'var(--ink-dur-medium)',
    durationSlow:   'var(--ink-dur-slow)',
    easeOut:  'var(--ink-ease-out)',
    easeIn:   'cubic-bezier(0.4, 0.0, 1.0, 1)',
    easeInOut:'var(--ink-ease-in-out)',
  },

  zIndex: {
    base:    0,
    above:   10,
    sidebar: 20,
    overlay: 30,
    modal:   40,
  },
} as const;

/**
 * CSS variable names for use directly in CM6 EditorView.theme() calls.
 * These are the same var() references that tokens.xxx maps to.
 */
export const cssVars = {
  fontDisplay:   'var(--ink-font-display)',
  fontProse:     'var(--ink-font-prose)',
  fontMono:      'var(--ink-font-mono)',
  fontUi:        'var(--ink-font-ui)',
  colorBg:       'var(--ink-bg)',
  colorInk:      'var(--ink-ink)',
  colorAccent:   'var(--ink-accent)',
  colorCursorLn: 'var(--ink-cursor-line)',
  colorSelection:'var(--ink-selection)',
  colorInkFaint: 'var(--ink-ink-faint)',
  colorInkGhost: 'var(--ink-ink-ghost)',
  colorBgSidebar:'var(--ink-bg-sidebar)',
  colorBorder:   'var(--ink-border)',
  lhRelaxed:     'var(--ink-lh-relaxed)',
  editorMaxW:    'var(--ink-editor-max-w)',
  editorPx:      'var(--ink-editor-px)',
  editorPy:      'var(--ink-editor-py)',
} as const;

/**
 * Convenience font-face declarations for index.html <link> preloads.
 * Fonts are NOT in the bundle; served from Google Fonts CDN.
 */
export const FONT_FAMILIES = {
  display: 'Playfair Display',
  prose:   'Literata',
  ui:      'DM Sans',
  mono:    'Fira Code',
} as const;
