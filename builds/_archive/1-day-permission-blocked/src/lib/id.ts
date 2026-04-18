/** Generate a random, URL-safe id (~10 chars, collision-resistant for typical note counts) */
export function generateId(): string {
  return Math.random().toString(36).slice(2, 12);
}
