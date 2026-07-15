/**
 * Constantes do domínio.
 *
 * Decisões do Apêndice C fechadas no WP-10: paleta curta de 5 cores; a
 * categoria do comentário define símbolo e cor do marcador (ver
 * `CATEGORY_APPEARANCE` e `domain/appearance.ts`); marcador sem categoria usa
 * a aparência neutra (`DEFAULT_MARKER_COLOR` + `DEFAULT_MARKER_SYMBOL`).
 */

import type { CommentCategory, MarkerSymbol, SupportedImageType } from './types'

/** Versão do schema de projeto (seção 13.2). */
export const SCHEMA_VERSION = '1.0'

/** Formatos de imagem aceitos como imagem-base (RF-002). */
export const SUPPORTED_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
] as const satisfies readonly SupportedImageType[]

/** Cor principal de anotação livre (área, seta, desenho, texto). */
export const DEFAULT_ANNOTATION_COLOR = '#B43A2C'

/** Paleta de anotação — curta e previsível (5 cores, princípio 11.3). */
export const ANNOTATION_PALETTE = [
  '#B43A2C', // vermelho editorial (principal)
  '#1F6FEB', // azul
  '#2F9E44', // verde
  '#F08C00', // âmbar
  '#111111', // quase-preto
] as const

/** Espessura de traço padrão (unidade relativa, resolvida na renderização). */
export const DEFAULT_STROKE_WIDTH = 3

/** Opacidade padrão de preenchimento/área. */
export const DEFAULT_OPACITY = 1

/**
 * Dois tamanhos de texto no canvas (decisão do Apêndice C): pequeno e grande,
 * em pixels de imagem a 100%. Editáveis no painel de propriedades.
 */
export const TEXT_SIZES = { small: 16, large: 28 } as const

/** Tamanho de texto padrão no canvas (o menor). */
export const DEFAULT_FONT_SIZE = TEXT_SIZES.small

/** Símbolo do marcador sem categoria (aparência neutra). */
export const DEFAULT_MARKER_SYMBOL: MarkerSymbol = 'circle'

/** Cor do marcador sem categoria (neutra; as categorias trazem cor própria). */
export const DEFAULT_MARKER_COLOR = '#111111'

/**
 * Aparência do marcador por categoria (seção 10.3 + decisão do Apêndice C):
 * a categoria do comentário define símbolo e cor. Cores vêm da paleta curta.
 */
export const CATEGORY_APPEARANCE: Record<
  CommentCategory,
  { symbol: MarkerSymbol; color: string }
> = {
  observacao: { symbol: 'circle', color: '#1F6FEB' }, // azul — informativo
  problema: { symbol: 'triangle', color: '#B43A2C' }, // vermelho — corrigir
  duvida: { symbol: 'diamond', color: '#F08C00' }, // âmbar — confirmar
  sugestao: { symbol: 'square', color: '#2F9E44' }, // verde — melhoria
}

/**
 * Limite mínimo de ações no histórico (RF-051). O histórico pode descartar
 * as ações mais antigas ao ultrapassar esse teto.
 */
export const HISTORY_LIMIT = 50

/**
 * Limites técnicos iniciais de imagem (seção 15.1). Pontos de partida,
 * ajustáveis após testes de memória.
 */
export const MAX_IMAGE_DIMENSION = 12_000
export const MAX_IMAGE_BYTES = 25 * 1024 * 1024
