/**
 * Fatorias do domínio: criam entidades com padrões coerentes e ids/tempos
 * gerados. Todas aceitam sobrescritas opcionais para testes determinísticos.
 *
 * As fatorias são puras quanto ao estado do projeto — não vinculam nem
 * numeram; a composição (marcador + comentário, ordem, zIndex) é
 * responsabilidade dos comandos (ver `editor/history`).
 */

import {
  DEFAULT_ANNOTATION_COLOR,
  DEFAULT_FONT_SIZE,
  DEFAULT_MARKER_COLOR,
  DEFAULT_MARKER_SYMBOL,
  DEFAULT_OPACITY,
  DEFAULT_STROKE_WIDTH,
  SCHEMA_VERSION,
} from './constants'
import type { NormalizedPoint, NormalizedRect } from './geometry'
import { newId } from './ids'
import type {
  AreaAnnotation,
  ArrowAnnotation,
  ArrowHead,
  Comment,
  CommentCategory,
  DrawAnnotation,
  ImageAsset,
  MarkerAnnotation,
  MarkerSymbol,
  Preferences,
  Project,
  TextAlign,
  TextAnnotation,
  Viewport,
} from './types'

interface FactoryOptions {
  id?: string
  now?: string
  zIndex?: number
}

function stamp(now?: string): string {
  return now ?? new Date().toISOString()
}

function base(options: FactoryOptions) {
  const now = stamp(options.now)
  return {
    id: options.id ?? newId(),
    zIndex: options.zIndex ?? 0,
    createdAt: now,
    updatedAt: now,
  }
}

export const DEFAULT_VIEWPORT: Viewport = {
  zoom: 1,
  panX: 0,
  panY: 0,
  fitMode: 'fit',
}

export const DEFAULT_PREFERENCES: Preferences = {
  lastTool: 'select',
  strokeWidth: DEFAULT_STROKE_WIDTH,
  color: DEFAULT_ANNOTATION_COLOR,
  reduceMotion: false,
  panelOpen: true,
}

export function createMarker(
  point: NormalizedPoint,
  options: FactoryOptions & {
    color?: string
    symbol?: MarkerSymbol
    commentId?: string
  } = {},
): MarkerAnnotation {
  return {
    ...base(options),
    type: 'marker',
    commentId: options.commentId,
    geometry: { point },
    style: {
      color: options.color ?? DEFAULT_MARKER_COLOR,
      symbol: options.symbol ?? DEFAULT_MARKER_SYMBOL,
    },
  }
}

export function createArea(
  rect: NormalizedRect,
  options: FactoryOptions & {
    color?: string
    strokeWidth?: number
    opacity?: number
  } = {},
): AreaAnnotation {
  return {
    ...base(options),
    type: 'area',
    geometry: { rect },
    style: {
      color: options.color ?? DEFAULT_ANNOTATION_COLOR,
      strokeWidth: options.strokeWidth ?? DEFAULT_STROKE_WIDTH,
      opacity: options.opacity ?? DEFAULT_OPACITY,
    },
  }
}

export function createArrow(
  start: NormalizedPoint,
  end: NormalizedPoint,
  options: FactoryOptions & {
    color?: string
    strokeWidth?: number
    head?: ArrowHead
  } = {},
): ArrowAnnotation {
  return {
    ...base(options),
    type: 'arrow',
    geometry: { start, end },
    style: {
      color: options.color ?? DEFAULT_ANNOTATION_COLOR,
      strokeWidth: options.strokeWidth ?? DEFAULT_STROKE_WIDTH,
      head: options.head ?? 'standard',
    },
  }
}

export function createDraw(
  points: NormalizedPoint[],
  options: FactoryOptions & { color?: string; strokeWidth?: number } = {},
): DrawAnnotation {
  return {
    ...base(options),
    type: 'draw',
    geometry: { points },
    style: {
      color: options.color ?? DEFAULT_ANNOTATION_COLOR,
      strokeWidth: options.strokeWidth ?? DEFAULT_STROKE_WIDTH,
    },
  }
}

export function createText(
  point: NormalizedPoint,
  text: string,
  options: FactoryOptions & {
    color?: string
    fontSize?: number
    align?: TextAlign
  } = {},
): TextAnnotation {
  return {
    ...base(options),
    type: 'text',
    text,
    geometry: { point },
    style: {
      color: options.color ?? DEFAULT_ANNOTATION_COLOR,
      fontSize: options.fontSize ?? DEFAULT_FONT_SIZE,
      align: options.align ?? 'left',
    },
  }
}

export function createComment(
  options: {
    id?: string
    order?: number
    title?: string
    body?: string
    category?: CommentCategory
    markerAnnotationId?: string
  } = {},
): Comment {
  return {
    id: options.id ?? newId(),
    order: options.order ?? 1,
    title: options.title ?? '',
    body: options.body ?? '',
    category: options.category,
    markerAnnotationId: options.markerAnnotationId,
  }
}

/**
 * Cria um marcador já vinculado a um novo comentário (RF-040). A ordem do
 * comentário é fornecida pelo chamador (o comando conhece os comentários
 * existentes); o padrão 1 vale para o primeiro comentário do projeto.
 */
export function createMarkerWithComment(
  point: NormalizedPoint,
  options: FactoryOptions & {
    color?: string
    symbol?: MarkerSymbol
    order?: number
    commentId?: string
  } = {},
): { annotation: MarkerAnnotation; comment: Comment } {
  const commentId = options.commentId ?? newId()
  const annotation = createMarker(point, {
    id: options.id,
    now: options.now,
    zIndex: options.zIndex,
    color: options.color,
    symbol: options.symbol,
    commentId,
  })
  const comment = createComment({
    id: commentId,
    order: options.order ?? 1,
    markerAnnotationId: annotation.id,
  })
  return { annotation, comment }
}

export function createProject(
  image: ImageAsset,
  options: {
    id?: string
    now?: string
    title?: string
    viewport?: Viewport
    preferences?: Preferences
  } = {},
): Project {
  const now = stamp(options.now)
  return {
    id: options.id ?? newId(),
    schemaVersion: SCHEMA_VERSION,
    title: options.title ?? 'Projeto sem título',
    createdAt: now,
    updatedAt: now,
    image,
    annotations: [],
    comments: [],
    viewport: options.viewport ?? { ...DEFAULT_VIEWPORT },
    preferences: options.preferences ?? { ...DEFAULT_PREFERENCES },
  }
}
