import { fileURLToPath } from 'node:url'
import { expect, test } from '@playwright/test'

const sample = fileURLToPath(new URL('./fixtures/sample.png', import.meta.url))

test('painel de propriedades: selecionar objeto livre e editar (WP-10)', async ({
  page,
}) => {
  await page.goto('/margem/')
  await page.setInputFiles('input[accept*="image"]', sample)

  const canvas = page.locator('.canvas-viewport')
  const box = await canvas.boundingBox()
  if (!box) throw new Error('canvas sem bounding box')
  const cx = box.x + box.width / 2
  const cy = box.y + box.height / 2

  const layer = page.locator('[data-testid="annotation-layer"]').first()
  const rect = layer.locator('rect')

  // Cria uma área por arraste; ela fica selecionada e o painel troca para
  // propriedades (seção 6.2).
  await page.getByRole('button', { name: 'Área', exact: true }).click()
  await page.mouse.move(cx - 100, cy - 70)
  await page.mouse.down()
  await page.mouse.move(cx + 100, cy + 70, { steps: 5 })
  await page.mouse.up()
  await expect(rect).toHaveCount(1)
  await expect(
    page.getByRole('region', { name: 'Propriedades do objeto' }),
  ).toBeVisible()

  // Trocar a cor pela paleta reflete no traço da área (RF-028).
  await page.getByRole('button', { name: 'Cor #1F6FEB' }).click()
  await expect(rect).toHaveAttribute('stroke', '#1F6FEB')

  // A edição é reversível.
  await page.getByRole('button', { name: 'Desfazer' }).click()
  await expect(rect).toHaveAttribute('stroke', '#B43A2C')
})
