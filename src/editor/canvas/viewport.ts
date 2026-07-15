/**
 * Matemática do viewport do canvas (RF-010 a RF-014).
 *
 * O modelo é uma transformação afim simples: um ponto em pixels da
 * imagem-base `(ix, iy)` mapeia para a tela por
 *   sx = ix * zoom + panX
 *   sy = iy * zoom + panY
 * onde `pan` é a posição em pixels de tela do canto (0,0) da imagem dentro
 * do contêiner. Manter a geometria das anotações normalizada (ver
 * `domain/geometry`) e derivar a tela a partir daqui preserva a relação
 * espacial em qualquer zoom (RF-014) e o tamanho original na exportação.
 *
 * Todas as funções são puras — a interação (roda, arraste, resize) vive no
 * componente `CanvasViewport`.
 */

import type { PixelPoint, PixelSize } from '../../domain/geometry'

/** Transformação do viewport, sem o modo de ajuste. */
export interface ViewportTransform {
  zoom: number
  panX: number
  panY: number
}

/** Limites de zoom. Fora deles a leitura/uso deixa de ser útil. */
export const MIN_ZOOM = 0.02
export const MAX_ZOOM = 64
/** Passo multiplicativo padrão dos controles de zoom (+/-). */
export const ZOOM_STEP = 1.2

/** Limita o zoom ao intervalo suportado. */
export function clampZoom(zoom: number): number {
  if (!Number.isFinite(zoom) || zoom < MIN_ZOOM) return MIN_ZOOM
  if (zoom > MAX_ZOOM) return MAX_ZOOM
  return zoom
}

function centerPan(
  image: PixelSize,
  container: PixelSize,
  zoom: number,
): ViewportTransform {
  return {
    zoom,
    panX: (container.width - image.width * zoom) / 2,
    panY: (container.height - image.height * zoom) / 2,
  }
}

/**
 * Ajusta a imagem à área disponível, centralizada (RF-010, RF-013). Usa o
 * menor fator entre largura e altura (contain), sem ampliar além de 100%.
 */
export function fitViewport(
  image: PixelSize,
  container: PixelSize,
): ViewportTransform {
  if (image.width <= 0 || image.height <= 0) {
    return { zoom: 1, panX: 0, panY: 0 }
  }
  const scale = Math.min(
    container.width / image.width,
    container.height / image.height,
  )
  const zoom = clampZoom(Math.min(scale, 1))
  return centerPan(image, container, zoom)
}

/** Zoom 100% (1 px da imagem = 1 px de tela), centralizado (RF-013). */
export function actualViewport(
  image: PixelSize,
  container: PixelSize,
): ViewportTransform {
  return centerPan(image, container, 1)
}

/**
 * Aplica um novo zoom mantendo fixo o ponto de tela `focal` (por exemplo, o
 * cursor sob a roda do mouse). Se `focal` for omitido, usa o centro do
 * contêiner.
 */
export function setZoom(
  viewport: ViewportTransform,
  nextZoom: number,
  focal: PixelPoint,
): ViewportTransform {
  const zoom = clampZoom(nextZoom)
  // Ponto da imagem sob o foco antes do zoom.
  const imageX = (focal.x - viewport.panX) / viewport.zoom
  const imageY = (focal.y - viewport.panY) / viewport.zoom
  return {
    zoom,
    panX: focal.x - imageX * zoom,
    panY: focal.y - imageY * zoom,
  }
}

/** Multiplica o zoom por `factor` mantendo o ponto focal estável. */
export function zoomBy(
  viewport: ViewportTransform,
  factor: number,
  focal: PixelPoint,
): ViewportTransform {
  return setZoom(viewport, viewport.zoom * factor, focal)
}

/** Desloca o canvas (pan) em pixels de tela (RF-012). */
export function panBy(
  viewport: ViewportTransform,
  dx: number,
  dy: number,
): ViewportTransform {
  return { ...viewport, panX: viewport.panX + dx, panY: viewport.panY + dy }
}

/** Converte um ponto de tela para pixels da imagem-base. */
export function screenToImage(
  viewport: ViewportTransform,
  point: PixelPoint,
): PixelPoint {
  return {
    x: (point.x - viewport.panX) / viewport.zoom,
    y: (point.y - viewport.panY) / viewport.zoom,
  }
}

/** Converte um ponto em pixels da imagem-base para a tela. */
export function imageToScreen(
  viewport: ViewportTransform,
  point: PixelPoint,
): PixelPoint {
  return {
    x: point.x * viewport.zoom + viewport.panX,
    y: point.y * viewport.zoom + viewport.panY,
  }
}
