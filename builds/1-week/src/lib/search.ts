/**
 * search.ts — Pure search utilities for filtering notes.
 *
 * Design decisions:
 *   - Substring search only (no fuzzy, no regex). Substring is fast, predictable,
 *     and matches user mental model for a notes app. Fuzzy search would be
 *     surprising (a typo returns unexpected results); regex would add complexity.
 *   - Case-insensitive always. Title and snippet are normalized to lowercase
 *     before comparison. The query is also lowercased.
 *   - Search hits title first, then snippet. Title matches score higher in
 *     the priority sort, even though we display in updatedAt order. If we
 *     ever add ranked results this function is the right place.
 *   - Pure function — no side effects, no store reads. Takes data in, returns
 *     filtered data out. Easy to test with Vitest.
 */

export interface Searchable {
  title:   string;
  snippet: string;
}

/**
 * Filter a list of notes by a search query.
 * Returns the original array if query is empty/whitespace.
 * Matches on title OR snippet (case-insensitive substring).
 */
export function filterNotes<T extends Searchable>(notes: T[], query: string): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return notes;
  return notes.filter(
    (n) =>
      n.title.toLowerCase().includes(q) ||
      n.snippet.toLowerCase().includes(q),
  );
}

/**
 * Check whether a single note matches a query.
 * Useful for testing and for the `isMatch` helper in components.
 */
export function noteMatchesQuery(note: Searchable, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return note.title.toLowerCase().includes(q) || note.snippet.toLowerCase().includes(q);
}

/**
 * Extract the first non-empty line from a markdown document body,
 * stripping leading # heading markers.
 * Used to derive the note title from the editor content.
 */
export function extractTitle(body: string): string {
  const firstLine = body.split('\n').find((l) => l.trim()) ?? '';
  return firstLine.replace(/^#+\s*/, '').trim() || 'Untitled';
}
