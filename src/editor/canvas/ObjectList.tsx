/**
 * Lista de objetos navegável (seção 12.2): representação textual de cada
 * anotação — tipo, número e posição aproximada — com seleção sincronizada ao
 * canvas (A11Y-003). Dá a usuários de teclado e leitor de tela uma forma de
 * alcançar e selecionar objetos sem depender do ponteiro.
 */

import { useMemo } from 'react'
import { describeAnnotation } from '../../domain/describe'
import type { Annotation, Comment } from '../../domain/types'
import './ObjectList.css'

interface ObjectListProps {
  annotations: readonly Annotation[]
  comments: readonly Comment[]
  selectedId: string | null
  onSelect(id: string): void
}

export function ObjectList({
  annotations,
  comments,
  selectedId,
  onSelect,
}: ObjectListProps) {
  // Ordem de empilhamento (mesma leitura visual do canvas).
  const ordered = useMemo(
    () => [...annotations].sort((a, b) => a.zIndex - b.zIndex),
    [annotations],
  )

  return (
    <section className="object-list" aria-label="Objetos">
      <h2 className="object-list__title">Objetos</h2>

      {ordered.length === 0 ? (
        <p className="object-list__empty">
          Nenhum objeto ainda. Use as ferramentas para anotar a imagem.
        </p>
      ) : (
        <ul className="object-list__items">
          {ordered.map((annotation) => {
            const active = annotation.id === selectedId
            return (
              <li key={annotation.id}>
                <button
                  type="button"
                  className={`object-list__item${
                    active ? ' object-list__item--active' : ''
                  }`}
                  aria-pressed={active}
                  onClick={() => onSelect(annotation.id)}
                >
                  {describeAnnotation(annotation, comments)}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
