import { describe, expect, it } from 'vitest'
import {
  markerAppearance,
  readableInk,
  relativeLuminance,
  symbolPolygon,
} from './appearance'
import { createMarkerWithComment } from './factories'
import type { Comment } from './types'

describe('markerAppearance', () => {
  it('sem categoria usa a aparência neutra do marcador', () => {
    const { annotation, comment } = createMarkerWithComment(
      { x: 0.5, y: 0.5 },
      { id: 'm1', order: 1 },
    )
    const appearance = markerAppearance(annotation, [comment])
    expect(appearance).toEqual({ symbol: 'circle', color: '#111111' })
  })

  it('categoria define símbolo e cor (decisão do Apêndice C)', () => {
    const { annotation, comment } = createMarkerWithComment(
      { x: 0.5, y: 0.5 },
      { id: 'm1', order: 1 },
    )
    const comments: Comment[] = [{ ...comment, category: 'problema' }]
    expect(markerAppearance(annotation, comments)).toEqual({
      symbol: 'triangle',
      color: '#B43A2C',
    })
  })
})

describe('symbolPolygon', () => {
  it('círculo não é polígono', () => {
    expect(symbolPolygon('circle', 10)).toBeNull()
  })

  it('triângulo tem 3 vértices, com o topo para cima', () => {
    const pts = symbolPolygon('triangle', 10)
    expect(pts).toHaveLength(3)
    expect(pts?.[0]).toEqual({ x: 0, y: -10 })
  })

  it('losango e quadrado têm 4 vértices', () => {
    expect(symbolPolygon('diamond', 10)).toHaveLength(4)
    expect(symbolPolygon('square', 10)).toHaveLength(4)
  })
})

describe('readableInk', () => {
  it('escolhe a tinta de maior contraste', () => {
    expect(readableInk('#111111')).toBe('#ffffff') // fundo escuro → branco
    expect(readableInk('#F08C00')).toBe('#111111') // âmbar claro → escuro
    expect(readableInk('#1F6FEB')).toBe('#ffffff') // azul → branco
    expect(readableInk('#2F9E44')).toBe('#111111') // verde → escuro
  })

  it('luminância de branco e preto', () => {
    expect(relativeLuminance('#ffffff')).toBeCloseTo(1)
    expect(relativeLuminance('#000000')).toBeCloseTo(0)
  })
})
