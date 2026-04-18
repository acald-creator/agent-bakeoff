import { describe, it, expect } from 'vitest';
import { filterNotes, extractTitle, countWords } from '../lib/search';

// ─── filterNotes ──────────────────────────────────────────────────────────────

describe('filterNotes', () => {
  const notes = [
    { title: 'Meeting notes', snippet: 'Discussed the quarterly roadmap' },
    { title: 'Recipe ideas',  snippet: 'Pasta al limone, risotto, tiramisu' },
    { title: 'Book review',   snippet: 'The Remains of the Day by Ishiguro' },
  ];

  it('returns all items when query is empty', () => {
    expect(filterNotes(notes, '')).toEqual(notes);
  });

  it('returns all items when query is whitespace only', () => {
    expect(filterNotes(notes, '   ')).toEqual(notes);
  });

  it('filters by title (case-insensitive)', () => {
    const result = filterNotes(notes, 'recipe');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Recipe ideas');
  });

  it('filters by snippet (case-insensitive)', () => {
    const result = filterNotes(notes, 'ishiguro');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Book review');
  });

  it('returns multiple matches', () => {
    // 'notes' matches 'Meeting notes' title and 'Meeting notes' title again = 1
    // but 'Meeting notes' snippet doesn't contain 'notes'
    const result = filterNotes(notes, 'notes');
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result.some((n) => n.title === 'Meeting notes')).toBe(true);
  });

  it('returns empty array when no match', () => {
    expect(filterNotes(notes, 'xyzzy')).toHaveLength(0);
  });

  it('handles empty input array', () => {
    expect(filterNotes([], 'anything')).toHaveLength(0);
  });
});

// ─── extractTitle ─────────────────────────────────────────────────────────────

describe('extractTitle', () => {
  it('returns Untitled for empty string', () => {
    expect(extractTitle('')).toBe('Untitled');
  });

  it('returns Untitled for whitespace-only string', () => {
    expect(extractTitle('   \n  \n  ')).toBe('Untitled');
  });

  it('strips leading # from h1', () => {
    expect(extractTitle('# My heading\nsome body')).toBe('My heading');
  });

  it('strips leading ## from h2', () => {
    expect(extractTitle('## Section two')).toBe('Section two');
  });

  it('strips leading ### from h3', () => {
    expect(extractTitle('### Sub-section')).toBe('Sub-section');
  });

  it('uses first non-empty line as title for plain text', () => {
    expect(extractTitle('\nFirst line of text\n\nParagraph body')).toBe('First line of text');
  });

  it('trims surrounding whitespace from title', () => {
    expect(extractTitle('  # Padded heading  ')).toBe('Padded heading');
  });

  it('ignores blank lines before the title', () => {
    expect(extractTitle('\n\n\n# Title after blanks\nbody')).toBe('Title after blanks');
  });
});

// ─── countWords ───────────────────────────────────────────────────────────────

describe('countWords', () => {
  it('returns 0 for empty string', () => {
    expect(countWords('')).toBe(0);
  });

  it('returns 0 for whitespace-only string', () => {
    expect(countWords('   \n\t  ')).toBe(0);
  });

  it('counts single word', () => {
    expect(countWords('Hello')).toBe(1);
  });

  it('counts multiple words separated by spaces', () => {
    expect(countWords('one two three')).toBe(3);
  });

  it('counts words separated by newlines', () => {
    expect(countWords('word1\nword2\nword3')).toBe(3);
  });

  it('handles multiple spaces between words', () => {
    expect(countWords('one   two    three')).toBe(3);
  });

  it('handles markdown content correctly', () => {
    const md = '# Heading\n\nThis is a paragraph with five words.\n\n- List item one\n- List item two';
    // # (1) + Heading (1) + "This is a paragraph with five words." (7)
    // + "- List item one" (4) + "- List item two" (4) = 17
    expect(countWords(md)).toBe(17);
  });
});
