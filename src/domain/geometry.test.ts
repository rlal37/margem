import { describe, expect, it } from 'vitest'
import {
  clamp01,
  clampPoint,
  normalizeRect,
  rectFromPoints,
  toNormalizedPoint,
  toPixelPoint,
  type PixelSize,
} from './geometry'

const image: PixelSize = { width: 1440, height: 900 }

describe('clamp01', () => {
  it('limita ao intervalo [0, 1]', () => {
    expect(clamp01(-0.5)).toBe(0)
    expect(clamp01(0.42)).toBe(0.42)
    expect(clamp01(3)).toBe(1)
  })
})

describe('clampPoint', () => {
  it('limita ambos os eixos', () => {
    expect(clampPoint({ x: -1, y: 2 })).toEqual({ x: 0, y: 1 })
  })
})

describe('conversão pixel <-> normalizado', () => {
  it('faz round-trip preservando o ponto original', () => {
    const pixel = { x: 720, y: 450 }
    const normalized = toNormalizedPoint(pixel, image)
    expect(normalized).toEqual({ x: 0.5, y: 0.5 })
    expect(toPixelPoint(normalized, image)).toEqual(pixel)
  })

  it('evita divisão por zero quando a dimensão é inválida', () => {
    expect(
      toNormalizedPoint({ x: 10, y: 10 }, { width: 0, height: 0 }),
    ).toEqual({ x: 0, y: 0 })
  })
})

function expectRectClose(
  actual: { x: number; y: number; width: number; height: number },
  expected: { x: number; y: number; width: number; height: number },
): void {
  expect(actual.x).toBeCloseTo(expected.x)
  expect(actual.y).toBeCloseTo(expected.y)
  expect(actual.width).toBeCloseTo(expected.width)
  expect(actual.height).toBeCloseTo(expected.height)
}

describe('rectFromPoints', () => {
  it('produz dimensões não negativas independentemente da direção do arraste', () => {
    const rect = rectFromPoints({ x: 0.8, y: 0.9 }, { x: 0.2, y: 0.1 })
    expectRectClose(rect, { x: 0.2, y: 0.1, width: 0.6, height: 0.8 })
  })
})

describe('normalizeRect', () => {
  it('reordena cantos quando largura/altura são negativas', () => {
    expectRectClose(
      normalizeRect({ x: 0.8, y: 0.9, width: -0.6, height: -0.8 }),
      {
        x: 0.2,
        y: 0.1,
        width: 0.6,
        height: 0.8,
      },
    )
  })

  it('mantém retângulos já normalizados', () => {
    const rect = { x: 0.1, y: 0.1, width: 0.3, height: 0.3 }
    expect(normalizeRect(rect)).toEqual(rect)
  })
})
