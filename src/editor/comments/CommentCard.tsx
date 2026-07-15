/**
 * Cartão de um comentário no painel. Título e descrição são editados
 * localmente e confirmados no blur — um comando de histórico por edição, não
 * por tecla (RF-041). Categoria é confirmada na hora (RF-042).
 */

import { useEffect, useRef, useState } from 'react'
import type { Comment, CommentCategory } from '../../domain/types'
import { CATEGORY_LABELS, CATEGORY_ORDER } from './categories'

interface CommentCardProps {
  comment: Comment
  active: boolean
  canMoveUp: boolean
  canMoveDown: boolean
  onUpdate(next: Comment): void
  onMoveUp(): void
  onMoveDown(): void
  onDelete(): void
  onFocus(): void
}

export function CommentCard({
  comment,
  active,
  canMoveUp,
  canMoveDown,
  onUpdate,
  onMoveUp,
  onMoveDown,
  onDelete,
  onFocus,
}: CommentCardProps) {
  const [title, setTitle] = useState(comment.title)
  const [body, setBody] = useState(comment.body)
  const cardRef = useRef<HTMLLIElement>(null)

  // Ressincroniza quando o valor confirmado muda por fora (ex.: desfazer).
  useEffect(() => setTitle(comment.title), [comment.title])
  useEffect(() => setBody(comment.body), [comment.body])

  // Rola até o cartão quando ele passa a ser o selecionado (RF-045).
  useEffect(() => {
    if (active) {
      cardRef.current?.scrollIntoView?.({ block: 'nearest' })
    }
  }, [active])

  function commit(nextTitle: string, nextBody: string) {
    if (nextTitle !== comment.title || nextBody !== comment.body) {
      onUpdate({ ...comment, title: nextTitle, body: nextBody })
    }
  }

  function changeCategory(value: string) {
    const category = value === '' ? undefined : (value as CommentCategory)
    onUpdate({ ...comment, category })
  }

  return (
    <li
      ref={cardRef}
      className={`comment-card${active ? ' comment-card--active' : ''}`}
      aria-current={active ? 'true' : undefined}
    >
      <div className="comment-card__head">
        <button
          type="button"
          className="comment-card__number"
          onClick={onFocus}
          aria-label={`Ir para o marcador ${comment.order}`}
        >
          {comment.order}
        </button>

        <label className="comment-card__category">
          <span className="visually-hidden">Categoria</span>
          <select
            value={comment.category ?? ''}
            onChange={(e) => changeCategory(e.target.value)}
          >
            <option value="">Sem categoria</option>
            {CATEGORY_ORDER.map((category) => (
              <option key={category} value={category}>
                {CATEGORY_LABELS[category]}
              </option>
            ))}
          </select>
        </label>

        <div className="comment-card__move">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={!canMoveUp}
            aria-label={`Mover comentário ${comment.order} para cima`}
          >
            ↑
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={!canMoveDown}
            aria-label={`Mover comentário ${comment.order} para baixo`}
          >
            ↓
          </button>
        </div>
      </div>

      <input
        className="comment-card__title"
        placeholder="Título"
        aria-label={`Título do comentário ${comment.order}`}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={() => commit(title, body)}
      />

      <textarea
        className="comment-card__body"
        placeholder="Descrição"
        aria-label={`Descrição do comentário ${comment.order}`}
        rows={2}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onBlur={() => commit(title, body)}
      />

      <button type="button" className="comment-card__delete" onClick={onDelete}>
        Excluir
      </button>
    </li>
  )
}
