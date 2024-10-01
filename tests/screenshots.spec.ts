import { expect, test } from '@playwright/test';

test('matches screenshot', async ({ page }) => {
	await page.goto('https://playwright.dev');

	await expect(page).toHaveScreenshot();
});

// update snapshots: npx playwright test --update-snapshots
