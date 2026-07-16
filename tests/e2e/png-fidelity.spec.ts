import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { expect, test } from '@playwright/test'

const sample = fileURLToPath(new URL('./fixtures/sample.png', import.meta.url))

/** Lê largura/altura do cabeçalho IHDR de um PNG (bytes big-endian 16..23). */
function pngSize(path: string): { width: number; height: number } {
  const buf = readFileSync(path)
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) }
}

// RF-060: o PNG exportado tem sempre o tamanho ORIGINAL da imagem, qualquer que
// seja o zoom do viewport ("o que se vê a 100%").
test('PNG exportado mantém o tamanho original, independente do zoom (RF-060)', async ({
  page,
}) => {
  const original = pngSize(sample)

  await page.goto('/margem/')
  await page.setInputFiles('input[accept*="image"]', sample)

  const canvas = page.locator('.canvas-viewport')
  const box = await canvas.boundingBox()
  if (!box) throw new Error('canvas sem bounding box')
  await page.getByRole('button', { name: 'Marcador', exact: true }).click()
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)

  // Muda o zoom para provar que a exportação não depende do viewport.
  await page.getByRole('button', { name: 'Diminuir zoom', exact: true }).click()
  await page.getByRole('button', { name: 'Diminuir zoom', exact: true }).click()

  await page.getByRole('button', { name: 'Exportar' }).click()
  const [png] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Baixar' }).click(),
  ])
  const exported = pngSize(await png.path())

  expect(exported).toEqual(original)
})
