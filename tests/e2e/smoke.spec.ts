import { expect, test } from '@playwright/test'

test('app loads and shows the shell', async ({ page }) => {
  await page.goto('/margem/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Margem')
})
