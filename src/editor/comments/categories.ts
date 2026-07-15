/** Rótulos das categorias de comentário (seção 10.3, RF-042). */

import type { CommentCategory } from '../../domain/types'

export const CATEGORY_LABELS: Record<CommentCategory, string> = {
  observacao: 'Observação',
  problema: 'Problema',
  duvida: 'Dúvida',
  sugestao: 'Sugestão',
}

export const CATEGORY_ORDER: readonly CommentCategory[] = [
  'observacao',
  'problema',
  'duvida',
  'sugestao',
]
