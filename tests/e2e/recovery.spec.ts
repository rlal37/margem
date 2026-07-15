import { fileURLToPath } from 'node:url'
import { expect, test } from '@playwright/test'

const sample = fileURLToPath(new URL('./fixtures/sample.png', import.meta.url))

test('autosave e recuperação de sessão (WP-07)', async ({ page }) => {
  await page.goto('/margem/')
  await page.setInputFiles('input[type="file"]', sample)

  const canvas = page.locator('.canvas-viewport')
  const box = await canvas.boundingBox()
  if (!box) throw new Error('canvas sem bounding box')

  // Cria um marcador.
  await page.getByRole('button', { name: 'Marcador', exact: true }).click()
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)

  const layer = page.locator('[data-testid="annotation-layer"]').first()
  await expect(layer.locator('circle')).toHaveCount(1)

  // Autosave conclui (RF-053, CA-08).
  const save = page.getByRole('status')
  await expect(save).toHaveText('Salvando…')
  await expect(save).toHaveText('Salvo neste navegador')

  // Recarrega: a aplicação oferece recuperar (RF-054, seção 7.6).
  await page.reload()
  await expect(
    page.getByRole('heading', { name: /projeto salvo neste navegador/i }),
  ).toBeVisible()

  // Continuar restaura imagem e anotações.
  await page.getByRole('button', { name: 'Continuar projeto' }).click()
  await expect(canvas).toBeVisible()
  await expect(
    page.locator('[data-testid="annotation-layer"]').first().locator('circle'),
  ).toHaveCount(1)
})
