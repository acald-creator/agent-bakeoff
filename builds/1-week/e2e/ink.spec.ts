/**
 * ink.spec.ts — Playwright end-to-end tests for the two critical user journeys.
 *
 * These test the actual running app, not mocked units.
 * Run with: pnpm test:e2e
 *
 * The two journeys pinned in the proposal:
 *   1. Create note → write → reload → content persists (localStorage roundtrip)
 *   2. Switch notes → editor resets to correct content
 */
import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:4173';  // vite preview

test.describe('Journey 1: Create → Write → Persist', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    // Clear localStorage before each test to start fresh
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('creates a new note and the sidebar shows it', async ({ page }) => {
    // Click the + button
    await page.getByRole('button', { name: 'New note' }).click();
    // A note item should appear in the sidebar
    await expect(page.getByRole('option')).toHaveCount(1);
  });

  test('typing in the editor updates the sidebar title after debounce', async ({ page }) => {
    await page.getByRole('button', { name: 'New note' }).click();
    // Type a heading — this becomes the title
    await page.locator('.cm-content').click();
    await page.keyboard.type('# My First Note\n\nSome content here');
    // Wait for the 400ms debounce + a bit more
    await page.waitForTimeout(600);
    // The sidebar should now show the extracted title
    await expect(page.getByRole('option').first()).toContainText('My First Note');
  });

  test('content persists after page reload', async ({ page }) => {
    await page.getByRole('button', { name: 'New note' }).click();
    await page.locator('.cm-content').click();
    await page.keyboard.type('# Persistent Note\n\nThis should survive a reload.');
    await page.waitForTimeout(600);  // Wait for debounce

    // Reload the page
    await page.reload();

    // The note should still be in the sidebar
    await expect(page.getByRole('option').first()).toContainText('Persistent Note');
    // Click the note to open it
    await page.getByRole('option').first().click();
    // Editor should contain the saved content
    await expect(page.locator('.cm-content')).toContainText('This should survive a reload.');
  });

  test('dirty indicator appears while typing and disappears after save', async ({ page }) => {
    await page.getByRole('button', { name: 'New note' }).click();
    await page.locator('.cm-content').click();
    await page.keyboard.type('Hello');
    // Dirty dot should be visible
    const dot = page.locator('[title="Unsaved changes"]');
    await expect(dot).toBeVisible();
    // Wait for save
    await page.waitForTimeout(600);
    await expect(dot).not.toBeVisible();
  });
});

test.describe('Journey 2: Switch notes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('switching notes loads the correct content in the editor', async ({ page }) => {
    // Create note 1
    await page.getByRole('button', { name: 'New note' }).click();
    await page.locator('.cm-content').click();
    await page.keyboard.type('# Note Alpha\n\nContent of note alpha.');
    await page.waitForTimeout(600);

    // Create note 2
    await page.getByRole('button', { name: 'New note' }).click();
    await page.locator('.cm-content').click();
    await page.keyboard.type('# Note Beta\n\nContent of note beta.');
    await page.waitForTimeout(600);

    // Switch to first note (Note Alpha)
    await page.getByRole('option', { name: /Note Alpha/ }).click();
    await expect(page.locator('.cm-content')).toContainText('Content of note alpha.');

    // Switch back to Note Beta
    await page.getByRole('option', { name: /Note Beta/ }).click();
    await expect(page.locator('.cm-content')).toContainText('Content of note beta.');
  });

  test('search filters the note list', async ({ page }) => {
    // Create two notes
    await page.getByRole('button', { name: 'New note' }).click();
    await page.locator('.cm-content').click();
    await page.keyboard.type('# Apple Recipes\n\nSome apple stuff.');
    await page.waitForTimeout(600);

    await page.getByRole('button', { name: 'New note' }).click();
    await page.locator('.cm-content').click();
    await page.keyboard.type('# Banana Bread\n\nSome banana stuff.');
    await page.waitForTimeout(600);

    // Both notes should be visible
    await expect(page.getByRole('option')).toHaveCount(2);

    // Search for "apple"
    await page.getByRole('searchbox', { name: 'Search notes' }).fill('apple');
    await page.waitForTimeout(200);  // debounce

    // Only Apple Recipes should show
    await expect(page.getByRole('option')).toHaveCount(1);
    await expect(page.getByRole('option').first()).toContainText('Apple Recipes');

    // Clear search
    await page.getByRole('searchbox', { name: 'Search notes' }).fill('');
    await page.waitForTimeout(200);
    await expect(page.getByRole('option')).toHaveCount(2);
  });

  test('deleting the active note shows the empty state', async ({ page }) => {
    await page.getByRole('button', { name: 'New note' }).click();
    await page.locator('.cm-content').click();
    await page.keyboard.type('# Delete Me');
    await page.waitForTimeout(600);

    // Hover the note item to reveal the delete button
    const noteItem = page.getByRole('option').first();
    await noteItem.hover();
    await page.getByRole('button', { name: /Delete note/ }).click();

    // Editor should show empty state
    await expect(page.getByRole('main', { name: 'No note selected' })).toBeVisible();
  });
});
