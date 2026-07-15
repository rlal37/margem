import { render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import type { ImageAsset, Viewport } from '../../domain/types'
import { CanvasViewport, type CanvasViewportHandle } from './CanvasViewport'

beforeAll(() => {
  // jsdom não implementa ResizeObserver.
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
})

const image: ImageAsset = {
  mimeType: 'image/png',
  width: 1440,
  height: 900,
  originalName: 'captura.png',
  source: 'blob:local',
}

const viewport: Viewport = { zoom: 1, panX: 0, panY: 0, fitMode: 'actual' }

describe('CanvasViewport', () => {
  it('renderiza a imagem-base com nome acessível e dimensões', () => {
    render(
      <CanvasViewport
        image={image}
        viewport={viewport}
        onViewportChange={() => {}}
      />,
    )
    const svg = screen.getByRole('img', {
      name: 'Imagem captura.png, 1440 por 900 pixels',
    })
    expect(svg).toBeInTheDocument()
    const img = svg.querySelector('image')
    expect(img?.getAttribute('href')).toBe('blob:local')
    expect(img?.getAttribute('width')).toBe('1440')
  })

  it('aplica a transformação do viewport ao grupo', () => {
    render(
      <CanvasViewport
        image={image}
        viewport={{ zoom: 2, panX: 10, panY: 20, fitMode: 'actual' }}
        onViewportChange={() => {}}
      />,
    )
    const group = screen.getByRole('img').querySelector('g')
    expect(group?.getAttribute('transform')).toBe('translate(10 20) scale(2)')
  })

  it('expõe zoom por handle imperativo', () => {
    const ref = createRef<CanvasViewportHandle>()
    const onChange = vi.fn()
    render(
      <CanvasViewport
        ref={ref}
        image={image}
        viewport={viewport}
        onViewportChange={onChange}
      />,
    )
    ref.current?.zoomIn()
    expect(onChange).toHaveBeenCalledTimes(1)
    const next = onChange.mock.calls[0][0] as Viewport
    expect(next.zoom).toBeGreaterThan(1)
    expect(next.fitMode).toBe('actual')
  })
})
