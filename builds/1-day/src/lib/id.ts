/** Generate a short unique id using crypto.randomUUID */
export function generateId(): string {
  return crypto.randomUUID().slice(0, 8);
}
