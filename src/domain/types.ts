/**
 * Tipos do domínio da Margem (seção 13.1 do documento de requisitos).
 *
 * Regras estruturais refletidas aqui:
 * - Um projeto tem exatamente uma imagem-base (RF-005).
 * - Anotações livres não exigem comentário; apenas o marcador numerado
 *   carrega um comentário vinculado (RF-030, RF-040).
 * - Geometria sempre em coordenadas normalizadas (ver `geometry.ts`).
 */

import type { NormalizedPoint, NormalizedRect } from './geometry'

/** Ferramentas do editor (Apêndice A). */
export type ToolId =
  'select' | 'marker' | 'area' | 'arrow' | 'draw' | 'text' | 'pan'

/** Tipos de objeto de anotação (seção 8.3). */
export type AnnotationType = 'marker' | 'area' | 'arrow' | 'draw' | 'text'

/** Símbolo do marcador (seção 10.3). Independente da categoria do comentário. */
export type MarkerSymbol = 'circle' | 'triangle' | 'diamond' | 'square'

/** Ponta da seta. */
export type ArrowHead = 'standard' | 'none'

/** Alinhamento do texto no canvas. */
export type TextAlign = 'left' | 'center' | 'right'

/** Categoria opcional de comentário (seção 10.3, RF-042). */
export type CommentCategory = 'observacao' | 'problema' | 'duvida' | 'sugestao'

/** Formatos de imagem aceitos como imagem-base (RF-002). */
export type SupportedImageType = 'image/png' | 'image/jpeg' | 'image/webp'

/** Campos comuns a toda anotação. */
export interface AnnotationBase {
  id: string
  /** Ordem de empilhamento visual. */
  zIndex: number
  createdAt: string
  updatedAt: string
  /**
   * Comentário vinculado. Presente por padrão apenas no marcador (RF-040);
   * demais objetos ficam livres (RF-030).
   */
  commentId?: string
}

export interface MarkerAnnotation extends AnnotationBase {
  type: 'marker'
  geometry: { point: NormalizedPoint }
  style: { color: string; symbol: MarkerSymbol }
}

export interface AreaAnnotation extends AnnotationBase {
  type: 'area'
  geometry: { rect: NormalizedRect }
  style: { color: string; strokeWidth: number; opacity: number }
}

export interface ArrowAnnotation extends AnnotationBase {
  type: 'arrow'
  geometry: { start: NormalizedPoint; end: NormalizedPoint }
  style: { color: string; strokeWidth: number; head: ArrowHead }
}

export interface DrawAnnotation extends AnnotationBase {
  type: 'draw'
  geometry: { points: NormalizedPoint[] }
  style: { color: string; strokeWidth: number }
}

export interface TextAnnotation extends AnnotationBase {
  type: 'text'
  geometry: { point: NormalizedPoint }
  text: string
  style: { color: string; fontSize: number; align: TextAlign }
}

/** União discriminada por `type`. */
export type Annotation =
  | MarkerAnnotation
  | AreaAnnotation
  | ArrowAnnotation
  | DrawAnnotation
  | TextAnnotation

/**
 * Comentário. Pode estar vinculado a um marcador (`markerAnnotationId`) ou
 * existir apenas como item de documentação (RF-046). `order` é contíguo
 * (1..n) e define a numeração exibida do marcador correspondente (RF-021).
 */
export interface Comment {
  id: string
  markerAnnotationId?: string
  order: number
  title: string
  body: string
  category?: CommentCategory
}

/** Imagem-base do projeto (seção 13.1). */
export interface ImageAsset {
  mimeType: SupportedImageType
  width: number
  height: number
  originalName: string
  /**
   * Referência ao dado da imagem. No domínio é uma string opaca (data URL,
   * object URL ou chave de armazenamento); a resolução concreta é
   * responsabilidade da camada de persistência (WP-07).
   */
  source: string
  checksum?: string
}

/** Modo de ajuste do viewport (RF-013). */
export type FitMode = 'fit' | 'actual'

/** Estado de navegação do canvas (seção 13.1). */
export interface Viewport {
  zoom: number
  panX: number
  panY: number
  fitMode: FitMode
}

/** Preferências essenciais persistidas (seção 13.1). */
export interface Preferences {
  lastTool: ToolId
  strokeWidth: number
  color: string
  reduceMotion: boolean
  panelOpen: boolean
}

/** Projeto completo — unidade de persistência e exportação. */
export interface Project {
  id: string
  schemaVersion: string
  title: string
  createdAt: string
  updatedAt: string
  image: ImageAsset
  annotations: Annotation[]
  comments: Comment[]
  viewport: Viewport
  preferences: Preferences
}
