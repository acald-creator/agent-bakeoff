/**
 * id.ts — stable ID generation
 *
 * Uses crypto.randomUUID() when available (all modern browsers, Node 14.17+).
 * Falls back to a timestamp+random string — not cryptographically strong but
 * collision-resistant enough for single-user localStorage keys.
 */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback: timestamp + 9 random hex chars
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;
}
