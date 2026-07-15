/**
 * Constantes do domínio.
 *
 * NOTA: a quantidade final de cores da paleta é uma questão em aberto do MVP
 * (Apêndice C do documento de requisitos) e deve ser fechada por protótipo
 * antes do acabamento visual. Os valores abaixo são padrões provisórios,
 * concentrados aqui para trocar em um único lugar — não são decisão final.
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

/**
 * Cor principal de anotação. Provisória — usa o valor do exemplo de schema
 * do documento (seção 13.2).
 */
export const DEFAULT_ANNOTATION_COLOR = '#B43A2C'

/** Paleta provisória de anotação (curta e previsível — princípio 11.3). */
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

/** Tamanho de texto padrão no canvas. */
export const DEFAULT_FONT_SIZE = 16

/**
 * Símbolo padrão do marcador. Símbolos disponíveis espelham as categorias
 * de comentário (seção 10.3), mas símbolo e categoria são independentes.
 */
export const DEFAULT_MARKER_SYMBOL: MarkerSymbol = 'circle'

/** Mapa sugerido de símbolo por categoria (seção 10.3). */
export const CATEGORY_SYMBOL: Record<CommentCategory, MarkerSymbol> = {
  observacao: 'circle',
  problema: 'triangle',
  duvida: 'diamond',
  sugestao: 'square',
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
