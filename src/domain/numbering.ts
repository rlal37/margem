/**
 * Numeração de comentários e marcadores (RF-021, RF-043).
 *
 * `order` dos comentários é contíguo (1..n) e define a numeração exibida do
 * marcador vinculado. Reordenar comentários renumera os marcadores
 * correspondentes sem alterar seus textos (RF-043, CA-07).
 */

import type { Annotation, Comment } from './types'

/** Retorna os comentários ordenados por `order` (estável). */
export function sortedComments(comments: readonly Comment[]): Comment[] {
  return [...comments].sort((a, b) => a.order - b.order)
}

/**
 * Reatribui `order` de forma contígua (1..n) seguindo a ordem atual dos
 * comentários. Não muda títulos, corpos nem vínculos.
 */
export function renumberComments(comments: readonly Comment[]): Comment[] {
  return sortedComments(comments).map((comment, index) => ({
    ...comment,
    order: index + 1,
  }))
}

/**
 * Aplica uma nova ordem explícita (lista de ids de comentário) e renumera.
 * Ids ausentes na lista são anexados ao final, preservando sua ordem
 * relativa atual — evita perder comentários por uma lista incompleta.
 */
export function reorderComments(
  comments: readonly Comment[],
  orderedIds: readonly string[],
): Comment[] {
  const byId = new Map(comments.map((comment) => [comment.id, comment]))
  const result: Comment[] = []

  for (const id of orderedIds) {
    const comment = byId.get(id)
    if (comment) {
      result.push(comment)
      byId.delete(id)
    }
  }
  for (const comment of sortedComments([...byId.values()])) {
    result.push(comment)
  }

  return result.map((comment, index) => ({ ...comment, order: index + 1 }))
}

/**
 * Número exibido de um marcador: o `order` do comentário vinculado. Retorna
 * `undefined` para anotações sem comentário (anotações livres — RF-030).
 */
export function markerNumber(
  annotation: Annotation,
  comments: readonly Comment[],
): number | undefined {
  if (annotation.commentId === undefined) return undefined
  const comment = comments.find((c) => c.id === annotation.commentId)
  return comment?.order
}
