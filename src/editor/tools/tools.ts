/**
 * Metadados das ferramentas e geometria pura de criação/edição (seção 8.3,
 * 9.3). Tudo aqui opera em coordenadas normalizadas (0..1) e é testável sem
 * DOM; a interação de ponteiro vive no canvas.
 */

import { clamp01, rectFromPoints } from '../../domain/geometry'
import type { NormalizedPoint, PixelSize } from '../../domain/geometry'
import type { Annotation, TextAnnotation, ToolId } from '../../domain/types'

export interface ToolMeta {
  id: ToolId
  label: string
  /** Tecla de atalho (Apêndice A). Aplicada em WP-06/09. */
  shortcut: string
}

/** Ordem de exibição na barra de ferramentas (seção 6.3). */
export const TOOLS: readonly ToolMeta[] = [
  { id: 'select', label: 'Selecionar', shortcut: 'V' },
  { id: 'marker', label: 'Marcador', shortcut: 'M' },
  { id: 'area', label: 'Área', shortcut: 'R' },
  { id: 'arrow', label: 'Seta', shortcut: 'A' },
  { id: 'draw', label: 'Desenho', shortcut: 'P' },
  { id: 'text', label: 'Texto', shortcut: 'T' },
  { id: 'pan', label: 'Mover canvas', shortcut: 'H' },
]

/** Arraste mínimo (em fração da imagem) para valer como área/seta. */
export const MIN_DRAG = 0.005

/**
 * Largura média de caractere e entrelinha (fração do tamanho da fonte). São
 * estimativas para dimensionar a caixa de um texto sem medir no DOM — usadas
 * na seleção e no clique, onde uma caixa levemente generosa é preferível a uma
 * minúscula (difícil de acertar).
 */
const TEXT_AVG_CHAR_WIDTH = 0.56
const TEXT_LINE_HEIGHT = 1.2

/**
 * Caixa aproximada de um texto em pixels da imagem, considerando conteúdo,
 * tamanho da fonte e alinhamento (a âncora fica no topo — `hanging`).
 */
export function textBoxPx(
  annotation: TextAnnotation,
  size: PixelSize,
): { x: number; y: number; width: number; height: number } {
  const lines = annotation.text.split('\n')
  const fontPx = annotation.style.fontSize
  const cols = Math.max(1, ...lines.map((line) => line.length))
  const width = cols * fontPx * TEXT_AVG_CHAR_WIDTH
  const height = lines.length * fontPx * TEXT_LINE_HEIGHT
  const anchorX = annotation.geometry.point.x * size.width
  const anchorY = annotation.geometry.point.y * size.height
  const x =
    annotation.style.align === 'center'
      ? anchorX - width / 2
      : annotation.style.align === 'right'
        ? anchorX - width
        : anchorX
  return { x, y: anchorY, width, height }
}

function distance(a: NormalizedPoint, b: NormalizedPoint): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

/** Extensão (bounding box normalizado) de uma anotação. */
export function annotationExtent(annotation: Annotation): {
  minX: number
  minY: number
  maxX: number
  maxY: number
} {
  const points = annotationPoints(annotation)
  const xs = points.map((p) => p.x)
  const ys = points.map((p) => p.y)
  return {
    minX: Math.min(...xs),
    minY: Math.min(...ys),
    maxX: Math.max(...xs),
    maxY: Math.max(...ys),
  }
}

function annotationPoints(annotation: Annotation): NormalizedPoint[] {
  switch (annotation.type) {
    case 'marker':
    case 'text':
      return [annotation.geometry.point]
    case 'area': {
      const { x, y, width, height } = annotation.geometry.rect
      return [
        { x, y },
        { x: x + width, y: y + height },
      ]
    }
    case 'arrow':
      return [annotation.geometry.start, annotation.geometry.end]
    case 'draw':
      return annotation.geometry.points
  }
}

/**
 * Translada uma anotação por (dx, dy) normalizado, limitando o deslocamento
 * para que a extensão do objeto permaneça dentro da imagem (preserva a forma
 * em vez de deformar nas bordas).
 */
export function moveAnnotation(
  annotation: Annotation,
  dx: number,
  dy: number,
): Annotation {
  const { minX, minY, maxX, maxY } = annotationExtent(annotation)
  const clampedDx = Math.max(-minX, Math.min(dx, 1 - maxX))
  const clampedDy = Math.max(-minY, Math.min(dy, 1 - maxY))
  const shift = (p: NormalizedPoint): NormalizedPoint => ({
    x: p.x + clampedDx,
    y: p.y + clampedDy,
  })

  switch (annotation.type) {
    case 'marker':
      return {
        ...annotation,
        geometry: { point: shift(annotation.geometry.point) },
      }
    case 'text':
      return {
        ...annotation,
        geometry: { point: shift(annotation.geometry.point) },
      }
    case 'area':
      return {
        ...annotation,
        geometry: {
          rect: {
            ...annotation.geometry.rect,
            x: annotation.geometry.rect.x + clampedDx,
            y: annotation.geometry.rect.y + clampedDy,
          },
        },
      }
    case 'arrow':
      return {
        ...annotation,
        geometry: {
          start: shift(annotation.geometry.start),
          end: shift(annotation.geometry.end),
        },
      }
    case 'draw':
      return {
        ...annotation,
        geometry: { points: annotation.geometry.points.map(shift) },
      }
  }
}

/** Retângulo de área a partir de um arraste; `null` se pequeno demais. */
export function areaRectFromDrag(
  start: NormalizedPoint,
  end: NormalizedPoint,
): ReturnType<typeof rectFromPoints> | null {
  const rect = rectFromPoints(clampPoint(start), clampPoint(end))
  if (rect.width < MIN_DRAG && rect.height < MIN_DRAG) return null
  return rect
}

/** Verdadeiro se um arraste de seta é longo o bastante para valer. */
export function isArrowDragValid(
  start: NormalizedPoint,
  end: NormalizedPoint,
): boolean {
  return distance(start, end) >= MIN_DRAG
}

function clampPoint(p: NormalizedPoint): NormalizedPoint {
  return { x: clamp01(p.x), y: clamp01(p.y) }
}

function pointSegmentDistancePx(
  p: NormalizedPoint,
  a: NormalizedPoint,
  b: NormalizedPoint,
  size: PixelSize,
): number {
  const px = p.x * size.width
  const py = p.y * size.height
  const ax = a.x * size.width
  const ay = a.y * size.height
  const bx = b.x * size.width
  const by = b.y * size.height
  const dx = bx - ax
  const dy = by - ay
  const lengthSq = dx * dx + dy * dy
  if (lengthSq === 0) return Math.hypot(px - ax, py - ay)
  let t = ((px - ax) * dx + (py - ay) * dy) / lengthSq
  t = Math.max(0, Math.min(1, t))
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy))
}

/**
 * Encontra a anotação sob um ponto (em pixels da imagem), com tolerância
 * `pickRadius` em pixels de imagem. Devolve a de maior zIndex (topo). Garante
 * área de clique mínima para objetos finos (seção 9.1).
 */
export function hitTest(
  annotations: readonly Annotation[],
  imagePoint: { x: number; y: number },
  size: PixelSize,
  pickRadius: number,
): string | null {
  const pointNorm: NormalizedPoint = {
    x: imagePoint.x / size.width,
    y: imagePoint.y / size.height,
  }
  const candidates = [...annotations].sort((a, b) => b.zIndex - a.zIndex)

  for (const annotation of candidates) {
    if (isHit(annotation, pointNorm, imagePoint, size, pickRadius)) {
      return annotation.id
    }
  }
  return null
}

function isHit(
  annotation: Annotation,
  pointNorm: NormalizedPoint,
  imagePoint: { x: number; y: number },
  size: PixelSize,
  pickRadius: number,
): boolean {
  switch (annotation.type) {
    case 'marker': {
      const anchor = annotation.geometry.point
      const dx = pointNorm.x * size.width - anchor.x * size.width
      const dy = pointNorm.y * size.height - anchor.y * size.height
      return Math.hypot(dx, dy) <= pickRadius
    }
    case 'text': {
      // Clique sobre a caixa do texto (não só o ponto de âncora), com folga.
      const box = textBoxPx(annotation, size)
      return (
        imagePoint.x >= box.x - pickRadius &&
        imagePoint.x <= box.x + box.width + pickRadius &&
        imagePoint.y >= box.y - pickRadius &&
        imagePoint.y <= box.y + box.height + pickRadius
      )
    }
    case 'area': {
      const r = annotation.geometry.rect
      const left = r.x * size.width - pickRadius
      const right = (r.x + r.width) * size.width + pickRadius
      const top = r.y * size.height - pickRadius
      const bottom = (r.y + r.height) * size.height + pickRadius
      return (
        imagePoint.x >= left &&
        imagePoint.x <= right &&
        imagePoint.y >= top &&
        imagePoint.y <= bottom
      )
    }
    case 'arrow':
      return (
        pointSegmentDistancePx(
          pointNorm,
          annotation.geometry.start,
          annotation.geometry.end,
          size,
        ) <= pickRadius
      )
    case 'draw': {
      const pts = annotation.geometry.points
      for (let i = 1; i < pts.length; i++) {
        const prev = pts[i - 1]
        const curr = pts[i]
        if (
          prev &&
          curr &&
          pointSegmentDistancePx(pointNorm, prev, curr, size) <= pickRadius
        ) {
          return true
        }
      }
      return false
    }
  }
}
