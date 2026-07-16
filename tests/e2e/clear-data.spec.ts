import { fileURLToPath } from 'node:url'
import { expect, test } from '@playwright/test'

const sample = fileURLToPath(new URL('./fixtures/sample.png', import.meta.url))

// RF-055 / RNF-012: "Começar novo" apaga os dados locais de fato — depois de
// recarregar, a aplicação não oferece recuperação (nada ficou guardado).
test('apagar dados locais remove a sessão recuperável (RF-055)', async ({
  page,
}) => {
  await page.goto('/margem/')
  await page.setInputFiles('input[accept*="image"]', sample)

  const canvas = page.locator('.canvas-viewport')
  const box = await canvas.boundingBox()
  if (!box) throw new Error('canvas sem bounding box')
  await page.getByRole('button', { name: 'Marcador', exact: true }).click()
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)

  // Espera o autosave concluir para garantir que havia algo a apagar.
  await page.locator('.editor__save').filter({ hasText: 'Salvo' }).waitFor()

  // Apaga os dados locais.
  await page.getByRole('button', { name: 'Novo projeto' }).click()
  await page.getByRole('button', { name: 'Começar novo' }).click()
  await expect(
    page.getByRole('heading', { name: 'Traga uma imagem para a margem.' }),
  ).toBeVisible()

  // Recarrega: como os dados foram apagados, vai direto à tela inicial vazia —
  // sem oferta de recuperação.
  await page.reload()
  await expect(
    page.getByRole('heading', { name: 'Traga uma imagem para a margem.' }),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: /projeto salvo neste navegador/i }),
  ).toHaveCount(0)
})
