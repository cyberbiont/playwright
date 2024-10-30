import { Locator, Page, expect, test } from '@playwright/test';

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

test.describe('Playwright page', () => {
	let pwPage: PwPage;

	test.beforeEach(async ({ page }) => {
		pwPage = new PwPage(page);
		await pwPage.goto();
	});

	test.describe('title', () => {
		test('has correct title', async ({ page }) => {
			await expect(pwPage.page).toHaveTitle(
				'Fast and reliable end-to-end testing for modern web apps | Playwright'
			);
		});

		test('has dark mode button', async ({ page }) => {
			expect(pwPage.modeButton).toBeDefined();
			await expect(pwPage.modeButton).toBeEnabled();
			await expect(pwPage.modeButton).toBeVisible();

			// use IDE hints about function return type: if matcher function returns a promise, you shiuld use await
		});
	});

	test.describe('copyright', () => {
		test('has a copyright', async ({ page }) => {
			await expect(pwPage.copyright, 'is visible').toBeVisible();
		});

		test('has a Microsoft brand', async ({ page }) => {
			await expect(pwPage.copyright).toContainText(`Microsoft`);
		});

		test('has a correct year', async ({ page }) => {
			await expect(pwPage.copyright).toContainText(`${pwPage.year}`);
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
		test('is visible', async ({ page }) => {
			await expect(pwPage.search).toBeVisible();
		});

		test('correctly shows and hides input', async ({ page }) => {
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
