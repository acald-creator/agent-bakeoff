/**
 * App.css.ts — layout shell styles (vanilla-extract)
 *
 * Exported class names used by App.tsx.
 * Global component styles live in global.css.ts.
 */
import { style } from '@vanilla-extract/css';
import { tokens } from '../design/tokens';

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
  zIndex: Number(tokens.zIndex.sidebar),
});

export const editorShell = style({
  flex: 1,
  height: '100%',
  overflow: 'hidden',
  position: 'relative',
  backgroundColor: tokens.color.bg,
});
