/**
 * id.ts — Stable unique ID generator for notes.
 *
 * Uses crypto.randomUUID() where available (all modern browsers), falls back
 * to a time+random suffix. IDs are URL-safe and never change after creation.
 * In a future collab scenario, the ID is the CRDT document key.
 */

export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback: timestamp + 8 hex random bytes
  const ts = Date.now().toString(36);
  const rnd = Math.random().toString(36).slice(2, 10);
  return `${ts}-${rnd}`;
}
