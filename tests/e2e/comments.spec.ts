import { fileURLToPath } from 'node:url'
import { expect, test } from '@playwright/test'

const sample = fileURLToPath(new URL('./fixtures/sample.png', import.meta.url))

test('marcador cria comentário, edita, reordena e sincroniza seleção (WP-05)', async ({
  page,
}) => {
  await page.goto('/margem/')
  await page.setInputFiles('input[type="file"]', sample)

  const canvas = page.locator('.canvas-viewport')
  const box = await canvas.boundingBox()
  if (!box) throw new Error('canvas sem bounding box')
  const cy = box.y + box.height / 2

  async function addMarker(x: number) {
    await page.getByRole('button', { name: 'Marcador', exact: true }).click()
    await page.mouse.click(x, cy)
  }

  // Marcador cria um comentário numerado no painel (RF-040, CA-03).
  await addMarker(box.x + box.width / 2 - 100)
  const title1 = page.getByLabel('Título do comentário 1')
  await expect(title1).toBeVisible()

  // Editar título persiste (RF-041).
  await title1.fill('Ação principal')
  await title1.blur()
  await expect(page.getByLabel('Título do comentário 1')).toHaveValue(
    'Ação principal',
  )

  // Segundo marcador → comentário 2.
  await addMarker(box.x + box.width / 2 + 100)
  await expect(page.getByLabel('Título do comentário 2')).toBeVisible()

  // Reordenar renumera: o comentário 1 vira 2, mantendo o texto (RF-043, CA-07).
  await page
    .getByRole('button', { name: 'Mover comentário 1 para baixo' })
    .click()
  await expect(page.getByLabel('Título do comentário 2')).toHaveValue(
    'Ação principal',
  )

  // Selecionar o comentário pelo número seleciona/enquadra o marcador (RF-044).
  await page.getByRole('button', { name: 'Ir para o marcador 1' }).click()
  await expect(page.locator('[data-testid="selection-overlay"]')).toBeVisible()
})
