/**
 * Coordenadas do domínio.
 *
 * Toda geometria de anotação é armazenada **normalizada** em relação às
 * dimensões originais da imagem-base: cada eixo vai de 0 a 1 (RNF-005 e
 * seção 13.2). Isso mantém a relação espacial entre imagem e anotações em
 * qualquer nível de zoom (RF-014) e preserva a exportação no tamanho
 * original (RF-060), independentemente do viewport.
 */

/** Ponto em coordenadas normalizadas (0..1 em cada eixo). */
export interface NormalizedPoint {
  x: number
  y: number
}

/** Retângulo normalizado. `width`/`height` são sempre >= 0. */
export interface NormalizedRect {
  x: number
  y: number
  width: number
  height: number
}

/** Dimensões em pixels da imagem-base. */
export interface PixelSize {
  width: number
  height: number
}

/** Ponto em pixels dentro da imagem-base. */
export interface PixelPoint {
  x: number
  y: number
}

/** Limita um número ao intervalo [0, 1]. */
export function clamp01(value: number): number {
  if (value < 0) return 0
  if (value > 1) return 1
  return value
}

/** Limita um ponto normalizado ao intervalo [0, 1] em ambos os eixos. */
export function clampPoint(point: NormalizedPoint): NormalizedPoint {
  return { x: clamp01(point.x), y: clamp01(point.y) }
}

/**
 * Converte um ponto em pixels da imagem para coordenadas normalizadas.
 * Dimensões não positivas resultam em 0 para evitar divisão inválida.
 */
export function toNormalizedPoint(
  point: PixelPoint,
  size: PixelSize,
): NormalizedPoint {
  return {
    x: size.width > 0 ? point.x / size.width : 0,
    y: size.height > 0 ? point.y / size.height : 0,
  }
}

/** Converte um ponto normalizado de volta para pixels da imagem. */
export function toPixelPoint(
  point: NormalizedPoint,
  size: PixelSize,
): PixelPoint {
  return { x: point.x * size.width, y: point.y * size.height }
}

/**
 * Retângulo normalizado a partir de dois pontos (cantos opostos), em
 * qualquer ordem. Usado na criação de área por arraste (RF-022): o usuário
 * pode arrastar em qualquer direção diagonal.
 */
export function rectFromPoints(
  a: NormalizedPoint,
  b: NormalizedPoint,
): NormalizedRect {
  const x = Math.min(a.x, b.x)
  const y = Math.min(a.y, b.y)
  return {
    x,
    y,
    width: Math.abs(a.x - b.x),
    height: Math.abs(a.y - b.y),
  }
}

/**
 * Normaliza um retângulo que possa ter chegado com largura/altura negativas
 * (por exemplo, após um redimensionamento que cruzou a origem), reordenando
 * os cantos para garantir dimensões não negativas.
 */
export function normalizeRect(rect: NormalizedRect): NormalizedRect {
  const x = rect.width < 0 ? rect.x + rect.width : rect.x
  const y = rect.height < 0 ? rect.y + rect.height : rect.y
  return {
    x,
    y,
    width: Math.abs(rect.width),
    height: Math.abs(rect.height),
  }
}
