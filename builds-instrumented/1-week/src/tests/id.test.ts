import { describe, it, expect } from 'vitest';
import { generateId } from '../lib/id';

describe('generateId', () => {
  it('returns a non-empty string', () => {
    expect(generateId()).toBeTruthy();
    expect(typeof generateId()).toBe('string');
  });

  it('returns unique values on each call', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });

  it('uses crypto.randomUUID when available (UUID format)', () => {
    // crypto.randomUUID is available in Node 20+
    const id = generateId();
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    expect(id).toMatch(uuidPattern);
  });

  it('falls back gracefully when crypto.randomUUID is absent', () => {
    const orig = crypto.randomUUID;
    // @ts-ignore
    delete crypto.randomUUID;
    try {
      const id = generateId();
      expect(id).toBeTruthy();
      expect(typeof id).toBe('string');
    } finally {
      crypto.randomUUID = orig;
    }
  });
});
