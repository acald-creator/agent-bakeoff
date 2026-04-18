/**
 * sidebar.css.ts — vanilla-extract styles for the Sidebar, NoteList, NoteListItem, Search.
 *
 * All sidebar chrome lives here. Component logic lives in the .tsx files.
 * This separation means styles are compiled away at build time — zero runtime overhead.
 */
import { style } from '@vanilla-extract/css';
import { tokens } from '../design/tokens.css';

// ─── Sidebar root ─────────────────────────────────────────────────────────────

export const sidebar = style({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  overflow: 'hidden',
});

// ─── Header ───────────────────────────────────────────────────────────────────

export const sidebarHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: `${tokens.space['5']} ${tokens.space['4']}`,
  paddingBottom: tokens.space['3'],
  borderBottom: `1px solid ${tokens.color.border}`,
  flexShrink: 0,
});

export const appName = style({
  fontFamily: tokens.font.display,
  fontSize: tokens.fontSize['2xl'],
  fontWeight: tokens.fontWeight.bold,
  lineHeight: tokens.lineHeight.display,
  color: tokens.color.ink,
  letterSpacing: '-0.02em',
  userSelect: 'none',
});

export const newNoteBtn = style({
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
  flexShrink: 0,
  transition: `color ${tokens.motion.durationFast} ${tokens.motion.easeOut},
               border-color ${tokens.motion.durationFast} ${tokens.motion.easeOut},
               background-color ${tokens.motion.durationFast} ${tokens.motion.easeOut}`,
  selectors: {
    '&:hover': {
      color: tokens.color.accent,
      borderColor: tokens.color.accent,
      backgroundColor: tokens.color.accentFaint,
    },
    '&:focus-visible': {
      outline: `2px solid ${tokens.color.accent}`,
      outlineOffset: '2px',
    },
    '&:active': {
      backgroundColor: tokens.color.accentFaint,
    },
  },
});

// ─── Search ───────────────────────────────────────────────────────────────────

export const searchWrapper = style({
  position: 'relative',
  padding: `${tokens.space['3']} ${tokens.space['4']}`,
  flexShrink: 0,
});

export const searchIcon = style({
  position: 'absolute',
  left: `calc(${tokens.space['4']} + 10px)`,
  top: '50%',
  transform: 'translateY(-50%)',
  color: tokens.color.inkFaint,
  pointerEvents: 'none',
  zIndex: 1,
});

export const searchInput = style({
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
  transition: `border-color ${tokens.motion.durationFast} ${tokens.motion.easeOut},
               box-shadow ${tokens.motion.durationFast} ${tokens.motion.easeOut}`,
  selectors: {
    '&::placeholder': { color: tokens.color.inkFaint },
    '&:focus': {
      borderColor: tokens.color.accent,
      boxShadow: `0 0 0 3px ${tokens.color.accentFaint}`,
    },
  },
});

// ─── Note list ────────────────────────────────────────────────────────────────

export const notesUl = style({
  flex: 1,
  overflowY: 'auto',
  overflowX: 'hidden',
  listStyle: 'none',
  padding: `${tokens.space['2']} 0`,
  // Custom scrollbar
  selectors: {
    '&::-webkit-scrollbar':       { width: '4px' },
    '&::-webkit-scrollbar-track': { background: 'transparent' },
    '&::-webkit-scrollbar-thumb': {
      background: tokens.color.inkGhost,
      borderRadius: '2px',
    },
  },
});

export const emptyList = style({
  padding: `${tokens.space['8']} ${tokens.space['4']}`,
  fontFamily: tokens.font.ui,
  fontSize: tokens.fontSize.sm,
  color: tokens.color.inkFaint,
  textAlign: 'center',
  lineHeight: tokens.lineHeight.relaxed,
});

// ─── Note list item ───────────────────────────────────────────────────────────

export const noteListItem = style({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  gap: tokens.space['1'],
  padding: `${tokens.space['3']} ${tokens.space['4']}`,
  paddingLeft: `calc(${tokens.space['4']} + 4px)`,  // Room for active left border
  cursor: 'pointer',
  borderLeft: '2px solid transparent',
  userSelect: 'none',
  transition: `background-color ${tokens.motion.durationFast} ${tokens.motion.easeOut},
               border-color ${tokens.motion.durationFast} ${tokens.motion.easeOut}`,
  selectors: {
    '&:hover': {
      backgroundColor: tokens.color.bgHover,
    },
    '&:focus-visible': {
      outline: `2px solid ${tokens.color.accent}`,
      outlineOffset: '-2px',
      borderRadius: tokens.radius.sm,
    },
  },
});

export const noteListItemActive = style({
  backgroundColor: tokens.color.bgActive,
  borderLeftColor: tokens.color.accent,
  selectors: {
    '&:hover': {
      backgroundColor: tokens.color.bgActive,
    },
  },
});

export const noteTitle = style({
  fontFamily: tokens.font.display,
  fontSize: tokens.fontSize.md,
  fontWeight: tokens.fontWeight.semibold,
  lineHeight: tokens.lineHeight.tight,
  color: tokens.color.ink,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  display: 'block',
  paddingRight: '24px',  // Space for delete button
  cursor: 'pointer',
});

export const noteTitleInput = style({
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
  selectors: {
    '&:focus': {
      borderBottomColor: tokens.color.accentHover,
    },
  },
});

export const noteSnippet = style({
  fontFamily: tokens.font.ui,
  fontSize: tokens.fontSize.xs,
  lineHeight: tokens.lineHeight.normal,
  color: tokens.color.inkSecondary,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  display: 'block',
});

export const noteDate = style({
  fontFamily: tokens.font.ui,
  fontSize: tokens.fontSize.xs,
  color: tokens.color.inkFaint,
  letterSpacing: '0.01em',
});

// ─── Dirty dot ────────────────────────────────────────────────────────────────

export const dirtyDot = style({
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
});

export const dirtyDotVisible = style({
  opacity: 1,
});

// ─── Delete button ────────────────────────────────────────────────────────────

export const deleteBtn = style({
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
  borderRadius: tokens.radius.sm,
  transition: `opacity ${tokens.motion.durationFast} ${tokens.motion.easeOut},
               color ${tokens.motion.durationFast} ${tokens.motion.easeOut},
               background-color ${tokens.motion.durationFast} ${tokens.motion.easeOut}`,
  selectors: {
    '&:hover': {
      color: tokens.color.accent,
      backgroundColor: tokens.color.accentFaint,
    },
    '&:focus-visible': {
      outline: `2px solid ${tokens.color.accent}`,
      outlineOffset: '1px',
      opacity: 1,
    },
  },
});

export const deleteBtnVisible = style({
  opacity: 1,
});

// ─── Footer ───────────────────────────────────────────────────────────────────

export const sidebarFooter = style({
  padding: `${tokens.space['3']} ${tokens.space['4']}`,
  borderTop: `1px solid ${tokens.color.border}`,
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

export const noteCount = style({
  fontFamily: tokens.font.ui,
  fontSize: tokens.fontSize.xs,
  color: tokens.color.inkFaint,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
});
