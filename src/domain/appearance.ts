/**
 * Aparência do marcador numerado (seção 10.3, decisão do Apêndice C:
 * "categoria define símbolo e cor"). Quando o comentário vinculado tem
 * categoria, ela determina símbolo e cor; sem categoria, usa a aparência
 * neutra armazenada no próprio marcador.
 *
 * Puro e sem UI: a geometria dos símbolos é devolvida como pontos relativos
 * ao centro, para SVG e canvas 2D (export PNG) desenharem de forma idêntica.
 */

import { CATEGORY_APPEARANCE } from './constants'
import type { NormalizedPoint } from './geometry'
import type { Comment, MarkerAnnotation, MarkerSymbol } from './types'

export interface MarkerAppearance {
  symbol: MarkerSymbol
  color: string
}

/** Símbolo e cor efetivos de um marcador, considerando a categoria vinculada. */
export function markerAppearance(
  marker: MarkerAnnotation,
  comments: readonly Comment[],
): MarkerAppearance {
  const comment =
    marker.commentId !== undefined
      ? comments.find((c) => c.id === marker.commentId)
      : undefined
  if (comment?.category) return CATEGORY_APPEARANCE[comment.category]
  return { symbol: marker.style.symbol, color: marker.style.color }
}

/**
 * Vértices de um símbolo, relativos ao centro (0, 0) e inscritos num raio `r`.
 * Retorna `null` para o círculo, que não é um polígono — o chamador desenha um
 * arco/circle nesse caso.
 */
export function symbolPolygon(
  symbol: MarkerSymbol,
  r: number,
): NormalizedPoint[] | null {
  switch (symbol) {
    case 'circle':
      return null
    case 'triangle': {
      const dx = 0.866 * r // cos(30°)
      const dy = 0.5 * r // sin(30°)
      return [
        { x: 0, y: -r },
        { x: dx, y: dy },
        { x: -dx, y: dy },
      ]
    }
    case 'diamond':
      return [
        { x: 0, y: -r },
        { x: r, y: 0 },
        { x: 0, y: r },
        { x: -r, y: 0 },
      ]
    case 'square': {
      const s = 0.8 * r
      return [
        { x: -s, y: -s },
        { x: s, y: -s },
        { x: s, y: s },
        { x: -s, y: s },
      ]
    }
  }
}

function channel(value: number): number {
  const c = value / 255
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

/** Luminância relativa (WCAG) de uma cor `#rrggbb`. */
export function relativeLuminance(hex: string): number {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return 0
  const int = parseInt(m[1], 16)
  const r = (int >> 16) & 0xff
  const g = (int >> 8) & 0xff
  const b = int & 0xff
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

const DARK_INK = '#111111'
const LIGHT_INK = '#ffffff'

function contrastRatio(a: number, b: number): number {
  const hi = Math.max(a, b)
  const lo = Math.min(a, b)
  return (hi + 0.05) / (lo + 0.05)
}

/**
 * Cor de tinta legível (número do marcador) sobre um fundo: escolhe entre
 * quase-preto e branco pelo maior contraste real (A11Y-006, WCAG).
 */
export function readableInk(background: string): string {
  const bg = relativeLuminance(background)
  const withDark = contrastRatio(bg, relativeLuminance(DARK_INK))
  const withLight = contrastRatio(bg, 1)
  return withDark >= withLight ? DARK_INK : LIGHT_INK
}
