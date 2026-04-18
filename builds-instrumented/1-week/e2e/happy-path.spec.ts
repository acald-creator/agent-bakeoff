/**
 * happy-path.spec.ts — Critical Playwright e2e test.
 *
 * Covers the primary user journey:
 *   1. Create a new note
 *   2. Type content into the editor
 *   3. Wait for autosave (400ms debounce)
 *   4. Reload the page
 *   5. Verify the note persisted with correct content
 *
 * Assumes `pnpm dev` is running on http://localhost:3000 (or `pnpm preview`
 * after `pnpm build`). The `baseURL` is configured in playwright.config.ts.
 */
import { test, expect } from '@playwright/test';

test.describe('Ink — happy path', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test for a clean slate
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('create note → type content → reload → content persists', async ({ page }) => {
    // ── 1. Create a new note ────────────────────────────────────────────────
    const newNoteBtn = page.getByRole('button', { name: /new note/i });
    await newNoteBtn.click();

    // Editor should now be visible (CodeMirror content area)
    const editor = page.locator('.cm-content');
    await expect(editor).toBeVisible();

    // ── 2. Type content ─────────────────────────────────────────────────────
    await editor.click();
    const noteText = '# My First Note\n\nThis content should survive a reload.';
    await page.keyboard.type(noteText);

    // ── 3. Wait for autosave (debounce is 400ms, wait 600ms to be sure) ─────
    // The save-status should read "Saved" after debounce fires
    await page.waitForTimeout(600);
    const saveStatus = page.locator('.save-status');
    await expect(saveStatus).toHaveText('Saved');

    // ── 4. Capture the note ID from the URL hash ─────────────────────────────
    const url    = page.url();
    const hashId = url.match(/#note-(.+)$/)?.[1];
    expect(hashId).toBeTruthy();

    // ── 5. Reload the page ──────────────────────────────────────────────────
    await page.reload();

    // ── 6. Verify the note is still in the sidebar ──────────────────────────
    // After reload the hash should restore the active note
    const noteTitle = page.locator('.note-title').first();
    await expect(noteTitle).toBeVisible();
    await expect(noteTitle).toHaveText('My First Note');

    // ── 7. Verify editor content ────────────────────────────────────────────
    const editorContent = await page.locator('.cm-content').textContent();
    expect(editorContent).toContain('This content should survive a reload.');
  });

  test('switch notes → editor resets to correct content', async ({ page }) => {
    // Create two notes with distinct content
    const newNoteBtn = page.getByRole('button', { name: /new note/i });

    // Note A
    await newNoteBtn.click();
    const editor = page.locator('.cm-content');
    await editor.click();
    await page.keyboard.type('# Note Alpha\n\nContent of note A');
    await page.waitForTimeout(600);

    // Note B
    await newNoteBtn.click();
    await editor.click();
    await page.keyboard.type('# Note Beta\n\nContent of note B');
    await page.waitForTimeout(600);

    // Switch back to Note A (should be the second item in sidebar, sorted by recency)
    const noteItems = page.locator('.note-list-item');
    // Note Beta was created last so it's first; Note Alpha is second
    await noteItems.nth(1).click();

    // Verify editor shows Note A content
    const editorContent = await page.locator('.cm-content').textContent();
    expect(editorContent).toContain('Content of note A');
  });

  test('keyboard shortcut Cmd+N creates a new note', async ({ page }) => {
    // Wait for app to load
    await expect(page.locator('.app-name')).toBeVisible();

    const initialCount = await page.locator('.note-list-item').count();

    // Press Cmd+N
    await page.keyboard.press('Meta+n');

    // A new note should appear in the sidebar
    await expect(page.locator('.note-list-item')).toHaveCount(initialCount + 1);
    // Editor should be active
    await expect(page.locator('.cm-content')).toBeVisible();
  });

  test('delete note removes it from sidebar', async ({ page }) => {
    // Create a note
    await page.getByRole('button', { name: /new note/i }).click();
    const editor = page.locator('.cm-content');
    await editor.click();
    await page.keyboard.type('# To Delete\n\nThis note will be deleted.');
    await page.waitForTimeout(600);

    // Hover over the note item to reveal delete button
    const noteItem = page.locator('.note-list-item').first();
    await noteItem.hover();

    // Click delete button
    const deleteBtn = noteItem.locator('.note-delete-btn');
    await deleteBtn.click();

    // Note should be gone from sidebar
    await expect(page.locator('.note-list-item')).toHaveCount(0);

    // Editor placeholder should show
    await expect(page.locator('.editor-placeholder')).toBeVisible();
  });
});
