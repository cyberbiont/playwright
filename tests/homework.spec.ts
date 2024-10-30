import { Locator, expect, test } from '@playwright/test';

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

		test('has dark mode button', async ({ page }) => {
			const button = page.getByLabel('Switch between dark and light');
			expect(button).toBeDefined();

			await expect(button).toBeEnabled();
			await expect(button).toBeVisible();

			// use IDE hints about function return type: if matcher function returns a promise, you shiuld use await
		});
	});

	

	test.describe('copyright', () => {
		test('has a copyright', async ({ page }) => {
			const copyright = page.getByText(/Copyright/);

			await expect(copyright, 'is visible').toBeVisible();
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

			await expect(page).toHaveURL('https://playwright.dev/docs/intro');
			// expect(page.url()).toBe('https://playwright.dev/docs/intro'); // also possible
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
			await input.press('Escape'); // emulates pressing Escape on input (i.e. while input has focus), is more precise

			// await input.focus();
			// await page.keyboard.press('Escape'); // emuates pressing Escape on the whole page

			await expect(input).not.toBeVisible();
		});
	});
});
