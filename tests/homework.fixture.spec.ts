import { Locator, Page, expect } from '@playwright/test';

import { test as base } from '@playwright/test';

export class PwPage {
	readonly modeButton: Locator;
	readonly copyright: Locator;
	readonly search: Locator;

	year = new Date().getFullYear();

	constructor(public readonly page: Page) {
		this.modeButton = this.page.getByLabel('Switch between dark and light');
		this.copyright = this.page.getByText(/Copyright/);
		this.search = this.page.getByLabel('Search');
	}

	async goto() {
		await this.page.goto('https://playwright.dev');
	}

	async openSearch() {
		await this.search.click();
	}
}

type MyFixtures = {
	pwPage: PwPage;
};

const test = base.extend<MyFixtures>({
	pwPage: async ({ page }, use) => {
		// Set up the fixture.
		const pwPage = new PwPage(page);
		await pwPage.goto();

		await use(pwPage);
	},
});

test.describe('Playwright page', () => {
	test.describe('title', () => {
		test('has correct title', async ({ pwPage, page }) => {
			await expect(pwPage.page).toHaveTitle(
				'Fast and reliable end-to-end testing for modern web apps | Playwright'
			);
		});

		test('has dark mode button', async ({ pwPage, page }) => {
			expect(pwPage.modeButton).toBeDefined();
			await expect(pwPage.modeButton).toBeEnabled();
			await expect(pwPage.modeButton).toBeVisible();

			// use IDE hints about function return type: if matcher function returns a promise, you shiuld use await
		});
	});

	test.describe('copyright', () => {
		test('has a copyright', async ({ pwPage, page }) => {
			await expect(pwPage.copyright, 'is visible').toBeVisible();
		});

		test('has a Microsoft brand', async ({ pwPage, page }) => {
			await expect(pwPage.copyright).toContainText(`Microsoft`);
		});

		test('has a correct year', async ({ pwPage, page }) => {
			await expect(pwPage.copyright).toContainText(`${pwPage.year}`);
		});
	});

	test.describe('menu', () => {
		test('has a link to documentation', async ({ pwPage, page }) => {
			const link = page.getByRole('link', { name: 'Docs' });

			await expect(link).toBeVisible();

			await link.click();

			await expect(page).toHaveURL('https://playwright.dev/docs/intro');
			// expect(page.url()).toBe('https://playwright.dev/docs/intro'); // also possible
		});
	});

	test.describe('search', () => {
		test('is visible', async ({ pwPage, page }) => {
			await expect(pwPage.search).toBeVisible();
		});

		test('correctly shows and hides input', async ({ pwPage, page }) => {
			await pwPage.openSearch();

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
