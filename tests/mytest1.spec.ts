import test, { expect } from "@playwright/test";

test('has title',async ({ page }) => {
    await page.goto('https://playwright.dev/');
    await expect(page).toHaveTitle(/'Fast and reliable end-to-end testing for modern web apps | Playwright/);  
});
test('has copyright 2024', async({page}) => {
  await page.goto('https://playwright.dev/');
  await expect (page.getByText('Copyright © 2024 Microsoft')).toContainText('Copyright © 2024 Microsoft');
});    
test('Docs menu has correct link', async({page}) => {
  await page.goto('https://playwright.dev/');
  await page.getByRole('link', { name: 'Docs' }).click();
  await expect (page.url()).toBe('https://playwright.dev/docs/intro');
});
test('Search button scenarios', async({page}) => {
  await page.goto('https://playwright.dev/');
  await expect(page.getByLabel('Search')).toBeDefined;
  await page.getByLabel('Search').click();
  await page.getByPlaceholder('Search docs').click();
  await page.getByLabel('Search').first().click();
  await expect (page.getByPlaceholder('Search docs')).toBeUndefined;
  
});






