/**
 * global.css.ts — CSS reset, layout shells, global styles
 *
 * Rules for this file:
 *   - globalStyle() calls with pseudo-variants MUST be separate calls (not nested
 *     selectors inside globalStyle). Each pseudo gets its own globalStyle().
 *   - Use style() for layout shell classes that are referenced in JSX.
 *   - No component-level styles here — those live in sidebar/editor .css.ts files.
 */
import { globalStyle, style } from '@vanilla-extract/css';
import { tokens } from './tokens.css';

// ─── CSS Reset ────────────────────────────────────────────────────────────────

globalStyle('*, *::before, *::after', {
  boxSizing: 'border-box',
  margin: 0,
  padding: 0,
});

globalStyle('html, body, #root', {
  height: '100%',
  width: '100%',
  overflow: 'hidden',
});

globalStyle('body', {
  fontFamily: tokens.font.ui,
  fontSize: tokens.fontSize.md,
  lineHeight: tokens.lineHeight.normal,
  color: tokens.color.ink,
  backgroundColor: tokens.color.bg,
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
  textRendering: 'optimizeLegibility',
});

// ─── Focus-visible global ring ────────────────────────────────────────────────
// Each pseudo must be its own globalStyle call — nested selectors are NOT valid
// inside globalStyle(), only inside style().

globalStyle(':focus-visible', {
  outlineColor: tokens.color.accent,
  outlineWidth: '2px',
  outlineStyle: 'solid',
  outlineOffset: '2px',
});

globalStyle(':focus:not(:focus-visible)', {
  outline: 'none',
});

// ─── App Shell ────────────────────────────────────────────────────────────────

export const appShell = style({
  display: 'flex',
  height: '100%',
  width: '100%',
  overflow: 'hidden',
  position: 'relative',
});

export const sidebarShell = style({
  width: tokens.size.sidebarWidth,
  minWidth: tokens.size.sidebarMinWidth,
  flexShrink: 0,
  height: '100%',
  overflow: 'hidden',
  backgroundColor: tokens.color.bgSidebar,
  borderRight: `1px solid ${tokens.color.border}`,
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  zIndex: tokens.zIndex.sidebar,
  transition: `transform ${tokens.motion.durationSlow} ${tokens.motion.easeOut}`,

  // Mobile: sidebar is off-canvas by default, slides in when .sidebar-open added
  '@media': {
    '(max-width: 768px)': {
      position: 'fixed',
      top: 0,
      left: 0,
      bottom: 0,
      transform: 'translateX(-100%)',
      zIndex: tokens.zIndex.overlay,
      width: '80vw',
      maxWidth: '320px',
      boxShadow: '4px 0 24px rgba(26, 21, 16, 0.18)',
    },
  },
});

export const sidebarShellOpen = style({
  '@media': {
    '(max-width: 768px)': {
      transform: 'translateX(0)',
    },
  },
});

export const backdrop = style({
  display: 'none',
  '@media': {
    '(max-width: 768px)': {
      display: 'block',
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(26, 21, 16, 0.4)',
      zIndex: tokens.zIndex.backdrop,
      opacity: 0,
      pointerEvents: 'none',
      transition: `opacity ${tokens.motion.durationSlow} ${tokens.motion.easeOut}`,
    },
  },
});

export const backdropVisible = style({
  '@media': {
    '(max-width: 768px)': {
      opacity: 1,
      pointerEvents: 'auto',
    },
  },
});

export const editorShell = style({
  flex: 1,
  height: '100%',
  overflow: 'hidden',
  position: 'relative',
  backgroundColor: tokens.color.bg,
});

// Mobile: hamburger button to open sidebar
export const mobileMenuBtn = style({
  display: 'none',
  '@media': {
    '(max-width: 768px)': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'absolute',
      top: tokens.space['4'],
      left: tokens.space['4'],
      width: '36px',
      height: '36px',
      background: tokens.color.bgSidebar,
      border: `1px solid ${tokens.color.border}`,
      borderRadius: tokens.radius.sm,
      color: tokens.color.inkSecondary,
      cursor: 'pointer',
      zIndex: '5',
    },
  },

  selectors: {
    '&:focus-visible': {
      outlineColor: tokens.color.accent,
      outlineWidth: '2px',
      outlineStyle: 'solid',
      outlineOffset: '2px',
    },
  },
});

// Empty-state welcome screen when no note is selected
export const welcomePane = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  gap: tokens.space['4'],
  color: tokens.color.inkFaint,
  userSelect: 'none',
});

export const welcomeTitle = style({
  fontFamily: tokens.font.display,
  fontSize: tokens.fontSize['3xl'],
  fontWeight: tokens.fontWeight.bold,
  color: tokens.color.ink,
  letterSpacing: '-0.02em',
  lineHeight: tokens.lineHeight.display,
});

export const welcomeSubtitle = style({
  fontFamily: tokens.font.ui,
  fontSize: tokens.fontSize.md,
  color: tokens.color.inkSecondary,
  lineHeight: tokens.lineHeight.relaxed,
  maxWidth: '28ch',
  textAlign: 'center',
});
