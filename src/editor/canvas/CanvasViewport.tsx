/**
 * Área de trabalho: renderiza a imagem-base em SVG e aplica a transformação
 * do viewport (RF-010, RF-014). Zoom por roda com modificador (RF-011); pan
 * por arraste quando a ferramenta Mover está ativa (RF-012); reajuste ao
 * redimensionar em modo "ajustar" (RNF-007); limites da imagem visíveis
 * (RF-015).
 *
 * Para as demais ferramentas, os eventos de ponteiro são convertidos para
 * pixels da imagem e repassados via callbacks — a lógica de cada ferramenta
 * vive em `useCanvasTools`. O conteúdo (`children`) é renderizado dentro do
 * mesmo grupo transformado, em coordenadas de pixel da imagem.
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
  type ReactNode,
  type WheelEvent as ReactWheelEvent,
} from 'react'
import type { PixelPoint, PixelSize } from '../../domain/geometry'
import type { ImageAsset, ToolId, Viewport } from '../../domain/types'
import './CanvasViewport.css'
import {
  actualViewport,
  fitViewport,
  panBy,
  screenToImage,
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
  activeTool: ToolId
  onToolPointerDown?(imagePoint: PixelPoint): void
  onToolPointerMove?(imagePoint: PixelPoint): void
  onToolPointerUp?(imagePoint: PixelPoint): void
  children?: ReactNode
}

function toTransform(viewport: Viewport): ViewportTransform {
  return { zoom: viewport.zoom, panX: viewport.panX, panY: viewport.panY }
}

const CREATE_TOOLS: ReadonlySet<ToolId> = new Set([
  'marker',
  'area',
  'arrow',
  'draw',
  'text',
])

export const CanvasViewport = forwardRef<
  CanvasViewportHandle,
  CanvasViewportProps
>(function CanvasViewport(
  {
    image,
    viewport,
    onViewportChange,
    activeTool,
    onToolPointerDown,
    onToolPointerMove,
    onToolPointerUp,
    children,
  },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState<PixelSize>({ width: 0, height: 0 })
  const panRef = useRef<{ x: number; y: number } | null>(null)
  const toolGestureRef = useRef(false)

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

  const toImagePoint = useCallback(
    (clientX: number, clientY: number): PixelPoint | null => {
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return null
      return screenToImage(toTransform(viewport), {
        x: clientX - rect.left,
        y: clientY - rect.top,
      })
    },
    [viewport],
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
    event.currentTarget.setPointerCapture(event.pointerId)

    if (activeTool === 'pan') {
      panRef.current = { x: event.clientX, y: event.clientY }
      return
    }
    const point = toImagePoint(event.clientX, event.clientY)
    if (!point) return
    toolGestureRef.current = true
    onToolPointerDown?.(point)
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (panRef.current) {
      const dx = event.clientX - panRef.current.x
      const dy = event.clientY - panRef.current.y
      panRef.current = { x: event.clientX, y: event.clientY }
      emit(panBy(toTransform(viewport), dx, dy), 'actual')
      return
    }
    if (!toolGestureRef.current) return
    const point = toImagePoint(event.clientX, event.clientY)
    if (point) onToolPointerMove?.(point)
  }

  const endGesture = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    if (panRef.current) {
      panRef.current = null
      return
    }
    if (toolGestureRef.current) {
      toolGestureRef.current = false
      const point = toImagePoint(event.clientX, event.clientY)
      if (point) onToolPointerUp?.(point)
    }
  }

  const cursor =
    activeTool === 'pan'
      ? 'grab'
      : CREATE_TOOLS.has(activeTool)
        ? 'crosshair'
        : 'default'

  return (
    <div
      ref={containerRef}
      className="canvas-viewport"
      style={{ cursor }}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endGesture}
      onPointerCancel={endGesture}
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
          {children}
        </g>
      </svg>
    </div>
  )
})
