/**
 * Painel lateral de comentários (Apêndice B: CommentsPanel; seção 6.2).
 * Lista os comentários em ordem de leitura, permite editar, reordenar
 * (renumerando os marcadores — RF-043) e excluir, e sincroniza a seleção
 * com o canvas (RF-044/RF-045).
 */

import { useMemo } from 'react'
import { sortedComments } from '../../domain/numbering'
import type { Comment } from '../../domain/types'
import { CommentCard } from './CommentCard'
import './CommentsPanel.css'

interface CommentsPanelProps {
  comments: readonly Comment[]
  /** Marcador selecionado no canvas (para destacar o comentário — RF-045). */
  activeMarkerId: string | null
  onUpdate(comment: Comment): void
  onReorder(orderedIds: string[]): void
  onDelete(comment: Comment): void
  onFocus(comment: Comment): void
}

export function CommentsPanel({
  comments,
  activeMarkerId,
  onUpdate,
  onReorder,
  onDelete,
  onFocus,
}: CommentsPanelProps) {
  const ordered = useMemo(() => sortedComments(comments), [comments])

  function move(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= ordered.length) return
    const ids = ordered.map((c) => c.id)
    const [id] = ids.splice(index, 1)
    if (id === undefined) return
    ids.splice(target, 0, id)
    onReorder(ids)
  }

  return (
    <aside className="comments-panel" aria-label="Comentários">
      <h2 className="comments-panel__title">Comentários</h2>

      {ordered.length === 0 ? (
        <p className="comments-panel__empty">
          Use o marcador numerado no canvas para criar um comentário. As demais
          anotações podem existir sem comentário — e não precisam ter.
        </p>
      ) : (
        <ol className="comments-panel__list">
          {ordered.map((comment, index) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              active={comment.markerAnnotationId === activeMarkerId}
              canMoveUp={index > 0}
              canMoveDown={index < ordered.length - 1}
              onUpdate={onUpdate}
              onMoveUp={() => move(index, -1)}
              onMoveDown={() => move(index, 1)}
              onDelete={() => onDelete(comment)}
              onFocus={() => onFocus(comment)}
            />
          ))}
        </ol>
      )}
    </aside>
  )
}
