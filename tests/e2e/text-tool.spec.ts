import { fileURLToPath } from 'node:url'
import { expect, test } from '@playwright/test'

const sample = fileURLToPath(new URL('./fixtures/sample.png', import.meta.url))

// Regressão: com o canvas focável (WP-09), o foco padrão do clique fechava o
// campo de texto no ato. A ferramenta Texto deve abrir o campo, mantê-lo focado
// e criar a anotação ao confirmar.
test('ferramenta Texto: clicar, digitar e criar a anotação', async ({
  page,
}) => {
  await page.goto('/margem/')
  await page.setInputFiles('input[accept*="image"]', sample)

  const canvas = page.locator('.canvas-viewport')
  const box = await canvas.boundingBox()
  if (!box) throw new Error('canvas sem bounding box')

  const cx = box.x + box.width / 2
  const cy = box.y + box.height / 2

  await page.getByRole('button', { name: 'Texto', exact: true }).click()
  await page.mouse.click(cx, cy)

  const input = page.getByLabel('Texto da anotação')
  await expect(input).toBeVisible()
  await input.fill('Olá margem')
  await page.keyboard.press('Enter')

  // A anotação de texto aparece no canvas e na lista de objetos.
  const layer = page.locator('[data-testid="annotation-layer"]').first()
  await expect(layer.getByText('Olá margem')).toBeVisible()
  await expect(page.getByRole('button', { name: /^Texto,/ })).toBeVisible()

  // A seleção acompanha o texto: clicar sobre o corpo (não só a âncora)
  // seleciona — antes a caixa era um ponto minúsculo, difícil de acertar.
  const overlay = page.locator('[data-testid="selection-overlay"]')
  await page.keyboard.press('Escape')
  await expect(overlay).toHaveCount(0)
  await page.getByRole('button', { name: 'Selecionar', exact: true }).click()
  await page.mouse.click(cx + 40, cy + 8)
  await expect(overlay).toBeVisible()
})

test('barra de ferramentas é colapsável e mantém as ferramentas acessíveis', async ({
  page,
}) => {
  await page.goto('/margem/')
  await page.setInputFiles('input[accept*="image"]', sample)

  const rail = page.locator('.tool-rail')
  await expect(rail).not.toHaveClass(/tool-rail--collapsed/)

  await page
    .getByRole('button', { name: 'Recolher barra de ferramentas' })
    .click()
  await expect(rail).toHaveClass(/tool-rail--collapsed/)

  // Mesmo recolhida, as ferramentas têm nome acessível (aria-label).
  await expect(
    page.getByRole('button', { name: 'Marcador', exact: true }),
  ).toBeVisible()

  await page
    .getByRole('button', { name: 'Expandir barra de ferramentas' })
    .click()
  await expect(rail).not.toHaveClass(/tool-rail--collapsed/)
})
