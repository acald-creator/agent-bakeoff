/**
 * tokens.css.ts — design token contract for Ink
 *
 * Every color, spacing step, type size, and motion value derives from here.
 * Nothing in the component tree hardcodes a raw value.
 *
 * vanilla-extract: this file MUST have the .css.ts suffix for the plugin to
 * process it. The exported `tokens` object is a plain TypeScript object
 * consumed by other .css.ts files at build time — no runtime cost.
 */
import { createGlobalTheme } from '@vanilla-extract/css';

// ─── Theme contract ───────────────────────────────────────────────────────────

export const tokens = createGlobalTheme(':root', {
  color: {
    // Core palette — warm aged-paper aesthetic
    bg:          '#F5F0E8', // aged paper — primary surface
    bgSidebar:   '#EDE8DF', // slightly darker warm paper for sidebar
    bgHover:     '#E8E2D6', // hover state background
    bgActive:    '#E0D9CB', // active note background
    border:      '#D4CCBC', // warm grey border
    ink:         '#1A1510', // near-black warm ink
    inkSecondary:'#4A4035', // secondary text
    inkFaint:    '#8A7E70', // placeholder, metadata
    inkGhost:    '#C4BAA8', // scrollbar thumb, very faint elements
    accent:      '#B8311F', // red ink — the single chromatic statement
    accentFaint: 'rgba(184, 49, 31, 0.08)', // accent tint for hover bg
    selection:   'rgba(184, 49, 31, 0.15)', // text selection
    cursorLine:  'rgba(26, 21, 16, 0.03)',  // active line highlight
    dirty:       '#B8311F', // dirty dot same as accent
  },
  font: {
    display: '"Playfair Display", Georgia, serif',
    prose:   '"Literata", Georgia, serif',
    mono:    '"Fira Code", "Cascadia Code", monospace',
    ui:      '"DM Sans", system-ui, sans-serif',
  },
  fontSize: {
    xs:  '0.75rem',   // 12px
    sm:  '0.875rem',  // 14px
    md:  '1rem',      // 16px
    lg:  '1.125rem',  // 18px
    xl:  '1.25rem',   // 20px
    '2xl': '1.563rem',// 25px
    '3xl': '1.953rem',// 31px
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
    '1': '0.25rem',
    '2': '0.5rem',
    '3': '0.75rem',
    '4': '1rem',
    '5': '1.25rem',
    '6': '1.5rem',
    '8': '2rem',
    '10': '2.5rem',
    '12': '3rem',
  },
  size: {
    sidebarWidth:    '280px',
    sidebarMinWidth: '220px',
    editorMaxWidth:  '680px',
    editorPaddingX:  '2.5rem',
    editorPaddingY:  '3rem',
  },
  radius: {
    sm:   '3px',
    md:   '6px',
    full: '9999px',
  },
  zIndex: {
    sidebar:  '10',
    overlay:  '20',
    backdrop: '15',
  },
  motion: {
    durationFast:   '120ms',
    durationMedium: '200ms',
    durationSlow:   '300ms',
    easeOut:        'cubic-bezier(0.16, 1, 0.3, 1)',
    easeInOut:      'cubic-bezier(0.4, 0, 0.2, 1)',
  },
});
