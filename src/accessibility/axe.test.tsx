/**
 * Verificação automatizada de acessibilidade (WP-09) com axe-core sobre
 * componentes-chave. Cobre nomes acessíveis, papéis e relações ARIA. Regras
 * que dependem de layout real (contraste de cor) não rodam sob jsdom e ficam
 * desativadas aqui — o contraste é conferido no acabamento visual (WP-10).
 */

import { render } from '@testing-library/react'
import axe from 'axe-core'
import { describe, expect, it } from 'vitest'
import { createArea, createMarkerWithComment } from '../domain/factories'
import type { Annotation, Comment } from '../domain/types'
import { ObjectList } from '../editor/canvas/ObjectList'
import { ConfirmDialog } from '../ui/ConfirmDialog'

async function noViolations(container: HTMLElement) {
  const results = await axe.run(container, {
    rules: { 'color-contrast': { enabled: false } },
  })
  const summary = results.violations.map((v) => `${v.id}: ${v.help}`)
  expect(summary).toEqual([])
}

describe('acessibilidade (axe)', () => {
  it('ObjectList não tem violações', async () => {
    const { annotation, comment } = createMarkerWithComment(
      { x: 0.2, y: 0.2 },
      { id: 'm1', order: 1, zIndex: 1 },
    )
    const area = createArea(
      { x: 0.5, y: 0.5, width: 0.1, height: 0.1 },
      { id: 'a1', zIndex: 2 },
    )
    const annotations: Annotation[] = [annotation, area]
    const comments: Comment[] = [comment]

    const { container } = render(
      <ObjectList
        annotations={annotations}
        comments={comments}
        selectedId="a1"
        onSelect={() => {}}
      />,
    )
    await noViolations(container)
  })

  it('ConfirmDialog aberto não tem violações', async () => {
    const { container } = render(
      <ConfirmDialog
        open
        title="Começar de novo?"
        message="Isto apaga o projeto salvo."
        confirmLabel="Começar novo"
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    )
    await noViolations(container)
  })
})
