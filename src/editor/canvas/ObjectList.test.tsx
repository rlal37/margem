import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import {
  createArea,
  createArrow,
  createMarkerWithComment,
} from '../../domain/factories'
import type { Annotation, Comment } from '../../domain/types'
import { ObjectList } from './ObjectList'

const { annotation: marker, comment } = createMarkerWithComment(
  { x: 0.1, y: 0.1 },
  { id: 'm1', order: 1, zIndex: 1 },
)
const area = createArea(
  { x: 0.5, y: 0.5, width: 0.2, height: 0.2 },
  { id: 'a1', zIndex: 2 },
)
const arrow = createArrow(
  { x: 0.8, y: 0.8 },
  { x: 0.9, y: 0.9 },
  {
    id: 'r1',
    zIndex: 3,
  },
)

const annotations: Annotation[] = [area, marker, arrow]
const comments: Comment[] = [comment]

describe('ObjectList', () => {
  it('lista objetos com tipo, número e posição (seção 12.2)', () => {
    render(
      <ObjectList
        annotations={annotations}
        comments={comments}
        selectedId={null}
        onSelect={() => {}}
      />,
    )
    expect(screen.getByText('Marcador 1, à esquerda no topo')).toBeVisible()
    expect(screen.getByText('Área, ao centro no meio')).toBeVisible()
    expect(screen.getByText('Seta, à direita na base')).toBeVisible()
  })

  it('seleciona um objeto pelo clique (sincroniza com o canvas)', () => {
    const onSelect = vi.fn()
    render(
      <ObjectList
        annotations={annotations}
        comments={comments}
        selectedId={null}
        onSelect={onSelect}
      />,
    )
    fireEvent.click(screen.getByText('Área, ao centro no meio'))
    expect(onSelect).toHaveBeenCalledWith('a1')
  })

  it('marca o objeto selecionado com aria-pressed', () => {
    render(
      <ObjectList
        annotations={annotations}
        comments={comments}
        selectedId="a1"
        onSelect={() => {}}
      />,
    )
    const item = screen.getByRole('button', { name: 'Área, ao centro no meio' })
    expect(item).toHaveAttribute('aria-pressed', 'true')
  })

  it('mostra estado vazio sem objetos', () => {
    render(
      <ObjectList
        annotations={[]}
        comments={[]}
        selectedId={null}
        onSelect={() => {}}
      />,
    )
    expect(screen.getByText(/Nenhum objeto ainda/)).toBeVisible()
  })
})
