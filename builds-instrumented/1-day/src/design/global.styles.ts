/**
 * global.css.ts — vanilla-extract global styles
 *
 * Minimal reset + layout shells + typography defaults.
 * Editor crossfade and sidebar transitions are declared here.
 */
import { globalStyle } from '@vanilla-extract/css';
import { tokens } from './tokens';

// ─── CSS custom properties (referenced by CodeMirror theme) ──────────────────
// We inject these as CSS vars on :root so the CM6 EditorView.theme() can use them.

globalStyle(':root', {
  vars: {
    '--color-bg':          tokens.color.bg,
    '--color-ink':         tokens.color.ink,
    '--color-accent':      tokens.color.accent,
    '--color-inkFaint':    tokens.color.inkFaint,
    '--color-inkGhost':    tokens.color.inkGhost,
    '--color-cursorLine':  tokens.color.cursorLine,
    '--color-selection':   tokens.color.selection,
    '--font-prose':        tokens.font.prose,
    '--font-mono':         tokens.font.mono,
    '--line-height-relaxed': tokens.lineHeight.relaxed,
    '--size-editorMaxWidth': tokens.size.editorMaxWidth,
    '--size-editorPaddingY': tokens.size.editorPaddingY,
    '--size-editorPaddingX': tokens.size.editorPaddingX,
  },
});

// ─── Reset ────────────────────────────────────────────────────────────────────

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
});

// ─── Editor crossfade ─────────────────────────────────────────────────────────

globalStyle('.editor-root', {
  height: '100%',
  width: '100%',
  transition: `opacity ${tokens.motion.durationFast} ${tokens.motion.easeOut}`,
});

globalStyle('.editor-root[data-transitioning]', {
  opacity: 0.55,
  pointerEvents: 'none',
});

// ─── Sidebar components ───────────────────────────────────────────────────────

globalStyle('.sidebar', {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  overflow: 'hidden',
});

globalStyle('.sidebar-header', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: `${tokens.space['5']} ${tokens.space['4']} ${tokens.space['3']}`,
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
  transition: `color ${tokens.motion.durationFast}, border-color ${tokens.motion.durationFast}, background ${tokens.motion.durationFast}`,
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

// ─── Search ───────────────────────────────────────────────────────────────────

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
  transition: `border-color ${tokens.motion.durationFast}`,
});

globalStyle('.search-input::placeholder', {
  color: tokens.color.inkFaint,
});

globalStyle('.search-input:focus', {
  borderColor: tokens.color.accent,
});

// ─── Note list ────────────────────────────────────────────────────────────────

globalStyle('.notes-ul', {
  flex: 1,
  overflow: 'auto',
  listStyle: 'none',
  padding: `${tokens.space['2']} 0`,
  minHeight: 0,
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
  transition: `background-color ${tokens.motion.durationFast}, border-color ${tokens.motion.durationFast}`,
});

globalStyle('.note-list-item:hover', {
  backgroundColor: tokens.color.bgHover,
});

globalStyle('.note-list-item.is-active', {
  backgroundColor: tokens.color.bgActive,
  borderLeftColor: tokens.color.accent,
});

globalStyle('.note-list-item:hover .note-delete-btn, .note-list-item.is-active .note-delete-btn', {
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
  paddingRight: '20px',
  userSelect: 'none',
});

globalStyle('.note-title-input', {
  fontFamily: tokens.font.display,
  fontSize: tokens.fontSize.md,
  fontWeight: tokens.fontWeight.semibold,
  color: tokens.color.ink,
  backgroundColor: 'transparent',
  border: 'none',
  borderBottom: `1px solid ${tokens.color.accent}`,
  outline: 'none',
  width: '100%',
  padding: '0',
  paddingRight: '20px',
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
});

globalStyle('.dirty-dot.is-visible', {
  opacity: 1,
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
  transition: `opacity ${tokens.motion.durationFast}, color ${tokens.motion.durationFast}`,
  borderRadius: tokens.radius.sm,
});

globalStyle('.note-delete-btn:hover', {
  color: tokens.color.accent,
  opacity: 1,
});

globalStyle('.note-delete-btn:focus-visible', {
  outline: `2px solid ${tokens.color.accent}`,
  outlineOffset: '1px',
  opacity: 1,
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
});

globalStyle('.note-count', {
  fontFamily: tokens.font.ui,
  fontSize: tokens.fontSize.xs,
  color: tokens.color.inkFaint,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
});

// ─── Focus-visible ────────────────────────────────────────────────────────────

globalStyle(':focus-visible', {
  outlineColor: tokens.color.accent,
  outlineWidth: '2px',
  outlineStyle: 'solid',
  outlineOffset: '2px',
});

globalStyle(':focus:not(:focus-visible)', {
  outline: 'none',
});

// ─── Empty editor prompt ──────────────────────────────────────────────────────

globalStyle('.editor-empty-prompt', {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: tokens.space['4'],
  color: tokens.color.inkFaint,
  fontFamily: tokens.font.ui,
  fontSize: tokens.fontSize.sm,
  pointerEvents: 'none',
  userSelect: 'none',
});

globalStyle('.editor-empty-prompt-hint', {
  fontSize: tokens.fontSize.xs,
  color: tokens.color.inkGhost,
});
