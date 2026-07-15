import { fileURLToPath } from 'node:url'
import { expect, test } from '@playwright/test'

const sample = fileURLToPath(new URL('./fixtures/sample.png', import.meta.url))

test('exporta PNG/Markdown e faz roundtrip do .margem (WP-08)', async ({
  page,
}) => {
  await page.goto('/margem/')
  await page.setInputFiles('input[accept*="image"]', sample)

  const canvas = page.locator('.canvas-viewport')
  const box = await canvas.boundingBox()
  if (!box) throw new Error('canvas sem bounding box')
  await page.getByRole('button', { name: 'Marcador', exact: true }).click()
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)

  // Exporta PNG (formato padrão) — RF-060/RF-065.
  await page.getByRole('button', { name: 'Exportar' }).click()
  const [png] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Baixar' }).click(),
  ])
  expect(png.suggestedFilename()).toMatch(/\.png$/)

  // Exporta Markdown — RF-062.
  await page.getByRole('button', { name: 'Exportar' }).click()
  await page.getByRole('radio', { name: 'Comentários (Markdown)' }).check()
  const [md] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Baixar' }).click(),
  ])
  expect(md.suggestedFilename()).toMatch(/\.md$/)

  // Exporta .margem e guarda o arquivo — RF-063.
  await page.getByRole('button', { name: 'Exportar' }).click()
  await page.getByRole('radio', { name: 'Projeto (.margem)' }).check()
  const [margem] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Baixar' }).click(),
  ])
  expect(margem.suggestedFilename()).toMatch(/\.margem$/)
  const margemPath = await margem.path()

  // Começa um novo projeto e reimporta o .margem — RF-007.
  await page.getByRole('button', { name: 'Novo projeto' }).click()
  await page.getByRole('button', { name: 'Começar novo' }).click()
  await expect(
    page.getByRole('heading', { name: 'Traga uma imagem para a margem.' }),
  ).toBeVisible()

  await page.setInputFiles('input[accept*="margem"]', margemPath)
  await expect(canvas).toBeVisible()
  await expect(
    page.locator('[data-testid="annotation-layer"]').first().locator('circle'),
  ).toHaveCount(1)
})
