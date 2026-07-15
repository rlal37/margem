import { describe, expect, it } from 'vitest'
import type { PixelSize } from '../../domain/geometry'
import {
  actualViewport,
  clampZoom,
  fitViewport,
  imageToScreen,
  MAX_ZOOM,
  MIN_ZOOM,
  panBy,
  screenToImage,
  setZoom,
  zoomBy,
  type ViewportTransform,
} from './viewport'

const image: PixelSize = { width: 1000, height: 500 }
const container: PixelSize = { width: 800, height: 600 }

describe('clampZoom', () => {
  it('limita aos extremos suportados', () => {
    expect(clampZoom(0)).toBe(MIN_ZOOM)
    expect(clampZoom(9999)).toBe(MAX_ZOOM)
    expect(clampZoom(2)).toBe(2)
    expect(clampZoom(Number.NaN)).toBe(MIN_ZOOM)
  })
})

describe('fitViewport', () => {
  it('ajusta pelo menor eixo e centraliza', () => {
    // Largura limita: 800/1000 = 0.8 < 600/500 = 1.2
    const vp = fitViewport(image, container)
    expect(vp.zoom).toBeCloseTo(0.8)
    // Centralizado: sobra vertical (600 - 400)/2 = 100
    expect(vp.panX).toBeCloseTo(0)
    expect(vp.panY).toBeCloseTo(100)
  })

  it('não amplia imagens menores que o contêiner além de 100%', () => {
    const vp = fitViewport({ width: 100, height: 100 }, container)
    expect(vp.zoom).toBe(1)
  })

  it('é resiliente a imagem degenerada', () => {
    expect(fitViewport({ width: 0, height: 0 }, container)).toEqual({
      zoom: 1,
      panX: 0,
      panY: 0,
    })
  })
})

describe('actualViewport', () => {
  it('usa zoom 1 e centraliza', () => {
    const vp = actualViewport(image, container)
    expect(vp.zoom).toBe(1)
    expect(vp.panX).toBeCloseTo(-100) // (800 - 1000)/2
    expect(vp.panY).toBeCloseTo(50) // (600 - 500)/2
  })
})

describe('setZoom / zoomBy', () => {
  const base: ViewportTransform = { zoom: 1, panX: 0, panY: 0 }

  it('mantém o ponto focal estável ao ampliar', () => {
    const focal = { x: 200, y: 150 }
    const before = screenToImage(base, focal)
    const zoomed = zoomBy(base, 2, focal)
    expect(zoomed.zoom).toBe(2)
    const after = screenToImage(zoomed, focal)
    expect(after.x).toBeCloseTo(before.x)
    expect(after.y).toBeCloseTo(before.y)
  })

  it('respeita os limites de zoom', () => {
    const focal = { x: 0, y: 0 }
    expect(setZoom(base, 1000, focal).zoom).toBe(MAX_ZOOM)
    expect(setZoom(base, 0.0001, focal).zoom).toBe(MIN_ZOOM)
  })
})

describe('panBy', () => {
  it('desloca sem alterar o zoom', () => {
    const vp = panBy({ zoom: 2, panX: 10, panY: 20 }, 5, -5)
    expect(vp).toEqual({ zoom: 2, panX: 15, panY: 15 })
  })
})

describe('screenToImage / imageToScreen', () => {
  it('faz round-trip', () => {
    const vp: ViewportTransform = { zoom: 1.5, panX: 30, panY: -10 }
    const point = { x: 123, y: 456 }
    const roundTrip = imageToScreen(vp, screenToImage(vp, point))
    expect(roundTrip.x).toBeCloseTo(point.x)
    expect(roundTrip.y).toBeCloseTo(point.y)
  })
})
