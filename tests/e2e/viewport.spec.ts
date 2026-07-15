import { fileURLToPath } from 'node:url'
import { expect, test } from '@playwright/test'

const sample = fileURLToPath(new URL('./fixtures/sample.png', import.meta.url))

test('carrega imagem-base e permite ampliar', async ({ page }) => {
  await page.goto('/margem/')

  // RF-001: escolher arquivo pela tela inicial.
  await page.setInputFiles('input[type="file"]', sample)

  // Entra no editor com a imagem renderizada em SVG.
  const canvas = page.getByRole('img', { name: /Imagem sample\.png/ })
  await expect(canvas).toBeVisible()
  const imageEl = canvas.locator('image')
  await expect(imageEl).toHaveAttribute('href', /^blob:/)

  // RF-011/RF-013: ampliar altera a transformação do grupo (o primeiro <g>
  // é o grupo do viewport; o segundo é a camada de anotações).
  const group = canvas.locator('g').first()
  const before = await group.getAttribute('transform')
  await page.getByRole('button', { name: 'Aumentar zoom' }).click()
  await expect(group).not.toHaveAttribute('transform', before ?? '')
})
