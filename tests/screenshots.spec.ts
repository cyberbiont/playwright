import { expect, test } from '@playwright/test';

test('matches screenshot', async ({ page }) => {
	await page.goto('https://playwright.dev');

	await expect(page).toHaveScreenshot({
		clip: { x: 0, y: 0, width: 500, height: 500 },
	});
});

// update snapshots: npx playwright test --update-snapshots
