/**
 * id.ts — stable unique ID generation for notes
 *
 * Uses crypto.randomUUID() when available (all modern browsers),
 * falls back to a timestamp + random suffix.
 */

export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback: timestamp + 6 random chars
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
