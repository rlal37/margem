import { describe, expect, it } from 'vitest'
import {
  markerNumber,
  renumberComments,
  reorderComments,
  sortedComments,
} from './numbering'
import type { Comment, MarkerAnnotation } from './types'

function comment(id: string, order: number, title = ''): Comment {
  return { id, order, title, body: '' }
}

describe('sortedComments', () => {
  it('ordena por order sem mutar a lista original', () => {
    const input = [comment('c', 3), comment('a', 1), comment('b', 2)]
    const output = sortedComments(input)
    expect(output.map((c) => c.id)).toEqual(['a', 'b', 'c'])
    expect(input.map((c) => c.id)).toEqual(['c', 'a', 'b'])
  })
})

describe('renumberComments', () => {
  it('torna a ordem contígua 1..n', () => {
    const result = renumberComments([
      comment('a', 5),
      comment('b', 12),
      comment('c', 40),
    ])
    expect(result.map((c) => [c.id, c.order])).toEqual([
      ['a', 1],
      ['b', 2],
      ['c', 3],
    ])
  })
})

describe('reorderComments', () => {
  it('aplica nova ordem e renumera preservando textos', () => {
    const input = [
      comment('a', 1, 'Primeiro'),
      comment('b', 2, 'Segundo'),
      comment('c', 3, 'Terceiro'),
    ]
    const result = reorderComments(input, ['c', 'a', 'b'])
    expect(result.map((c) => [c.id, c.order, c.title])).toEqual([
      ['c', 1, 'Terceiro'],
      ['a', 2, 'Primeiro'],
      ['b', 3, 'Segundo'],
    ])
  })

  it('anexa ids ausentes da lista ao final sem perdê-los', () => {
    const input = [comment('a', 1), comment('b', 2), comment('c', 3)]
    const result = reorderComments(input, ['c'])
    expect(result.map((c) => c.id)).toEqual(['c', 'a', 'b'])
    expect(result.map((c) => c.order)).toEqual([1, 2, 3])
  })
})

describe('markerNumber', () => {
  const marker = (commentId?: string): MarkerAnnotation => ({
    id: 'm1',
    type: 'marker',
    zIndex: 0,
    createdAt: '',
    updatedAt: '',
    commentId,
    geometry: { point: { x: 0.5, y: 0.5 } },
    style: { color: '#000', symbol: 'circle' },
  })

  it('devolve o order do comentário vinculado', () => {
    const comments = [comment('x', 1), comment('y', 2)]
    expect(markerNumber(marker('y'), comments)).toBe(2)
  })

  it('devolve undefined para anotação livre', () => {
    expect(markerNumber(marker(undefined), [])).toBeUndefined()
  })
})
