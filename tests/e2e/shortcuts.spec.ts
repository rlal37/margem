import { fileURLToPath } from 'node:url'
import { expect, test } from '@playwright/test'

const sample = fileURLToPath(new URL('./fixtures/sample.png', import.meta.url))

test('atalhos de teclado: ferramenta, Esc, desfazer e ajuda (WP-06)', async ({
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
  const overlay = page.locator('[data-testid="selection-overlay"]')

  // Tecla M ativa a ferramenta Marcador (Apêndice A).
  await page.keyboard.press('m')
  await expect(
    page.getByRole('button', { name: 'Marcador', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true')

  // Cria o marcador; ele fica selecionado (overlay visível).
  await page.mouse.click(cx, cy)
  await expect(layer.locator('circle')).toHaveCount(1)
  await expect(overlay).toBeVisible()

  // Esc limpa a seleção; o marcador permanece.
  await page.keyboard.press('Escape')
  await expect(overlay).toHaveCount(0)
  await expect(layer.locator('circle')).toHaveCount(1)

  // Ctrl+Z desfaz a criação.
  await page.keyboard.press('Control+z')
  await expect(layer.locator('circle')).toHaveCount(0)

  // Ajuda: abre pelo botão e fecha com Esc (RF-070).
  await page.getByRole('button', { name: 'Ajuda', exact: true }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
})
