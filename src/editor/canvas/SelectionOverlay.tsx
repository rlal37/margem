/**
 * Contorno de seleção (Apêndice B: SelectionOverlay). Desenha uma caixa
 * tracejada ao redor do objeto selecionado — seleção perceptível por
 * contorno (seção 9.1). Alças de redimensionamento são um passo seguinte.
 */

import type { PixelSize } from '../../domain/geometry'
import type { Annotation } from '../../domain/types'
import { annotationExtent } from '../tools/tools'

interface SelectionOverlayProps {
  annotation: Annotation
  imageWidth: number
  imageHeight: number
  zoom: number
}

/** Folga da caixa ao redor do objeto, em pixels de tela. */
const PADDING_PX = 6

export function SelectionOverlay({
  annotation,
  imageWidth,
  imageHeight,
  zoom,
}: SelectionOverlayProps) {
  const size: PixelSize = { width: imageWidth, height: imageHeight }
  const extent = annotationExtent(annotation)
  const pad = PADDING_PX / zoom

  const x = extent.minX * size.width - pad
  const y = extent.minY * size.height - pad
  const width = (extent.maxX - extent.minX) * size.width + pad * 2
  const height = (extent.maxY - extent.minY) * size.height + pad * 2

  return (
    <rect
      className="selection-overlay"
      data-testid="selection-overlay"
      x={x}
      y={y}
      width={width}
      height={height}
      fill="none"
      stroke="#1f6feb"
      strokeWidth={1.5}
      strokeDasharray="4 3"
      vectorEffect="non-scaling-stroke"
      pointerEvents="none"
    />
  )
}
