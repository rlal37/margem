import { describe, expect, it } from 'vitest'
import {
  createArea,
  createArrow,
  createDraw,
  createMarker,
  createText,
} from '../../domain/factories'
import type { PixelSize } from '../../domain/geometry'
import {
  areaRectFromDrag,
  annotationExtent,
  hitTest,
  isArrowDragValid,
  moveAnnotation,
  textBoxPx,
} from './tools'

const size: PixelSize = { width: 1000, height: 1000 }

describe('areaRectFromDrag', () => {
  it('cria retângulo em qualquer direção de arraste', () => {
    const rect = areaRectFromDrag({ x: 0.6, y: 0.7 }, { x: 0.2, y: 0.3 })
    expect(rect).not.toBeNull()
    expect(rect?.x).toBeCloseTo(0.2)
    expect(rect?.width).toBeCloseTo(0.4)
  })

  it('descarta arraste minúsculo', () => {
    expect(
      areaRectFromDrag({ x: 0.5, y: 0.5 }, { x: 0.501, y: 0.501 }),
    ).toBeNull()
  })
})

describe('isArrowDragValid', () => {
  it('exige comprimento mínimo', () => {
    expect(isArrowDragValid({ x: 0.1, y: 0.1 }, { x: 0.5, y: 0.5 })).toBe(true)
    expect(isArrowDragValid({ x: 0.1, y: 0.1 }, { x: 0.101, y: 0.1 })).toBe(
      false,
    )
  })
})

describe('moveAnnotation', () => {
  it('translada mantendo a forma dentro da imagem', () => {
    const area = createArea(
      { x: 0.1, y: 0.1, width: 0.2, height: 0.2 },
      { id: 'a' },
    )
    const moved = moveAnnotation(area, 0.1, 0.1)
    expect(moved.type === 'area' && moved.geometry.rect).toMatchObject({
      x: 0.2,
      y: 0.2,
      width: 0.2,
      height: 0.2,
    })
  })

  it('limita o deslocamento na borda sem deformar', () => {
    const area = createArea(
      { x: 0.8, y: 0.8, width: 0.2, height: 0.2 },
      { id: 'a' },
    )
    const moved = moveAnnotation(area, 0.5, 0.5)
    // Não pode passar de x=0.8 (maxX=1.0).
    expect(moved.type === 'area' && moved.geometry.rect.x).toBeCloseTo(0.8)
    expect(moved.type === 'area' && moved.geometry.rect.width).toBeCloseTo(0.2)
  })

  it('translada todos os pontos de um desenho', () => {
    const draw = createDraw(
      [
        { x: 0.1, y: 0.1 },
        { x: 0.2, y: 0.2 },
      ],
      { id: 'd' },
    )
    const moved = moveAnnotation(draw, 0.1, 0)
    expect(moved.type === 'draw' && moved.geometry.points[0]?.x).toBeCloseTo(
      0.2,
    )
  })
})

describe('annotationExtent', () => {
  it('calcula a caixa de uma seta', () => {
    const arrow = createArrow(
      { x: 0.2, y: 0.8 },
      { x: 0.6, y: 0.1 },
      { id: 'ar' },
    )
    expect(annotationExtent(arrow)).toEqual({
      minX: 0.2,
      minY: 0.1,
      maxX: 0.6,
      maxY: 0.8,
    })
  })
})

describe('textBoxPx', () => {
  it('dimensiona a caixa pelo conteúdo e tamanho da fonte', () => {
    const text = createText({ x: 0.1, y: 0.1 }, 'abcd', {
      id: 't',
      fontSize: 20,
      align: 'left',
    })
    const box = textBoxPx(text, size)
    expect(box.x).toBeCloseTo(100)
    expect(box.y).toBeCloseTo(100)
    expect(box.width).toBeGreaterThan(30) // ~4 * 20 * 0.56
    expect(box.height).toBeCloseTo(24) // 1 linha * 20 * 1.2
  })

  it('desloca a caixa conforme o alinhamento', () => {
    const base = { x: 0.1, y: 0.1 } as const
    const opts = { fontSize: 20 } as const
    const left = textBoxPx(
      createText(base, 'abcd', { ...opts, align: 'left' }),
      size,
    )
    const center = textBoxPx(
      createText(base, 'abcd', { ...opts, align: 'center' }),
      size,
    )
    const right = textBoxPx(
      createText(base, 'abcd', { ...opts, align: 'right' }),
      size,
    )
    expect(center.x).toBeCloseTo(left.x - left.width / 2)
    expect(right.x).toBeCloseTo(left.x - left.width)
  })
})

describe('hitTest', () => {
  const marker = createMarker({ x: 0.5, y: 0.5 }, { id: 'm', zIndex: 0 })
  const area = createArea(
    { x: 0.1, y: 0.1, width: 0.2, height: 0.2 },
    { id: 'a', zIndex: 1 },
  )
  const text = createText({ x: 0.1, y: 0.1 }, 'abcdefghij', {
    id: 't',
    fontSize: 20,
    align: 'left',
  })

  it('acerta o texto sobre a caixa, não só na âncora', () => {
    // Ponto no meio do texto (âncora em 100,100; caixa ~112px de largura).
    expect(hitTest([text], { x: 160, y: 110 }, size, 5)).toBe('t')
  })

  it('erra o texto bem longe da caixa', () => {
    expect(hitTest([text], { x: 400, y: 400 }, size, 5)).toBeNull()
  })

  it('acerta o marcador perto do ponto', () => {
    expect(hitTest([marker], { x: 505, y: 505 }, size, 10)).toBe('m')
  })

  it('erra quando fora da tolerância', () => {
    expect(hitTest([marker], { x: 600, y: 600 }, size, 10)).toBeNull()
  })

  it('acerta dentro da área', () => {
    expect(hitTest([area], { x: 150, y: 150 }, size, 5)).toBe('a')
  })

  it('devolve o objeto de maior zIndex quando sobrepostos', () => {
    const overlapping = createArea(
      { x: 0.45, y: 0.45, width: 0.1, height: 0.1 },
      { id: 'top', zIndex: 5 },
    )
    expect(hitTest([marker, overlapping], { x: 500, y: 500 }, size, 10)).toBe(
      'top',
    )
  })
})
