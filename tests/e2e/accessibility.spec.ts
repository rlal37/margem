import { fileURLToPath } from 'node:url'
import { expect, test } from '@playwright/test'

const sample = fileURLToPath(new URL('./fixtures/sample.png', import.meta.url))

test('teclado: lista de objetos seleciona e setas movem (WP-09)', async ({
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
  const circle = layer.locator('circle')

  // Cria um marcador; ele aparece na lista de objetos (seção 12.2).
  await page.keyboard.press('m')
  await page.mouse.click(cx, cy)
  await expect(circle).toHaveCount(1)

  const objectItem = page.getByRole('button', { name: /^Marcador 1,/ })
  await expect(objectItem).toBeVisible()

  // Limpar seleção e reselecionar pela lista sincroniza o contorno no canvas.
  await page.keyboard.press('Escape')
  await expect(overlay).toHaveCount(0)
  await objectItem.click()
  await expect(overlay).toBeVisible()

  // Com foco no canvas e objeto selecionado, a seta move o marcador (RF/12.2).
  const before = Number(await circle.getAttribute('cx'))
  await canvas.focus()
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('ArrowRight')
  const after = Number(await circle.getAttribute('cx'))
  expect(after).toBeGreaterThan(before)

  // O movimento é reversível (cada passo é um comando de histórico).
  await page.getByRole('button', { name: 'Desfazer' }).click()
  const undone = Number(await circle.getAttribute('cx'))
  expect(undone).toBeLessThan(after)
})
