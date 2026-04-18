/**
 * global.css.ts — App-wide reset, layout shells, typography defaults.
 *
 * vanilla-extract rules applied here:
 *  - globalStyle(selector, cssProperties) — plain CSS values only, no nesting
 *  - style({}) — supports @media, selectors nesting (for exported class names)
 *  - One selector per globalStyle() call for pseudo variants
 *  - Parent-selector form: globalStyle(`${parent} .child`, ...) not descendant nesting
 *  - prefers-reduced-motion and prefers-color-scheme handled via @media in style()
 */
import { globalStyle, style, keyframes } from '@vanilla-extract/css';
import { tokens } from './tokens.css';  // resolved by vanilla-extract plugin

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

// ─── prefers-reduced-motion ───────────────────────────────────────────────────

globalStyle('*', {
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animationDuration: '0.01ms !important' as string,
      animationIterationCount: '1 !important' as string,
      transitionDuration: '0.01ms !important' as string,
    },
  },
});

// ─── Scrollbar (WebKit global) ────────────────────────────────────────────────

globalStyle('::-webkit-scrollbar', {
  width: '6px',
  height: '6px',
});

globalStyle('::-webkit-scrollbar-track', {
  background: 'transparent',
});

globalStyle('::-webkit-scrollbar-thumb', {
  background: tokens.color.inkGhost,
  borderRadius: tokens.radius.full,
});

globalStyle('::-webkit-scrollbar-thumb:hover', {
  background: tokens.color.inkFaint,
});

// ─── Focus ring ───────────────────────────────────────────────────────────────

globalStyle(':focus-visible', {
  outlineColor: tokens.color.accent,
  outlineWidth: '2px',
  outlineStyle: 'solid',
  outlineOffset: '2px',
});

globalStyle(':focus:not(:focus-visible)', {
  outline: 'none',
});

// ─── App Shell (exported — used as className in App.tsx) ──────────────────────

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
  overflowY: 'auto',
  overflowX: 'hidden',
  backgroundColor: tokens.color.bgSidebar,
  borderRight: `1px solid ${tokens.color.border}`,
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  zIndex: tokens.zIndex.sidebar,
  scrollbarWidth: 'thin',
  scrollbarColor: `${tokens.color.inkGhost} transparent`,
  transition: `transform ${tokens.motion.durationSlow} ${tokens.motion.easeOut}`,
  '@media': {
    '(max-width: 768px)': {
      position: 'fixed',
      top: '0',
      left: '0',
      height: '100%',
      transform: 'translateX(-100%)',
      zIndex: tokens.zIndex.overlay,
    },
  },
});

export const editorShell = style({
  flex: 1,
  height: '100%',
  overflow: 'hidden',
  position: 'relative',
  backgroundColor: tokens.color.bg,
  display: 'flex',
  flexDirection: 'column',
});

export const sidebarOverlay = style({
  display: 'none',
  '@media': {
    '(max-width: 768px)': {
      display: 'block',
      position: 'fixed',
      inset: '0',
      background: 'rgba(26, 21, 16, 0.4)',
      zIndex: '15',
      opacity: 0,
      pointerEvents: 'none',
      transition: `opacity ${tokens.motion.durationMedium} ${tokens.motion.easeOut}`,
    },
  },
});

// Sidebar open states — use parent selector form
globalStyle(`${appShell}[data-sidebar-open] ${sidebarOverlay}`, {
  opacity: 1,
  pointerEvents: 'auto',
});

globalStyle(`${appShell}[data-sidebar-open] ${sidebarShell}`, {
  transform: 'translateX(0)',
});

// ─── Editor crossfade ─────────────────────────────────────────────────────────

globalStyle('.editor-root', {
  flex: 1,
  width: '100%',
  minHeight: '0',
  transition: `opacity ${tokens.motion.durationFast} ${tokens.motion.easeOut}`,
});

globalStyle('.editor-root[data-transitioning]', {
  opacity: 0.55,
  pointerEvents: 'none',
});

// ─── Sidebar: header ─────────────────────────────────────────────────────────

globalStyle('.sidebar-header', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: `${tokens.space['5']} ${tokens.space['4']}`,
  paddingBottom: tokens.space['3'],
  borderBottom: `1px solid ${tokens.color.border}`,
  flexShrink: 0,
});

globalStyle('.app-name', {
  fontFamily: tokens.font.display,
  fontSize: tokens.fontSize['2xl'],
  fontWeight: tokens.fontWeight.bold,
  lineHeight: tokens.lineHeight.display,
  color: tokens.color.ink,
  letterSpacing: '-0.02em',
  userSelect: 'none',
});

globalStyle('.new-note-btn', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '28px',
  height: '28px',
  border: `1px solid ${tokens.color.border}`,
  borderRadius: tokens.radius.sm,
  background: 'transparent',
  color: tokens.color.inkSecondary,
  cursor: 'pointer',
  transition: `color ${tokens.motion.durationFast} ${tokens.motion.easeOut},
               border-color ${tokens.motion.durationFast} ${tokens.motion.easeOut},
               background-color ${tokens.motion.durationFast} ${tokens.motion.easeOut}`,
});

globalStyle('.new-note-btn:hover', {
  color: tokens.color.accent,
  borderColor: tokens.color.accent,
  backgroundColor: tokens.color.accentFaint,
});

globalStyle('.new-note-btn:focus-visible', {
  outline: `2px solid ${tokens.color.accent}`,
  outlineOffset: '2px',
});

// ─── Mobile hamburger ─────────────────────────────────────────────────────────

export const hamburgerBtn = style({
  display: 'none',
  '@media': {
    '(max-width: 768px)': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '36px',
      height: '36px',
      margin: `${tokens.space['2']} ${tokens.space['3']}`,
      border: `1px solid ${tokens.color.border}`,
      borderRadius: tokens.radius.sm,
      background: 'transparent',
      color: tokens.color.inkSecondary,
      cursor: 'pointer',
      flexShrink: 0,
    },
  },
});

// ─── Sidebar: search ─────────────────────────────────────────────────────────

globalStyle('.search-wrapper', {
  position: 'relative',
  padding: `${tokens.space['3']} ${tokens.space['4']}`,
  flexShrink: 0,
});

globalStyle('.search-icon', {
  position: 'absolute',
  left: `calc(${tokens.space['4']} + 10px)`,
  top: '50%',
  transform: 'translateY(-50%)',
  color: tokens.color.inkFaint,
  pointerEvents: 'none',
});

globalStyle('.search-input', {
  width: '100%',
  padding: `${tokens.space['2']} ${tokens.space['3']}`,
  paddingLeft: '30px',
  fontFamily: tokens.font.ui,
  fontSize: tokens.fontSize.sm,
  color: tokens.color.ink,
  backgroundColor: tokens.color.bg,
  border: `1px solid ${tokens.color.border}`,
  borderRadius: tokens.radius.sm,
  outline: 'none',
  transition: `border-color ${tokens.motion.durationFast} ${tokens.motion.easeOut}`,
});

globalStyle('.search-input::placeholder', {
  color: tokens.color.inkFaint,
});

globalStyle('.search-input:focus', {
  borderColor: tokens.color.accent,
});

globalStyle('.search-input::-webkit-search-cancel-button', {
  display: 'none',
});

// ─── Sidebar: note list ───────────────────────────────────────────────────────

globalStyle('.notes-ul', {
  flex: 1,
  overflow: 'auto',
  listStyle: 'none',
  padding: `${tokens.space['2']} 0`,
  scrollbarWidth: 'thin',
  scrollbarColor: `${tokens.color.inkGhost} transparent`,
});

globalStyle('.note-list-item', {
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  gap: tokens.space['1'],
  padding: `${tokens.space['3']} ${tokens.space['4']}`,
  paddingLeft: `calc(${tokens.space['4']} + 4px)`,
  cursor: 'pointer',
  borderLeft: '2px solid transparent',
  transition: `background-color ${tokens.motion.durationFast} ${tokens.motion.easeOut},
               border-color ${tokens.motion.durationFast} ${tokens.motion.easeOut}`,
});

globalStyle('.note-list-item:hover', {
  backgroundColor: tokens.color.bgHover,
});

globalStyle('.note-list-item.is-active', {
  backgroundColor: tokens.color.bgActive,
  borderLeftColor: tokens.color.accent,
});

// Reveal delete button — parent selector form
globalStyle('.note-list-item:hover .note-delete-btn', {
  opacity: 1,
});

globalStyle('.note-list-item.is-active .note-delete-btn', {
  opacity: 1,
});

globalStyle('.note-title', {
  fontFamily: tokens.font.display,
  fontSize: tokens.fontSize.md,
  fontWeight: tokens.fontWeight.semibold,
  lineHeight: tokens.lineHeight.tight,
  color: tokens.color.ink,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  display: 'block',
  paddingRight: '24px',
  userSelect: 'none',
  cursor: 'text',
});

globalStyle('.note-title-input', {
  fontFamily: tokens.font.display,
  fontSize: tokens.fontSize.md,
  fontWeight: tokens.fontWeight.semibold,
  lineHeight: tokens.lineHeight.tight,
  color: tokens.color.ink,
  backgroundColor: 'transparent',
  border: 'none',
  borderBottom: `1px solid ${tokens.color.accent}`,
  outline: 'none',
  width: '100%',
  padding: '0',
});

globalStyle('.note-snippet', {
  fontFamily: tokens.font.ui,
  fontSize: tokens.fontSize.xs,
  lineHeight: tokens.lineHeight.normal,
  color: tokens.color.inkSecondary,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  userSelect: 'none',
});

// ─── Dirty dot ────────────────────────────────────────────────────────────────

const dirtyPulse = keyframes({
  '0%':   { transform: 'translateY(-50%) scale(0.5)', opacity: '0' },
  '60%':  { transform: 'translateY(-50%) scale(1.3)' },
  '100%': { transform: 'translateY(-50%) scale(1)',   opacity: '1' },
});

globalStyle('.dirty-dot', {
  position: 'absolute',
  top: '50%',
  right: tokens.space['8'],
  width: '6px',
  height: '6px',
  borderRadius: tokens.radius.full,
  backgroundColor: tokens.color.dirty,
  transform: 'translateY(-50%)',
  opacity: '0',
  transition: `opacity ${tokens.motion.durationMedium} ${tokens.motion.easeOut}`,
  pointerEvents: 'none',
});

globalStyle('.dirty-dot.is-visible', {
  opacity: '1',
  animation: `${dirtyPulse} ${tokens.motion.durationMedium} ${tokens.motion.easeOut} forwards`,
});

// ─── Delete button ────────────────────────────────────────────────────────────

globalStyle('.note-delete-btn', {
  position: 'absolute',
  top: '50%',
  right: tokens.space['3'],
  transform: 'translateY(-50%)',
  width: '20px',
  height: '20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'transparent',
  border: 'none',
  color: tokens.color.inkFaint,
  cursor: 'pointer',
  opacity: '0',
  transition: `opacity ${tokens.motion.durationFast} ${tokens.motion.easeOut},
               color ${tokens.motion.durationFast} ${tokens.motion.easeOut}`,
  borderRadius: tokens.radius.sm,
});

globalStyle('.note-delete-btn:hover', {
  color: tokens.color.accent,
  opacity: '1',
});

globalStyle('.note-delete-btn:focus-visible', {
  outline: `2px solid ${tokens.color.accent}`,
  outlineOffset: '1px',
  opacity: '1',
});

// ─── Empty state ──────────────────────────────────────────────────────────────

globalStyle('.empty-state', {
  padding: `${tokens.space['8']} ${tokens.space['4']}`,
  fontFamily: tokens.font.ui,
  fontSize: tokens.fontSize.sm,
  color: tokens.color.inkFaint,
  textAlign: 'center',
  lineHeight: tokens.lineHeight.relaxed,
});

// ─── Sidebar footer ───────────────────────────────────────────────────────────

globalStyle('.sidebar-footer', {
  padding: `${tokens.space['3']} ${tokens.space['4']}`,
  borderTop: `1px solid ${tokens.color.border}`,
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  gap: tokens.space['3'],
});

globalStyle('.note-count', {
  fontFamily: tokens.font.ui,
  fontSize: tokens.fontSize.xs,
  color: tokens.color.inkFaint,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
});

globalStyle('.save-status', {
  fontFamily: tokens.font.ui,
  fontSize: tokens.fontSize.xs,
  color: tokens.color.inkFaint,
  letterSpacing: '0.04em',
  marginLeft: 'auto',
  transition: `opacity ${tokens.motion.durationMedium} ${tokens.motion.easeOut}`,
});

// ─── Editor toolbar ───────────────────────────────────────────────────────────

globalStyle('.editor-toolbar', {
  display: 'flex',
  alignItems: 'center',
  padding: `${tokens.space['2']} ${tokens.space['4']}`,
  borderBottom: `1px solid ${tokens.color.border}`,
  flexShrink: 0,
});

globalStyle('.editor-word-count', {
  fontFamily: tokens.font.ui,
  fontSize: tokens.fontSize.xs,
  color: tokens.color.inkFaint,
  letterSpacing: '0.04em',
  marginLeft: 'auto',
});

// ─── Empty editor placeholder ─────────────────────────────────────────────────

globalStyle('.editor-placeholder', {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  flex: 1,
  gap: tokens.space['4'],
  fontFamily: tokens.font.ui,
  color: tokens.color.inkFaint,
});

globalStyle('.editor-placeholder-title', {
  fontFamily: tokens.font.display,
  fontSize: tokens.fontSize['2xl'],
  fontWeight: tokens.fontWeight.bold,
  color: tokens.color.ink,
  letterSpacing: '-0.02em',
});

globalStyle('.editor-placeholder-hint', {
  fontSize: tokens.fontSize.sm,
  color: tokens.color.inkFaint,
});

globalStyle('.editor-placeholder kbd', {
  fontFamily: tokens.font.mono,
  fontSize: tokens.fontSize.xs,
  padding: `1px ${tokens.space['1']}`,
  border: `1px solid ${tokens.color.border}`,
  borderRadius: tokens.radius.sm,
  background: tokens.color.bgSidebar,
});
