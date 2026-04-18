/**
 * Design tokens for Ink — the single source of truth for every visual decision.
 *
 * Philosophy:
 *   - One chromatic accent (red ink). Everything else is warm neutrals.
 *   - Two editorial serif typefaces: display for headings, prose for editor body.
 *   - Type scale uses Major Third (1.250) ratio from a 1rem base.
 *   - 4px base spacing unit.
 *   - Motion timings are fast (interactions) and slow (page-level transitions).
 *
 * This file is imported by vanilla-extract theme files and generates CSS custom
 * properties on :root. It is never bundled into runtime JS — it is compiled away.
 */
import { createGlobalTheme } from '@vanilla-extract/css';

export const tokens = createGlobalTheme(':root', {
  color: {
    // ── Light theme (primary canonical experience) ──────────────────────────
    bg:           '#F5F0E8',   // aged paper — warm off-white, not pure white
    bgSidebar:    '#EDE8DF',   // sidebar is slightly cooler/darker than editor
    bgActive:     '#E8DFD0',   // active note in sidebar — perceptible but not jarring
    bgHover:      '#F0EBE2',   // hover state for list items
    ink:          '#1A1510',   // near-black with warm tint — not #000000
    inkSecondary: '#5C5248',   // secondary text (timestamps, word count)
    inkFaint:     '#9E9282',   // placeholder text, disabled states
    inkGhost:     '#C8C0B0',   // decorative rule color
    accent:       '#B8311F',   // red ink — single chromatic statement
    accentHover:  '#9E2A19',   // darker on hover
    accentFaint:  '#F2DDD9',   // very light red for backgrounds
    border:       '#D8D0C0',   // subtle dividers — low contrast, never harsh
    borderStrong: '#B8B0A0',   // slightly visible borders (editor edges)
    // ── Semantic ────────────────────────────────────────────────────────────
    dirty:        '#B8311F',   // unsaved indicator — same as accent
    selection:    '#E8C9C4',   // text selection background
    cursorLine:   '#ECE6DA',   // CodeMirror active line highlight
  },

  font: {
    // Display: sidebar headings, note titles in list
    // Playfair Display: high-contrast, baroque serif — unmistakably editorial
    display: '"Playfair Display", "Georgia", "Times New Roman", serif',

    // Prose: editor body text, the primary reading/writing surface
    // Literata: designed for long-form digital reading (used in Google Play Books)
    // Fallback to Georgia for offline/FOUT resilience
    prose:   '"Literata", "Georgia", "Book Antiqua", serif',

    // Mono: code blocks inside markdown fences
    // Fira Code: ligature-supporting, designed for readability at small sizes
    mono:    '"Fira Code", "Cascadia Code", "Consolas", monospace',

    // UI: search input, buttons, metadata labels, word count
    // DM Sans: geometric humanist, cleanly contrasts with editorial serifs
    ui:      '"DM Sans", "Helvetica Neue", system-ui, sans-serif',
  },

  fontSize: {
    // Major Third scale (×1.250) from 1rem base
    xs:   '0.64rem',    // ~10px — tiny metadata
    sm:   '0.8rem',     // ~13px — secondary labels
    md:   '1rem',       // ~16px — body default
    lg:   '1.25rem',    // ~20px — sidebar note titles
    xl:   '1.563rem',   // ~25px — section headings
    '2xl':'1.953rem',   // ~31px — app name in sidebar
    '3xl':'2.441rem',   // ~39px — large display (unused in v1, reserved)
  },

  lineHeight: {
    tight:   '1.25',
    normal:  '1.5',
    relaxed: '1.7',     // used for editor prose — generous for readability
    display: '1.2',     // tighter for large decorative type
  },

  fontWeight: {
    regular: '400',
    medium:  '500',
    semibold:'600',
    bold:    '700',
  },

  size: {
    sidebarWidth:    '280px',
    sidebarMinWidth: '200px',
    editorMaxWidth:  '680px',   // ~65–75 characters at 1rem — Bringhurst's ideal measure
    editorPaddingX:  '2.5rem',
    editorPaddingY:  '3rem',
  },

  space: {
    // 4px base unit — multiples of 4 for grid alignment
    '0':  '0',
    '1':  '0.25rem',   // 4px
    '2':  '0.5rem',    // 8px
    '3':  '0.75rem',   // 12px
    '4':  '1rem',      // 16px
    '5':  '1.25rem',   // 20px
    '6':  '1.5rem',    // 24px
    '8':  '2rem',      // 32px
    '10': '2.5rem',    // 40px
    '12': '3rem',      // 48px
    '16': '4rem',      // 64px
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
    durationFast:   '120ms',
    durationMedium: '200ms',
    durationSlow:   '350ms',
    easeOut:  'cubic-bezier(0.0, 0.0, 0.2, 1)',
    easeIn:   'cubic-bezier(0.4, 0.0, 1.0, 1)',
    easeInOut:'cubic-bezier(0.4, 0.0, 0.2, 1)',
  },

  zIndex: {
    base:    '0',
    above:   '10',
    sidebar: '20',
    overlay: '30',
    modal:   '40',
  },
});

/**
 * Convenience: the exact font-face load list for index.html <link rel="preload">
 * Fonts are NOT in the bundle. They are preloaded from Google Fonts.
 */
export const FONT_FAMILIES = {
  display: 'Playfair Display',
  prose:   'Literata',
  ui:      'DM Sans',
  mono:    'Fira Code',
} as const;
