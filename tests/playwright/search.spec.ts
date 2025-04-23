import { test, expect } from '@playwright/test';

test.describe('Search Engine Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  // Metamorphic Testing
  test('metamorphic: case-insensitive search yields same results', async ({ page }) => {
    const caseSensitiveCheckbox = page.getByTestId('case-sensitive-checkbox');
    await expect(caseSensitiveCheckbox).not.toBeChecked();
    await page.getByTestId('search-input').fill('apple');
    await page.getByTestId('search-button').click();
    await page.waitForSelector('[data-testid="results-list"]');
    const results1 = await page.getByTestId('results-list').locator('li').count();
    await page.getByTestId('search-input').fill('Apple');
    await page.getByTestId('search-button').click();
    await page.waitForSelector('[data-testid="results-list"]');
    const results2 = await page.getByTestId('results-list').locator('li').count();
    expect(results1).toBe(results2);
  });

  test('metamorphic: case-sensitive search yields different results', async ({ page }) => {
    await page.getByTestId('case-sensitive-checkbox').check();
    // Search for lowercase 'tiramisu'
    await page.getByTestId('search-input').fill('tiramisu');
    await page.getByTestId('search-button').click();
    await expect(page.getByTestId('no-results')).toHaveText('No results found for "tiramisu"');
    
    // Search for proper case 'Tiramisu'
    await page.getByTestId('search-input').fill('Tiramisu');
    await page.getByTestId('search-button').click();
    await page.waitForSelector('[data-testid="results-list"]');
    const results = await page.getByTestId('results-list').locator('li');
    await expect(results).toHaveCount(1);
    const firstResult = await results.first().textContent();
    expect(firstResult).toContain('Tiramisu Classic');
  });

  test('metamorphic: query with extra spaces', async ({ page }) => {
    await page.getByTestId('search-input').fill(' apple ');
    await page.getByTestId('search-button').click();
    await page.waitForSelector('[data-testid="results-list"]');
    const results1 = await page.getByTestId('results-list').locator('li').count();
    await page.getByTestId('search-input').fill('apple');
    await page.getByTestId('search-button').click();
    await page.waitForSelector('[data-testid="results-list"]');
    const results2 = await page.getByTestId('results-list').locator('li').count();
    expect(results1).toBe(results2);
  });

  // Boundary Value Testing
  test('boundary: empty query', async ({ page }) => {
    await page.getByTestId('search-button').click();
    await expect(page.getByTestId('error-message')).toHaveText('Please enter a search query.');
  });

  test('boundary: single character query', async ({ page }) => {
    await page.getByTestId('search-input').fill('a');
    await page.getByTestId('search-button').click();
    await page.waitForSelector('[data-testid="results-list"]');
    const results = await page.getByTestId('results-list').locator('li').count();
    expect(results).toBeGreaterThan(0);
  });

  test('boundary: 255 character query', async ({ page }) => {
    const longQuery = 'a'.repeat(255);
    await page.getByTestId('search-input').fill(longQuery);
    await page.getByTestId('search-button').click();
    await expect(page.getByTestId('error-message')).not.toBeVisible();
  });

  test('boundary: 256 character query', async ({ page }) => {
    const longQuery = 'a'.repeat(256);
    await page.getByTestId('search-input').fill(longQuery);
    await page.getByTestId('search-button').click();
    await expect(page.getByTestId('error-message')).toHaveText('Query is too long. Maximum 255 characters allowed.');
  });

  // Path and Coverage Testing
  test('path: valid query with results', async ({ page }) => {
    await page.getByTestId('search-input').fill('apple');
    await page.getByTestId('search-button').click();
    await page.waitForSelector('[data-testid="results-list"]');
    const results = await page.getByTestId('results-list').locator('li').count();
    expect(results).toBe(3); // Apple Pie, Apple Smoothie, Apple Crumble
  });

  test('path: no results', async ({ page }) => {
    await page.getByTestId('search-input').fill('xyz');
    await page.getByTestId('search-button').click();
    await expect(page.getByTestId('no-results')).toHaveText('No results found for "xyz"');
  });

  test('path: search via Enter key', async ({ page }) => {
    await page.getByTestId('search-input').fill('apple');
    await page.getByTestId('search-input').press('Enter');
    await page.waitForSelector('[data-testid="results-list"]');
    const results = await page.getByTestId('results-list').locator('li').count();
    expect(results).toBeGreaterThan(0);
  });

  test('path: error recovery', async ({ page }) => {
    // No results should show initially
    await expect(page.getByTestId('no-results')).not.toBeVisible();
    await page.getByTestId('search-button').click();
    await expect(page.getByTestId('error-message')).toHaveText('Please enter a search query.');
    await page.getByTestId('search-input').fill('apple');
    // Results shouldn't show until search is triggered
    await expect(page.getByTestId('no-results')).not.toBeVisible();
    await page.getByTestId('search-button').click();
    await expect(page.getByTestId('error-message')).not.toBeVisible();
    await page.waitForSelector('[data-testid="results-list"]');
  });

  // MC/DC Testing
  test('mcdc: case-sensitive with matching query', async ({ page }) => {
    await page.getByTestId('case-sensitive-checkbox').check();
    await page.getByTestId('search-input').fill('Apple');
    await page.getByTestId('search-button').click();
    await page.waitForSelector('[data-testid="results-list"]');
    const results = await page.getByTestId('results-list').locator('li').count();
    expect(results).toBeGreaterThan(0);
  });

  test('mcdc: case-sensitive with non-matching query', async ({ page }) => {
    await page.getByTestId('case-sensitive-checkbox').check();
    await page.getByTestId('search-input').fill('tiramisu');
    await page.getByTestId('search-button').click();
    await expect(page.getByTestId('no-results')).toHaveText('No results found for "tiramisu"');
  });

  // Decision Table-Based Testing
  test('decision table: special characters', async ({ page }) => {
    await page.getByTestId('search-input').fill('!');
    await page.getByTestId('search-button').click();
    await expect(page.getByTestId('no-results')).toHaveText('No results found for "!"');
  });

  test('decision table: numbers', async ({ page }) => {
    await page.getByTestId('search-input').fill('123');
    await page.getByTestId('search-button').click();
    await expect(page.getByTestId('no-results')).toHaveText('No results found for "123"');
  });

  test('decision table: mixed case query', async ({ page }) => {
    await page.getByTestId('search-input').fill('ApPlE');
    await page.getByTestId('search-button').click();
    await page.waitForSelector('[data-testid="results-list"]');
    const results = await page.getByTestId('results-list').locator('li').count();
    expect(results).toBeGreaterThan(0);
  });

  test('decision table: multiple words', async ({ page }) => {
    await page.getByTestId('search-input').fill('apple pie');
    await page.getByTestId('search-button').click();
    await page.waitForSelector('[data-testid="results-list"]');
    const results = await page.getByTestId('results-list').locator('li');
    await expect(results).toHaveCount(1);
    const firstResult = await results.first().textContent();
    expect(firstResult).toContain('Apple Pie Recipe');
  });

  test('decision table: reversed words', async ({ page }) => {
    await page.getByTestId('search-input').fill('pie apple');
    await page.getByTestId('search-button').click();
    await expect(page.getByTestId('no-results')).toHaveText('No results found for "pie apple"');
  });

  test('decision table: common word', async ({ page }) => {
    await page.getByTestId('search-input').fill('pie');
    await page.getByTestId('search-button').click();
    await page.waitForSelector('[data-testid="results-list"]');
    const results = await page.getByTestId('results-list').locator('li');
    await expect(results).toHaveCount(2); // Apple Pie, Lemon Pie
    // Verify the results contain the expected items
    const resultTexts = await results.allTextContents();
    expect(resultTexts.some(text => text.includes('Apple Pie'))).toBe(true);
    expect(resultTexts.some(text => text.includes('Lemon Pie'))).toBe(true);
  });

  test('pagination: single page', async ({ page }) => {
    await page.getByTestId('search-input').fill('apple');
    await page.getByTestId('search-button').click();
    await page.waitForSelector('[data-testid="results-list"]');
    
    // Verify we have results but no pagination
    const listItems = await page.getByTestId('results-list').locator('li');
    await expect(listItems).toHaveCount(3);
    
    // Verify pagination elements are not visible
    await expect(page.getByTestId('page-info')).not.toBeVisible();
    await expect(page.getByTestId('prev-page')).not.toBeVisible();
    await expect(page.getByTestId('next-page')).not.toBeVisible();
  });

  test('pagination: button states', async ({ page }) => {
    await page.getByTestId('search-input').fill('e');
    await page.getByTestId('search-button').click();
    await page.waitForSelector('[data-testid="results-list"]');
    
    // On first page
    await expect(page.getByTestId('prev-page')).toBeDisabled();
    await expect(page.getByTestId('next-page')).toBeEnabled();
    await expect(page.getByTestId('page-info')).toHaveText('Page 1 of 3');

    // On second page
    await page.getByTestId('next-page').click();
    await expect(page.getByTestId('prev-page')).toBeEnabled();
    await expect(page.getByTestId('next-page')).toBeEnabled();
    await expect(page.getByTestId('page-info')).toHaveText('Page 2 of 3');

    // On last page
    await page.getByTestId('next-page').click();
    await expect(page.getByTestId('prev-page')).toBeEnabled();
    await expect(page.getByTestId('next-page')).toBeDisabled();
    await expect(page.getByTestId('page-info')).toHaveText('Page 3 of 3');
  });

  test('input retains query', async ({ page }) => {
    await page.getByTestId('search-input').fill('apple');
    await page.getByTestId('search-button').click();
    await expect(page.getByTestId('search-input')).toHaveValue('apple');
  });

  test('new search resets pagination', async ({ page }) => {
    // Search for 'e' which should return enough results for pagination
    await page.getByTestId('search-input').fill('e');
    await page.getByTestId('search-button').click();
    await page.waitForSelector('[data-testid="results-list"]');
    // Wait for pagination info to be visible
    await page.waitForSelector('[data-testid="page-info"]');
    await page.getByTestId('next-page').click();
    await expect(page.getByTestId('page-info')).toHaveText('Page 2 of 3');
    // Now search for something with fewer results
    await page.getByTestId('search-input').fill('apple');
    await page.getByTestId('search-button').click();
    await page.waitForSelector('[data-testid="results-list"]');
    // Check if results are shown and pagination is reset
    const results = await page.getByTestId('results-list').locator('li').count();
    expect(results).toBeLessThanOrEqual(5); // Should be on first page
    expect(results).toBeGreaterThan(0);
  });

  // Add new test for typing behavior
  test('typing does not show results', async ({ page }) => {
    await page.getByTestId('search-input').fill('apple');
    // Verify no results or "no results" message is shown while typing
    await expect(page.getByTestId('results-list')).not.toBeVisible();
    await expect(page.getByTestId('no-results')).not.toBeVisible();
    // Results should only show after clicking search
    await page.getByTestId('search-button').click();
    await page.waitForSelector('[data-testid="results-list"]');
    const results = await page.getByTestId('results-list').locator('li').count();
    expect(results).toBeGreaterThan(0);
  });
}); 