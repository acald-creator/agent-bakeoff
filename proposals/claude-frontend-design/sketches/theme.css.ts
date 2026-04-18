/**
 * theme.css.ts — vanilla-extract global styles for Ink
 *
 * This file wires the token contract (tokens.ts) into actual CSS and adds
 * the layout primitives. Component-level styles live in co-located .css.ts
 * files (e.g. Editor.css.ts, Sidebar.css.ts).
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
import { globalStyle, style, keyframes } from '@vanilla-extract/css';
import { tokens } from '../tokens';

// ─── CSS Reset ────────────────────────────────────────────────────────────────

globalStyle('*, *::before, *::after', {
  boxSizing: 'border-box',
  margin: 0,
  padding: 0,
});

globalStyle('html, body, #root', {
  height: '100%',
  width: '100%',
  overflow: 'hidden',   // Prevent body scroll; editor and sidebar scroll independently
});

globalStyle('body', {
  fontFamily: tokens.font.ui,
  fontSize: tokens.fontSize.md,
  lineHeight: tokens.lineHeight.normal,
  color: tokens.color.ink,
  backgroundColor: tokens.color.bg,
  // Subpixel antialiasing for the serif fonts
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
  textRendering: 'optimizeLegibility',
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
  // Sidebar is its own stacking context for z-index management
  position: 'relative',
  zIndex: tokens.zIndex.sidebar,
});

export const editorShell = style({
  flex: 1,
  height: '100%',
  overflow: 'hidden',
  position: 'relative',
  backgroundColor: tokens.color.bg,
});

// ─── Editor crossfade transition ─────────────────────────────────────────────
// Triggered by data-transitioning attribute set in Editor.tsx on note switch

globalStyle('.editor-root', {
  height: '100%',
  width: '100%',
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
  // The name is the single largest typographic element; should anchor the sidebar
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
               background ${tokens.motion.durationFast} ${tokens.motion.easeOut}`,
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
    '&:focus': { borderColor: tokens.color.accent },
    '&::-webkit-search-cancel-button': { display: 'none' }, // Use custom clear if needed
  },
});

// ─── Sidebar: note list ───────────────────────────────────────────────────────

globalStyle('.notes-ul', {
  flex: 1,
  overflow: 'auto',
  listStyle: 'none',
  padding: `${tokens.space['2']} 0`,
});

globalStyle('.note-list-item', {
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  gap: tokens.space['1'],
  padding: `${tokens.space['3']} ${tokens.space['4']}`,
  paddingLeft: `calc(${tokens.space['4']} + 4px)`,  // Room for active left border
  cursor: 'pointer',
  borderLeft: '2px solid transparent',
  transition: `background-color ${tokens.motion.durationFast} ${tokens.motion.easeOut},
               border-color ${tokens.motion.durationFast} ${tokens.motion.easeOut}`,
  selectors: {
    '&:hover': {
      backgroundColor: tokens.color.bgHover,
    },
    '&.is-active': {
      backgroundColor: tokens.color.bgActive,
      borderLeftColor: tokens.color.accent,
    },
    // Show delete button on hover and when active
    '&:hover .note-delete-btn, &.is-active .note-delete-btn': {
      opacity: 1,
    },
  },
});

globalStyle('.note-title', {
  fontFamily: tokens.font.display,
  fontSize: tokens.fontSize.md,
  fontWeight: tokens.fontWeight.semibold,
  lineHeight: tokens.lineHeight.tight,
  color: tokens.color.ink,
  // Clamp to one line
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  display: 'block',
  paddingRight: '20px',  // Space for delete button
  userSelect: 'none',
  cursor: 'text',        // Hint that double-click = rename
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
  selectors: {
    '&.is-visible': {
      opacity: 1,
    },
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
  transition: `opacity ${tokens.motion.durationFast} ${tokens.motion.easeOut},
               color ${tokens.motion.durationFast} ${tokens.motion.easeOut}`,
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
});

globalStyle('.note-count', {
  fontFamily: tokens.font.ui,
  fontSize: tokens.fontSize.xs,
  color: tokens.color.inkFaint,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
});

// ─── Focus-visible ring (global reset) ───────────────────────────────────────

globalStyle(':focus-visible', {
  outlineColor: tokens.color.accent,
  outlineWidth: '2px',
  outlineStyle: 'solid',
  outlineOffset: '2px',
});

globalStyle(':focus:not(:focus-visible)', {
  outline: 'none',
});

// ─── Narrow viewport: sidebar becomes a sheet ────────────────────────────────
// At <768px the sidebar overlays the editor; a hamburger toggle is handled
// by JS adding/removing .sidebar-open class on the app shell.

globalStyle('@media (max-width: 768px)', {
  // These are placeholder declarations — actual narrow-viewport implementation
  // uses a data attribute toggle on the appShell element.
});
