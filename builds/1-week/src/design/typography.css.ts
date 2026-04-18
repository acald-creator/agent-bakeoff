/**
 * typography.css.ts — Shared typographic styles used across components.
 *
 * These are exported as class names, not global styles, so they're scoped
 * to components that import them. Only truly global defaults live in global.css.ts.
 */
import { style } from '@vanilla-extract/css';
import { tokens } from './tokens.css';

export const displayText = style({
  fontFamily: tokens.font.display,
  fontWeight: tokens.fontWeight.bold,
  lineHeight: tokens.lineHeight.display,
  color: tokens.color.ink,
  letterSpacing: '-0.02em',
});

export const proseText = style({
  fontFamily: tokens.font.prose,
  fontWeight: tokens.fontWeight.regular,
  lineHeight: tokens.lineHeight.relaxed,
  color: tokens.color.ink,
});

export const uiText = style({
  fontFamily: tokens.font.ui,
  fontWeight: tokens.fontWeight.regular,
  lineHeight: tokens.lineHeight.normal,
  color: tokens.color.inkSecondary,
});

export const monoText = style({
  fontFamily: tokens.font.mono,
  fontWeight: tokens.fontWeight.regular,
});

export const metaLabel = style({
  fontFamily: tokens.font.ui,
  fontSize: tokens.fontSize.xs,
  fontWeight: tokens.fontWeight.medium,
  lineHeight: tokens.lineHeight.normal,
  color: tokens.color.inkFaint,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
});
