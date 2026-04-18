/**
 * tokens.css.ts — Design token contract for Ink
 *
 * Every color, spacing step, type size, and motion timing derives from this
 * file. Nothing in the component tree hardcodes a value.
 *
 * Palette philosophy:
 *   - Warm aged-paper background, not pure white / dark charcoal
 *   - Red ink accent is the single chromatic statement
 *   - Everything else is warm neutrals
 */
import { createGlobalTheme } from '@vanilla-extract/css';

export const tokens = createGlobalTheme(':root', {
  color: {
    // ── Core palette ─────────────────────────────────────────────────────────
    bg:          '#F5F0E8',   // aged paper — primary background
    bgSidebar:   '#EDE8DF',   // slightly darker, grounds the sidebar
    bgHover:     '#E6E0D5',   // list item hover
    bgActive:    '#DDD8CC',   // list item active/selected
    ink:         '#1A1510',   // near-black with warm tint
    inkSecondary:'#5A5248',   // muted text (snippets, metadata)
    inkFaint:    '#8A8278',   // very muted (placeholders, icons)
    inkGhost:    '#C4BEB4',   // scrollbar thumb, hairline decorations
    accent:      '#B8311F',   // red ink — the single chromatic statement
    accentFaint: '#F5EAE7',   // accent tint for hover backgrounds
    border:      '#D4CEC4',   // sidebar rule, search border
    // ── Semantic ─────────────────────────────────────────────────────────────
    cursorLine:  'rgba(26, 21, 16, 0.035)',
    selection:   'rgba(184, 49, 31, 0.15)',
    dirty:       '#B8311F',   // dirty-dot color = accent
    // ── Dark mode overrides (prefers-color-scheme) defined in global.css.ts ──
  },
  font: {
    display: '"Playfair Display", Georgia, serif',
    prose:   '"Literata", Georgia, serif',
    mono:    '"Fira Code", "Cascadia Code", monospace',
    ui:      '"DM Sans", system-ui, sans-serif',
  },
  fontSize: {
    xs:  '0.75rem',    // 12px
    sm:  '0.8125rem',  // 13px
    md:  '0.9375rem',  // 15px
    lg:  '1.0625rem',  // 17px
    xl:  '1.25rem',    // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
  },
  fontWeight: {
    normal:   '400',
    medium:   '500',
    semibold: '600',
    bold:     '700',
  },
  lineHeight: {
    tight:   '1.25',
    normal:  '1.5',
    relaxed: '1.75',
    display: '1.1',
  },
  space: {
    '1': '4px',
    '2': '8px',
    '3': '12px',
    '4': '16px',
    '5': '20px',
    '6': '24px',
    '7': '28px',
    '8': '32px',
    '10': '40px',
    '12': '48px',
    '16': '64px',
  },
  size: {
    sidebarWidth:    '260px',
    sidebarMinWidth: '200px',
    editorMaxWidth:  '68ch',
    editorPaddingY:  '3rem',
    editorPaddingX:  '2rem',
  },
  radius: {
    sm:   '3px',
    md:   '6px',
    full: '9999px',
  },
  motion: {
    durationFast:   '120ms',
    durationMedium: '200ms',
    durationSlow:   '320ms',
    easeOut:        'cubic-bezier(0.16, 1, 0.3, 1)',
    easeIn:         'cubic-bezier(0.4, 0, 1, 1)',
    easeInOut:      'cubic-bezier(0.45, 0, 0.55, 1)',
  },
  zIndex: {
    sidebar: '10',
    overlay: '20',
    modal:   '30',
  },
});
