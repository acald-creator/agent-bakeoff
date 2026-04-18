/** Generate a short collision-resistant ID. Uses crypto.randomUUID when available. */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, '').slice(0, 16);
  }
  // Fallback for environments without crypto.randomUUID
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}
