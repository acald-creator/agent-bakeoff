/**
 * global.css.ts — vanilla-extract global styles for Ink
 *
 * This file wires the token contract (tokens.ts) into actual CSS and adds
 * the layout primitives. Component-level styles live in co-located .css.ts files.
 *
 * Philosophy:
 *   - Global styles are minimal: reset + layout shells + typography defaults.
 *   - Every component manages its own styling; no "utility class" soup.
 *   - The app layout is a simple flex row: sidebar | editor.
 *   - The editor is max-width constrained and centered within its flex cell.
 *
 * Aesthetic intent:
 *   - Warm aged-paper background, not pure white or dark charcoal.
 *   - No border-radius on the sidebar/editor split — hard geometry.
 *   - Sidebar has a thin 1px right border, not a box-shadow.
 *   - All interactive elements have a clear :focus-visible ring.
 *   - Transitions are declared here for note-switch crossfade and dirty dot.
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

// ─── Focus-visible ring (global) ────────────────────────────────────────────

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
});

export const editorShell = style({
  flex: 1,
  height: '100%',
  overflow: 'hidden',
  position: 'relative',
  backgroundColor: tokens.color.bg,
});

// ─── Narrow viewport: sidebar becomes an overlay sheet ───────────────────────

export const sidebarOverlay = style({
  '@media': {
    '(max-width: 768px)': {
      position: 'fixed',
      top: 0,
      left: 0,
      bottom: 0,
      zIndex: tokens.zIndex.overlay,
      boxShadow: tokens.shadow.lg,
      transform: 'translateX(-100%)',
    },
  },
});

export const sidebarOverlayOpen = style({
  '@media': {
    '(max-width: 768px)': {
      transform: 'translateX(0)',
    },
  },
});

// ─── Mobile backdrop ─────────────────────────────────────────────────────────

export const mobileBackdrop = style({
  display: 'none',
  '@media': {
    '(max-width: 768px)': {
      display: 'block',
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(26, 21, 16, 0.4)',
      zIndex: `calc(${tokens.zIndex.overlay} - 1)`,
      opacity: 0,
      pointerEvents: 'none',
      transition: `opacity ${tokens.motion.durationMedium} ${tokens.motion.easeOut}`,
    },
  },
});

export const mobileBackdropVisible = style({
  '@media': {
    '(max-width: 768px)': {
      opacity: 1,
      pointerEvents: 'auto',
    },
  },
});

// ─── Mobile menu button ───────────────────────────────────────────────────────

export const mobileMenuBtn = style({
  display: 'none',
  '@media': {
    '(max-width: 768px)': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'fixed',
      top: tokens.space['3'],
      left: tokens.space['3'],
      zIndex: tokens.zIndex.above,
      width: '36px',
      height: '36px',
      backgroundColor: tokens.color.bgSidebar,
      border: `1px solid ${tokens.color.border}`,
      borderRadius: tokens.radius.md,
      color: tokens.color.inkSecondary,
      cursor: 'pointer',
      boxShadow: tokens.shadow.sm,
    },
  },
});
