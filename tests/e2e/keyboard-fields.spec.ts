import { fileURLToPath } from 'node:url'
import { expect, test } from '@playwright/test'

const sample = fileURLToPath(new URL('./fixtures/sample.png', import.meta.url))

// CA-14: com o foco em um campo de texto, letras usadas como atalho são
// digitadas e não trocam de ferramenta (seção 12.3).
test('atalho de uma letra não dispara dentro de campo de texto (CA-14)', async ({
  page,
}) => {
  await page.goto('/margem/')
  await page.setInputFiles('input[accept*="image"]', sample)

  const canvas = page.locator('.canvas-viewport')
  const box = await canvas.boundingBox()
  if (!box) throw new Error('canvas sem bounding box')

  // Cria um marcador para ter um campo de comentário; a ferramenta volta a
  // Selecionar (seção 9.2).
  await page.keyboard.press('m')
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)

  const title = page.getByLabel('Título do comentário 1')
  await title.click()
  await page.keyboard.type('marcar')

  // A letra "m" (atalho do Marcador) foi digitada, não trocou a ferramenta.
  await expect(title).toHaveValue('marcar')
  await expect(
    page.getByRole('button', { name: 'Selecionar', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true')
  await expect(
    page.getByRole('button', { name: 'Marcador', exact: true }),
  ).toHaveAttribute('aria-pressed', 'false')
})
