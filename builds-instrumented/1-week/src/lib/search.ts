/**
 * search.ts — Pure filter/search functions for the notes index.
 *
 * Kept as pure functions (no side effects, no store access) so they are
 * trivially unit-testable and reusable.
 */

export interface Searchable {
  title:   string;
  snippet: string;
}

/**
 * Filter a list of items by a query string.
 * Matches against title and snippet, case-insensitive.
 * Returns all items when query is empty or whitespace-only.
 */
export function filterNotes<T extends Searchable>(items: T[], query: string): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter(
    (item) =>
      item.title.toLowerCase().includes(q) ||
      item.snippet.toLowerCase().includes(q),
  );
}

/**
 * Extract a display title from the first non-empty line of a markdown document.
 * Strips leading # heading markers.
 * Returns 'Untitled' if the document is empty or all whitespace.
 */
export function extractTitle(body: string): string {
  const firstLine = body.split('\n').find((l) => l.trim()) ?? '';
  return firstLine.replace(/^#+\s*/, '').trim() || 'Untitled';
}

/**
 * Count words in a text string.
 * Splits on whitespace sequences; ignores leading/trailing whitespace.
 */
export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}
