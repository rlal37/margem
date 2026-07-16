import { fileURLToPath } from 'node:url'
import { expect, test } from '@playwright/test'

const sample = fileURLToPath(new URL('./fixtures/sample.png', import.meta.url))

// Princípio "local por padrão": nenhuma imagem ou comentário sai do navegador.
// Verifica que o fluxo completo não faz nenhuma requisição para fora da origem
// da aplicação (apenas assets locais e URLs blob:/data:).
test('nenhuma requisição externa no fluxo principal (privacidade)', async ({
  page,
  baseURL,
}) => {
  const origin = new URL(baseURL ?? 'http://localhost:4173').origin
  const external: string[] = []
  page.on('request', (req) => {
    const url = req.url()
    if (/^https?:\/\//i.test(url) && !url.startsWith(origin)) {
      external.push(url)
    }
  })

  await page.goto('/margem/')
  await page.setInputFiles('input[accept*="image"]', sample)

  const canvas = page.locator('.canvas-viewport')
  const box = await canvas.boundingBox()
  if (!box) throw new Error('canvas sem bounding box')
  const cx = box.x + box.width / 2
  const cy = box.y + box.height / 2

  // Anota (marcador + comentário) e edita um comentário.
  await page.getByRole('button', { name: 'Marcador', exact: true }).click()
  await page.mouse.click(cx, cy)
  await page.getByLabel('Título do comentário 1').fill('Segredo')

  // Exporta os três formatos (gera tudo localmente).
  for (const label of [
    'Imagem anotada (PNG)',
    'Comentários (Markdown)',
    'Projeto (.margem)',
  ]) {
    await page.getByRole('button', { name: 'Exportar' }).click()
    await page.getByRole('radio', { name: label }).check()
    await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'Baixar' }).click(),
    ])
  }

  expect(external).toEqual([])
})
