import { expect, test } from '@playwright/test'

test('app loads and shows the empty state', async ({ page }) => {
  await page.goto('/margem/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Traga uma imagem para a margem.',
  )
  await expect(page.getByText('Escolher imagem')).toBeVisible()
})
