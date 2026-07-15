import { fileURLToPath } from 'node:url'
import { expect, test } from '@playwright/test'

const sample = fileURLToPath(new URL('./fixtures/sample.png', import.meta.url))

test('cria marcador e área, e desfaz (WP-04)', async ({ page }) => {
  await page.goto('/margem/')
  await page.setInputFiles('input[type="file"]', sample)

  const canvas = page.locator('.canvas-viewport')
  await expect(canvas).toBeVisible()
  const box = await canvas.boundingBox()
  if (!box) throw new Error('canvas sem bounding box')
  const cx = box.x + box.width / 2
  const cy = box.y + box.height / 2

  const layer = page.locator('[data-testid="annotation-layer"]').first()

  // Marcador: clicar cria o objeto e um comentário numerado (RF-040, CA-03).
  await page.getByRole('button', { name: 'Marcador' }).click()
  await page.mouse.click(cx, cy)
  await expect(layer.locator('circle')).toHaveCount(1)
  await expect(layer.getByText('1')).toBeVisible()

  // Após criar, a ferramenta volta para Selecionar (seção 9.2).
  await expect(
    page.getByRole('button', { name: 'Selecionar' }),
  ).toHaveAttribute('aria-pressed', 'true')

  // Área: arrastar cria um retângulo (RF-022).
  await page.getByRole('button', { name: 'Área' }).click()
  await page.mouse.move(cx - 120, cy - 90)
  await page.mouse.down()
  await page.mouse.move(cx + 120, cy + 90, { steps: 5 })
  await page.mouse.up()
  await expect(layer.locator('rect')).toHaveCount(1)

  // Desfazer remove a área (RF-050).
  await page.getByRole('button', { name: 'Desfazer' }).click()
  await expect(layer.locator('rect')).toHaveCount(0)
  await expect(layer.locator('circle')).toHaveCount(1)
})
