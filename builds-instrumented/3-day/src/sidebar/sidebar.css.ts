/**
 * sidebar.css.ts — sidebar and note list component styles
 *
 * Rules:
 *   - globalStyle() pseudo-variants are SEPARATE calls, not nested selectors.
 *   - style() is used for classes exported and applied in JSX.
 *   - Mobile layout handled via @media inside style() objects — NOT in globalStyle().
 */
import { style } from '@vanilla-extract/css';
import { tokens } from '../design/tokens.css';

// ─── Sidebar nav ──────────────────────────────────────────────────────────────

export const sidebarNav = style({
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
    '&:focus-visible': {
      outline: `2px solid ${tokens.color.accent}`,
      outlineOffset: '2px',
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
  transition: `border-color ${tokens.motion.durationFast} ${tokens.motion.easeOut}`,

  selectors: {
    '&::placeholder': { color: tokens.color.inkFaint },
    '&:focus': { borderColor: tokens.color.accent },
    '&::-webkit-search-cancel-button': { display: 'none' },
  },
});

// ─── Notes list ───────────────────────────────────────────────────────────────

export const notesUl = style({
  flex: 1,
  overflowY: 'auto',
  overflowX: 'hidden',
  listStyle: 'none',
  padding: `${tokens.space['2']} 0`,
});

export const noteItem = style({
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
    '&:hover': {
      backgroundColor: tokens.color.bgHover,
    },
    '&[data-active="true"]': {
      backgroundColor: tokens.color.bgActive,
      borderLeftColor: tokens.color.accent,
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
  paddingRight: '24px',
  userSelect: 'none',
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
  padding: 0,
});

export const noteSnippet = style({
  fontFamily: tokens.font.ui,
  fontSize: tokens.fontSize.xs,
  lineHeight: tokens.lineHeight.normal,
  color: tokens.color.inkSecondary,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  userSelect: 'none',
});

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

  selectors: {
    '&[data-visible="true"]': {
      opacity: 1,
    },
  },
});

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
    // Reveal when parent note item is hovered or active
    [`${noteItem}:hover &`]: {
      opacity: 1,
    },
    [`${noteItem}[data-active="true"] &`]: {
      opacity: 1,
    },
  },
});

// ─── Empty state ──────────────────────────────────────────────────────────────

export const emptyState = style({
  padding: `${tokens.space['8']} ${tokens.space['4']}`,
  fontFamily: tokens.font.ui,
  fontSize: tokens.fontSize.sm,
  color: tokens.color.inkFaint,
  textAlign: 'center',
  lineHeight: tokens.lineHeight.relaxed,
});

// ─── Footer ───────────────────────────────────────────────────────────────────

export const sidebarFooter = style({
  padding: `${tokens.space['3']} ${tokens.space['4']}`,
  borderTop: `1px solid ${tokens.color.border}`,
  flexShrink: 0,
});

export const noteCount = style({
  fontFamily: tokens.font.ui,
  fontSize: tokens.fontSize.xs,
  color: tokens.color.inkFaint,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
});
