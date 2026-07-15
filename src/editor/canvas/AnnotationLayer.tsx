/**
 * Camada de anotações em SVG (Apêndice B: AnnotationLayer). Renderiza todos
 * os objetos sobre a imagem, em espaço de pixels da imagem — o mesmo grupo
 * transformado do `CanvasViewport` —, preservando a relação espacial em
 * qualquer zoom (RF-014).
 *
 * Convenções de escala:
 * - Traços (área, seta, desenho) usam `non-scaling-stroke`: espessura
 *   constante em pixels de tela, previsível em qualquer zoom.
 * - Marcador e texto são "rótulos" de tamanho de tela constante: contra-
 *   escalados por 1/zoom para não encolher/crescer com o zoom.
 */

import type { PixelSize } from '../../domain/geometry'
import { markerNumber } from '../../domain/numbering'
import type {
  Annotation,
  AreaAnnotation,
  ArrowAnnotation,
  Comment,
  DrawAnnotation,
  MarkerAnnotation,
  TextAnnotation,
} from '../../domain/types'

type PixelSizeLike = PixelSize

interface AnnotationLayerProps {
  annotations: readonly Annotation[]
  comments: readonly Comment[]
  imageWidth: number
  imageHeight: number
  zoom: number
}

const MARKER_RADIUS_PX = 13
const MARKER_FONT_PX = 14

export function AnnotationLayer({
  annotations,
  comments,
  imageWidth,
  imageHeight,
  zoom,
}: AnnotationLayerProps) {
  const size: PixelSizeLike = { width: imageWidth, height: imageHeight }
  const ordered = [...annotations].sort((a, b) => a.zIndex - b.zIndex)

  return (
    <g className="annotation-layer" data-testid="annotation-layer">
      <defs>
        <marker
          id="margem-arrowhead"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L10,5 L0,10 z" fill="context-stroke" />
        </marker>
      </defs>
      {ordered.map((annotation) => (
        <AnnotationShape
          key={annotation.id}
          annotation={annotation}
          comments={comments}
          size={size}
          zoom={zoom}
        />
      ))}
    </g>
  )
}

function AnnotationShape({
  annotation,
  comments,
  size,
  zoom,
}: {
  annotation: Annotation
  comments: readonly Comment[]
  size: PixelSizeLike
  zoom: number
}) {
  switch (annotation.type) {
    case 'marker':
      return (
        <MarkerShape
          annotation={annotation}
          comments={comments}
          size={size}
          zoom={zoom}
        />
      )
    case 'area':
      return <AreaShape annotation={annotation} size={size} />
    case 'arrow':
      return <ArrowShape annotation={annotation} size={size} />
    case 'draw':
      return <DrawShape annotation={annotation} size={size} />
    case 'text':
      return <TextShape annotation={annotation} size={size} zoom={zoom} />
  }
}

function MarkerShape({
  annotation,
  comments,
  size,
  zoom,
}: {
  annotation: MarkerAnnotation
  comments: readonly Comment[]
  size: PixelSizeLike
  zoom: number
}) {
  const cx = annotation.geometry.point.x * size.width
  const cy = annotation.geometry.point.y * size.height
  const r = MARKER_RADIUS_PX / zoom
  const number = markerNumber(annotation, comments)
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={annotation.style.color} />
      <text
        x={cx}
        y={cy}
        fontSize={MARKER_FONT_PX / zoom}
        fill="#ffffff"
        textAnchor="middle"
        dominantBaseline="central"
        fontWeight={600}
        style={{ userSelect: 'none' }}
      >
        {number ?? ''}
      </text>
    </g>
  )
}

function AreaShape({
  annotation,
  size,
}: {
  annotation: AreaAnnotation
  size: PixelSizeLike
}) {
  const { x, y, width, height } = annotation.geometry.rect
  return (
    <rect
      x={x * size.width}
      y={y * size.height}
      width={width * size.width}
      height={height * size.height}
      fill="none"
      stroke={annotation.style.color}
      strokeWidth={annotation.style.strokeWidth}
      opacity={annotation.style.opacity}
      vectorEffect="non-scaling-stroke"
    />
  )
}

function ArrowShape({
  annotation,
  size,
}: {
  annotation: ArrowAnnotation
  size: PixelSizeLike
}) {
  const { start, end } = annotation.geometry
  return (
    <line
      x1={start.x * size.width}
      y1={start.y * size.height}
      x2={end.x * size.width}
      y2={end.y * size.height}
      stroke={annotation.style.color}
      strokeWidth={annotation.style.strokeWidth}
      strokeLinecap="round"
      vectorEffect="non-scaling-stroke"
      markerEnd={
        annotation.style.head === 'standard'
          ? 'url(#margem-arrowhead)'
          : undefined
      }
    />
  )
}

function DrawShape({
  annotation,
  size,
}: {
  annotation: DrawAnnotation
  size: PixelSizeLike
}) {
  const points = annotation.geometry.points
    .map((p) => `${p.x * size.width},${p.y * size.height}`)
    .join(' ')
  return (
    <polyline
      points={points}
      fill="none"
      stroke={annotation.style.color}
      strokeWidth={annotation.style.strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      vectorEffect="non-scaling-stroke"
    />
  )
}

function TextShape({
  annotation,
  size,
  zoom,
}: {
  annotation: TextAnnotation
  size: PixelSizeLike
  zoom: number
}) {
  const anchor =
    annotation.style.align === 'center'
      ? 'middle'
      : annotation.style.align === 'right'
        ? 'end'
        : 'start'
  return (
    <text
      x={annotation.geometry.point.x * size.width}
      y={annotation.geometry.point.y * size.height}
      fontSize={annotation.style.fontSize / zoom}
      fill={annotation.style.color}
      textAnchor={anchor}
      dominantBaseline="hanging"
      style={{ whiteSpace: 'pre' }}
    >
      {annotation.text}
    </text>
  )
}
