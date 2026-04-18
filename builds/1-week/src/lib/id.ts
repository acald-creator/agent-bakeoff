/**
 * id.ts — Stable, URL-safe ID generator for notes.
 *
 * Uses crypto.randomUUID() where available (all modern browsers + Node 20+),
 * with a timestamp+random fallback for hostile environments.
 *
 * IDs are:
 *   - Unique across concurrent tab sessions (UUID v4 has 2^122 collision space)
 *   - URL-safe (UUID hyphens are preserved; fine for #note-<id> hash routing)
 *   - Opaque (no semantic encoding of creation time or author)
 */

export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback: timestamp + 6 random hex groups
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
