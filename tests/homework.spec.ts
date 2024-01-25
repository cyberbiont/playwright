import { Locator, expect, test } from '@playwright/test';

import { beforeEach } from 'node:test';

/* Task:

create new test file

1 navigate to https://playwright.dev/   and check that the page title is 'Fast and reliable end-to-end testing for modern web apps | Playwright'

2 ensure that it has a Microsoft copyright with current year

3 ensure that is has 'Docs' menu option that leads to 'https://playwright.dev/docs/intro' page

4 -ensure that is has a search button
-check that clicking it shows an input with 'search docs' placeholder
-check that pressing 'escape' hides this input
*/

test.describe('Playwright page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('https://playwright.dev/');
	});

	test.describe('title', () => {
		test('has correct title', async ({ page }) => {
			await expect(page).toHaveTitle(
				'Fast and reliable end-to-end testing for modern web apps | Playwright'
			);
		});
	});

	test.describe('copyright', () => {
		test('has a copyright', async ({ page }) => {
			const copyright = page.getByText(/Copyright/);

			await expect(copyright).toBeVisible();
		});

		test('has a Microsoft brand', async ({ page }) => {
			const copyright = page.getByText(/Copyright/);

			await expect(copyright).toContainText(`Microsoft`);
		});

		test('has a correct year', async ({ page }) => {
			const copyright = page.getByText(/Copyright/);

			const year = new Date().getFullYear();

			await expect(copyright).toContainText(`${year}`);
		});
	});

	test.describe('menu', () => {
		test('has a link to documentation', async ({ page }) => {
			const link = page.getByRole('link', { name: 'Docs' });

			await expect(link).toBeVisible();

			await link.click();

			expect(page.url()).toBe('https://playwright.dev/docs/intro');
		});
	});

	test.describe('search', () => {
		let search: Locator;

		test.beforeEach(async ({ page }) => {
			search = page.getByLabel('Search');
		});

		test('is visible', async ({ page }) => {
			await expect(search).toBeVisible();
		});

		test('correctly shows and hides input', async ({ page }) => {
			await search.click();

			const input = page.getByPlaceholder('search docs');

			await expect(input).toBeVisible();

			// Emulate pressing the 'Escape' key
			await page.keyboard.press('Escape');

			await expect(input).not.toBeVisible();
		});
	});
});
