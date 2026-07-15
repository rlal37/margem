/**
 * Área de trabalho: renderiza a imagem-base em SVG e aplica a transformação
 * do viewport (RF-010, RF-014). Suporta zoom por roda com modificador
 * (RF-011), pan por arraste (RF-012) e reajuste ao redimensionar quando em
 * modo "ajustar à tela". Os limites da imagem ficam visíveis contra a área
 * externa do canvas (RF-015).
 *
 * O componente é controlado: recebe `viewport` e emite `onViewportChange`.
 * Zoom/ajuste/100% são expostos por um handle imperativo para a barra
 * superior (WP posterior) acionar. Atalhos de teclado completos são WP-09.
 */

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from 'react'
import type { PixelSize } from '../../domain/geometry'
import type { ImageAsset, Viewport } from '../../domain/types'
import './CanvasViewport.css'
import {
  actualViewport,
  fitViewport,
  panBy,
  zoomBy,
  ZOOM_STEP,
  type ViewportTransform,
} from './viewport'

export interface CanvasViewportHandle {
  zoomIn(): void
  zoomOut(): void
  fit(): void
  actual(): void
}

interface CanvasViewportProps {
  image: ImageAsset
  viewport: Viewport
  onViewportChange(next: Viewport): void
}

function toTransform(viewport: Viewport): ViewportTransform {
  return { zoom: viewport.zoom, panX: viewport.panX, panY: viewport.panY }
}

export const CanvasViewport = forwardRef<
  CanvasViewportHandle,
  CanvasViewportProps
>(function CanvasViewport({ image, viewport, onViewportChange }, ref) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState<PixelSize>({ width: 0, height: 0 })
  const dragRef = useRef<{ x: number; y: number } | null>(null)

  const imageSize: PixelSize = useMemo(
    () => ({ width: image.width, height: image.height }),
    [image.width, image.height],
  )

  const emit = useCallback(
    (transform: ViewportTransform, fitMode: Viewport['fitMode']) => {
      onViewportChange({ ...transform, fitMode })
    },
    [onViewportChange],
  )

  // Mede o contêiner e reage a redimensionamentos (RNF-007).
  useEffect(() => {
    const node = containerRef.current
    if (!node) return
    const measure = () => {
      const rect = node.getBoundingClientRect()
      setSize({ width: rect.width, height: rect.height })
    }
    measure()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(measure)
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  // Em modo "ajustar", recalcula o enquadramento sempre que a área muda.
  useEffect(() => {
    if (viewport.fitMode !== 'fit') return
    if (size.width === 0 || size.height === 0) return
    const next = fitViewport(imageSize, size)
    if (
      next.zoom !== viewport.zoom ||
      next.panX !== viewport.panX ||
      next.panY !== viewport.panY
    ) {
      emit(next, 'fit')
    }
  }, [
    size,
    imageSize,
    viewport.fitMode,
    viewport.zoom,
    viewport.panX,
    viewport.panY,
    emit,
  ])

  const focalCenter = useCallback(
    () => ({ x: size.width / 2, y: size.height / 2 }),
    [size],
  )

  useImperativeHandle(
    ref,
    () => ({
      zoomIn: () =>
        emit(zoomBy(toTransform(viewport), ZOOM_STEP, focalCenter()), 'actual'),
      zoomOut: () =>
        emit(
          zoomBy(toTransform(viewport), 1 / ZOOM_STEP, focalCenter()),
          'actual',
        ),
      fit: () => emit(fitViewport(imageSize, size), 'fit'),
      actual: () => emit(actualViewport(imageSize, size), 'actual'),
    }),
    [viewport, size, imageSize, focalCenter, emit],
  )

  const handleWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    if (!event.ctrlKey && !event.metaKey) return
    event.preventDefault()
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const focal = { x: event.clientX - rect.left, y: event.clientY - rect.top }
    const factor = event.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP
    emit(zoomBy(toTransform(viewport), factor, focal), 'actual')
  }

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return
    dragRef.current = { x: event.clientX, y: event.clientY }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = dragRef.current
    if (!start) return
    const dx = event.clientX - start.x
    const dy = event.clientY - start.y
    dragRef.current = { x: event.clientX, y: event.clientY }
    emit(panBy(toTransform(viewport), dx, dy), 'actual')
  }

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragRef.current === null) return
    dragRef.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  return (
    <div
      ref={containerRef}
      className="canvas-viewport"
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <svg
        className="canvas-viewport__svg"
        width={size.width}
        height={size.height}
        role="img"
        aria-label={`Imagem ${image.originalName}, ${image.width} por ${image.height} pixels`}
      >
        <g
          transform={`translate(${viewport.panX} ${viewport.panY}) scale(${viewport.zoom})`}
        >
          <image
            href={image.source}
            width={image.width}
            height={image.height}
            // Preserva nitidez de bordas ao ampliar bitmaps.
            style={{ imageRendering: 'auto' }}
          />
          <rect
            className="canvas-viewport__bounds"
            x={0}
            y={0}
            width={image.width}
            height={image.height}
            fill="none"
            vectorEffect="non-scaling-stroke"
          />
        </g>
      </svg>
    </div>
  )
})
