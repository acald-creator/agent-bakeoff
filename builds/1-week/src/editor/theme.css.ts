/**
 * theme.css.ts — vanilla-extract styles for the Editor container.
 *
 * The CodeMirror view itself is themed via EditorView.theme() in extensions.ts
 * (using CSS custom properties set by tokens.ts). This file styles the
 * wrapper element and the empty-state/no-note-selected placeholder.
 */
import { style, globalStyle } from '@vanilla-extract/css';
import { tokens } from '../design/tokens.css';

// ─── Editor root container ────────────────────────────────────────────────────

export const editorRoot = style({
  height: '100%',
  width: '100%',
  transition: `opacity ${tokens.motion.durationFast} ${tokens.motion.easeOut}`,
  position: 'relative',
});

// data-transitioning is toggled by Editor.tsx during note switches
globalStyle(`[data-transitioning].${editorRoot}`, {
  opacity: 0.55,
  pointerEvents: 'none',
});

// ─── Empty state (no note selected) ──────────────────────────────────────────

export const emptyEditorWrapper = style({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: tokens.space['3'],
  padding: tokens.space['8'],
});

export const emptyEditorIcon = style({
  width: '48px',
  height: '48px',
  color: tokens.color.inkGhost,
  marginBottom: tokens.space['2'],
});

export const emptyEditorTitle = style({
  fontFamily: tokens.font.display,
  fontSize: tokens.fontSize.xl,
  fontWeight: tokens.fontWeight.semibold,
  color: tokens.color.inkSecondary,
  letterSpacing: '-0.01em',
  textAlign: 'center',
});

export const emptyEditorSubtitle = style({
  fontFamily: tokens.font.ui,
  fontSize: tokens.fontSize.sm,
  color: tokens.color.inkFaint,
  textAlign: 'center',
  lineHeight: tokens.lineHeight.relaxed,
});

export const emptyEditorNewBtn = style({
  marginTop: tokens.space['4'],
  padding: `${tokens.space['2']} ${tokens.space['5']}`,
  fontFamily: tokens.font.ui,
  fontSize: tokens.fontSize.sm,
  fontWeight: tokens.fontWeight.medium,
  color: tokens.color.bg,
  backgroundColor: tokens.color.accent,
  border: 'none',
  borderRadius: tokens.radius.sm,
  cursor: 'pointer',
  transition: `background-color ${tokens.motion.durationFast} ${tokens.motion.easeOut}`,
  selectors: {
    '&:hover': {
      backgroundColor: tokens.color.accentHover,
    },
    '&:focus-visible': {
      outline: `2px solid ${tokens.color.accent}`,
      outlineOffset: '2px',
    },
  },
});

// ─── Word count footer ────────────────────────────────────────────────────────

export const editorFooter = style({
  position: 'absolute',
  bottom: tokens.space['3'],
  right: tokens.space['5'],
  fontFamily: tokens.font.ui,
  fontSize: tokens.fontSize.xs,
  color: tokens.color.inkFaint,
  letterSpacing: '0.02em',
  userSelect: 'none',
  pointerEvents: 'none',
  transition: `opacity ${tokens.motion.durationMedium} ${tokens.motion.easeOut}`,
});
