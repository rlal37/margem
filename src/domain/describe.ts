/**
 * Descrição textual de anotações para acessibilidade (seção 12.2): cada
 * objeto precisa de uma representação com tipo, número e posição aproximada,
 * navegável por leitor de tela e por teclado. Puro e sem UI.
 */

import type { NormalizedPoint } from './geometry'
import { markerNumber } from './numbering'
import type { Annotation, AnnotationType, Comment } from './types'

const TYPE_LABELS: Record<AnnotationType, string> = {
  marker: 'Marcador',
  area: 'Área',
  arrow: 'Seta',
  draw: 'Desenho',
  text: 'Texto',
}

/** Nome legível do tipo de anotação. */
export function annotationTypeLabel(type: AnnotationType): string {
  return TYPE_LABELS[type]
}

/** Centro aproximado (normalizado) de uma anotação, para localizá-la. */
export function annotationCenter(annotation: Annotation): NormalizedPoint {
  switch (annotation.type) {
    case 'marker':
    case 'text':
      return annotation.geometry.point
    case 'area': {
      const r = annotation.geometry.rect
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 }
    }
    case 'arrow': {
      const { start, end } = annotation.geometry
      return { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 }
    }
    case 'draw': {
      const pts = annotation.geometry.points
      if (pts.length === 0) return { x: 0, y: 0 }
      const xs = pts.map((p) => p.x)
      const ys = pts.map((p) => p.y)
      return {
        x: (Math.min(...xs) + Math.max(...xs)) / 2,
        y: (Math.min(...ys) + Math.max(...ys)) / 2,
      }
    }
  }
}

/** Posição aproximada em terços da imagem, em palavras (sem depender de cor). */
export function describePosition(center: NormalizedPoint): string {
  const horizontal =
    center.x < 1 / 3
      ? 'à esquerda'
      : center.x < 2 / 3
        ? 'ao centro'
        : 'à direita'
  const vertical =
    center.y < 1 / 3 ? 'no topo' : center.y < 2 / 3 ? 'no meio' : 'na base'
  return `${horizontal} ${vertical}`
}

/**
 * Texto acessível de uma anotação: tipo, número (quando houver comentário
 * vinculado) e posição aproximada. Ex.: "Marcador 2, à esquerda no topo".
 */
export function describeAnnotation(
  annotation: Annotation,
  comments: readonly Comment[],
): string {
  const type = annotationTypeLabel(annotation.type)
  const number = markerNumber(annotation, comments)
  const head = number !== undefined ? `${type} ${number}` : type
  return `${head}, ${describePosition(annotationCenter(annotation))}`
}
