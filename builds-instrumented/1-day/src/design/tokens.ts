/**
 * tokens.ts — design token contract for Ink
 *
 * Every color, spacing step, and type size derives from here.
 * No component hardcodes a value; all style decisions flow from this contract.
 *
 * Palette: warm aged-paper + red ink accent. Single chromatic statement.
 */

export const tokens = {
  color: {
    // Core palette
    bg:          '#F5F0E8',  // aged paper
    bgSidebar:   '#EDE8DF',  // slightly deeper than editor bg
    bgHover:     'rgba(26, 21, 16, 0.04)',
    bgActive:    'rgba(184, 49, 31, 0.06)',
    ink:         '#1A1510',  // near-black with warm tint
    inkSecondary:'#5C5347',
    inkFaint:    '#9C9389',
    inkGhost:    'rgba(26, 21, 16, 0.15)',
    accent:      '#B8311F',  // red ink — single chromatic statement
    accentFaint: 'rgba(184, 49, 31, 0.08)',
    border:      'rgba(26, 21, 16, 0.12)',
    // Editor-specific
    cursorLine:  'rgba(26, 21, 16, 0.03)',
    selection:   'rgba(184, 49, 31, 0.15)',
    dirty:       '#B8311F',  // same as accent — dirty dot is accent-colored
  },

  font: {
    display: '"Playfair Display", Georgia, serif',
    prose:   '"Literata", Georgia, serif',
    mono:    '"Fira Code", "Cascadia Code", monospace',
    ui:      '"DM Sans", system-ui, sans-serif',
  },

  fontSize: {
    xs:   '0.75rem',   // 12px
    sm:   '0.875rem',  // 14px
    md:   '1rem',      // 16px
    lg:   '1.125rem',  // 18px
    xl:   '1.25rem',   // 20px
    '2xl':'1.563rem',  // 25px
    '3xl':'1.953rem',  // 31px
  },

  fontWeight: {
    normal:   '400',
    medium:   '500',
    semibold: '600',
    bold:     '700',
  },

  lineHeight: {
    tight:   '1.2',
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
    '8': '32px',
    '10': '40px',
    '12': '48px',
  },

  size: {
    sidebarWidth:    '260px',
    sidebarMinWidth: '220px',
    editorMaxWidth:  '680px',
    editorPaddingY:  '48px',
    editorPaddingX:  '32px',
  },

  radius: {
    sm:   '3px',
    md:   '6px',
    full: '9999px',
  },

  motion: {
    durationFast:   '120ms',
    durationMedium: '200ms',
    easeOut:        'cubic-bezier(0.16, 1, 0.3, 1)',
  },

  zIndex: {
    sidebar: '10',
    overlay: '20',
  },
} as const;
