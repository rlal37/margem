import { describe, expect, it } from 'vitest'
import {
  annotationCenter,
  annotationTypeLabel,
  describeAnnotation,
  describePosition,
} from './describe'
import { createArea, createArrow, createMarkerWithComment } from './factories'
import type { Comment } from './types'

describe('describe', () => {
  it('rotula os tipos de anotação em português', () => {
    expect(annotationTypeLabel('marker')).toBe('Marcador')
    expect(annotationTypeLabel('draw')).toBe('Desenho')
  })

  it('calcula o centro aproximado de cada geometria', () => {
    const area = createArea(
      { x: 0.2, y: 0.4, width: 0.4, height: 0.2 },
      { id: 'a' },
    )
    expect(annotationCenter(area)).toEqual({ x: 0.4, y: 0.5 })

    const arrow = createArrow({ x: 0, y: 0 }, { x: 1, y: 0.5 }, { id: 'r' })
    expect(annotationCenter(arrow)).toEqual({ x: 0.5, y: 0.25 })
  })

  it('descreve a posição em terços, sem depender de cor (A11Y-006)', () => {
    expect(describePosition({ x: 0.1, y: 0.1 })).toBe('à esquerda no topo')
    expect(describePosition({ x: 0.5, y: 0.5 })).toBe('ao centro no meio')
    expect(describePosition({ x: 0.9, y: 0.9 })).toBe('à direita na base')
  })

  it('inclui o número do marcador quando há comentário vinculado', () => {
    const { annotation, comment } = createMarkerWithComment(
      { x: 0.9, y: 0.1 },
      { id: 'm1', order: 3 },
    )
    const comments: Comment[] = [comment]
    expect(describeAnnotation(annotation, comments)).toBe(
      'Marcador 3, à direita no topo',
    )
  })

  it('omite o número para anotações livres', () => {
    const area = createArea(
      { x: 0.0, y: 0.0, width: 0.2, height: 0.2 },
      { id: 'a' },
    )
    expect(describeAnnotation(area, [])).toBe('Área, à esquerda no topo')
  })
})
