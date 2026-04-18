/**
 * id.ts — stable, URL-safe note ID generation
 *
 * Uses crypto.randomUUID() when available (all modern browsers + Node 20+),
 * with a fallback that doesn't require any polyfill package.
 */

export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback: timestamp + random hex
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}
