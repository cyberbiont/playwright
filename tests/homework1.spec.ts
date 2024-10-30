import { expect, test } from "@playwright/test";

test("homework practice", async ({ page }) => {
  await page.goto("https://playwright.dev/");

  // await page.pause(); //for debug

  // 1 navigate to https://playwright.dev/ and check that the page title is 'Fast and reliable end-to-end testing for modern web apps | Playwright'
  await expect(page).toHaveTitle(
    "Fast and reliable end-to-end testing for modern web apps | Playwright"
  );

  // 2 ensure that it has a Microsoft copyright with current year
  const currentYear: number = new Date().getFullYear();
  console.log('log year', currentYear);
  const copyrightText = await page.locator(`text=Copyright © ${currentYear}`);

  // Assert that the copyright text is visible
  await expect(copyrightText).toBeVisible();

  // 3 ensure that is has 'Docs' menu option that leads to 'https://playwright.dev/docs/intro' page

  const docsLink = await page.getByRole('link', { name: 'Docs' });
  await docsLink.click();
  // Validate that the URL is correct
  await expect(page).toHaveURL('https://playwright.dev/docs/intro');

  // 4.1 - ensure that is has a search button
  const searchButton = await page.getByLabel('Search')
  await expect(searchButton).toBeVisible();

  // 4.2 - check that clicking it shows an input with 'search docs' placeholder
  await searchButton.click();
  const searchInput = await page.getByPlaceholder('Search docs');
  await expect(searchInput).toBeVisible();

  // 4.3 - check that pressing 'escape' hides this input
  await searchInput.press('Escape');
  await expect(searchInput).not.toBeVisible();
});
