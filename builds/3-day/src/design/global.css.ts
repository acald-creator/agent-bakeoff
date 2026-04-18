/**
 * global.css.ts — vanilla-extract global styles for Ink
 *
 * Wires the token contract into actual CSS.
 * Handles: CSS reset, layout shells, typography defaults, transitions.
 *
 * Token variable names follow the --ink-xxx convention declared in tokens.ts.
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

// ─── Focus-visible ring (global) ─────────────────────────────────────────────

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
  '@media': {
    'screen and (max-width: 767px)': {
      position: 'absolute',
      top: 0,
      left: 0,
      height: '100%',
      transform: `translateX(calc(-1 * ${tokens.size.sidebarWidth}))`,
      transition: `transform ${tokens.motion.durationMedium} ${tokens.motion.easeInOut}`,
      boxShadow: tokens.shadow.lg,
    },
  },
});

export const editorShell = style({
  flex: 1,
  height: '100%',
  overflow: 'hidden',
  position: 'relative',
  backgroundColor: tokens.color.bg,
  minWidth: 0,
});

// Mobile sidebar open state — appShell gains .sidebar-open class via JS
globalStyle(`.sidebar-open .${sidebarShell}`, {
  '@media': {
    'screen and (max-width: 767px)': {
      transform: 'translateX(0)',
    },
  },
});

// Mobile hamburger button — hidden on desktop, shown on mobile
export const mobileMenuBtn = style({
  display: 'none',
  '@media': {
    'screen and (max-width: 767px)': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'absolute',
      top: tokens.space['4'],
      left: tokens.space['4'],
      zIndex: tokens.zIndex.overlay,
      width: '32px',
      height: '32px',
      background: tokens.color.bg,
      border: `1px solid ${tokens.color.border}`,
      borderRadius: tokens.radius.sm,
      color: tokens.color.inkSecondary,
      cursor: 'pointer',
    },
  },
});

// ─── Editor crossfade transition ─────────────────────────────────────────────
// data-transitioning is set in Editor.tsx on note switch; drives opacity fade

globalStyle('.editor-root', {
  height: '100%',
  width: '100%',
  transition: `opacity ${tokens.motion.durationFast} ${tokens.motion.easeOut}`,
});

globalStyle('.editor-root[data-transitioning]', {
  opacity: 0.55,
  pointerEvents: 'none',
});

// ─── No-note placeholder in editor area ──────────────────────────────────────

export const editorPlaceholder = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  gap: tokens.space['3'],
  color: tokens.color.inkFaint,
  fontFamily: tokens.font.prose,
  fontSize: tokens.fontSize.lg,
  fontStyle: 'italic',
  userSelect: 'none',
  padding: tokens.space['8'],
  textAlign: 'center',
});

export const editorPlaceholderHint = style({
  fontFamily: tokens.font.ui,
  fontSize: tokens.fontSize.sm,
  fontStyle: 'normal',
  color: tokens.color.inkGhost,
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

globalStyle('.app-name-dot', {
  color: tokens.color.accent,
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
  transition: [
    `color ${tokens.motion.durationFast} ${tokens.motion.easeOut}`,
    `border-color ${tokens.motion.durationFast} ${tokens.motion.easeOut}`,
    `background-color ${tokens.motion.durationFast} ${tokens.motion.easeOut}`,
  ].join(', '),
  selectors: {
    '&:hover': {
      color: tokens.color.accent,
      borderColor: tokens.color.accent,
      backgroundColor: tokens.color.accentFaint,
    },
    '&:active': {
      transform: 'scale(0.93)',
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
  selectors: {
    '&::placeholder': { color: tokens.color.inkFaint },
    '&:focus':         { borderColor: tokens.color.accent },
    '&::-webkit-search-cancel-button': { display: 'none' },
  },
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

globalStyle('.notes-ul::-webkit-scrollbar', { width: '4px' });
globalStyle('.notes-ul::-webkit-scrollbar-thumb', {
  background: tokens.color.inkGhost,
  borderRadius: tokens.radius.full,
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
  transition: [
    `background-color ${tokens.motion.durationFast} ${tokens.motion.easeOut}`,
    `border-color ${tokens.motion.durationFast} ${tokens.motion.easeOut}`,
  ].join(', '),
  selectors: {
    '&:hover':                         { backgroundColor: tokens.color.bgHover },
    '&.is-active':                     { backgroundColor: tokens.color.bgActive, borderLeftColor: tokens.color.accent },
    '&:hover .note-delete-btn':        { opacity: 1 },
    '&.is-active .note-delete-btn':    { opacity: 0 },
    '&.is-active:hover .note-delete-btn': { opacity: 1 },
  },
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

globalStyle('.note-meta', {
  fontFamily: tokens.font.ui,
  fontSize: tokens.fontSize.xs,
  color: tokens.color.inkFaint,
  userSelect: 'none',
});

// ─── Dirty dot ───────────────────────────────────────────────────────────────

globalStyle('.dirty-dot', {
  position: 'absolute',
  top: '50%',
  right: tokens.space['8'],
  width: '6px',
  height: '6px',
  borderRadius: tokens.radius.full,
  backgroundColor: tokens.color.dirty,
  transform: 'translateY(-50%)',
  opacity: 0,
  transition: `opacity ${tokens.motion.durationMedium} ${tokens.motion.easeOut}`,
  pointerEvents: 'none',
  selectors: {
    '&.is-visible': { opacity: 1 },
  },
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
  opacity: 0,
  transition: [
    `opacity ${tokens.motion.durationFast} ${tokens.motion.easeOut}`,
    `color ${tokens.motion.durationFast} ${tokens.motion.easeOut}`,
  ].join(', '),
  borderRadius: tokens.radius.sm,
  selectors: {
    '&:hover': {
      color: tokens.color.accent,
      opacity: 1,
    },
    '&:focus-visible': {
      outline: `2px solid ${tokens.color.accent}`,
      outlineOffset: '1px',
      opacity: 1,
    },
  },
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
  justifyContent: 'space-between',
});

globalStyle('.note-count', {
  fontFamily: tokens.font.ui,
  fontSize: tokens.fontSize.xs,
  color: tokens.color.inkFaint,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  userSelect: 'none',
});

// ─── Word count (editor footer, absolutely positioned) ────────────────────────

export const editorFooter = style({
  position: 'absolute',
  bottom: 0,
  right: 0,
  padding: `${tokens.space['2']} ${tokens.space['4']}`,
  fontFamily: tokens.font.ui,
  fontSize: tokens.fontSize.xs,
  color: tokens.color.inkGhost,
  letterSpacing: '0.04em',
  userSelect: 'none',
  pointerEvents: 'none',
});
