/**
 * Store central do editor (seção 14.1: "store pequena com histórico de
 * comandos"). Mantém uma única fonte de verdade — projeto, ferramenta ativa
 * e seleção — e notifica assinantes via `useSyncExternalStore`.
 *
 * As edições de anotação/comentário passam sempre por comandos reversíveis
 * (RF-050). Navegação (viewport) e seleção não entram no histórico.
 */

import { ProjectHistory } from '../editor/history/command'
import {
  AddAnnotationCommand,
  AddMarkerCommand,
  RemoveAnnotationCommand,
  RemoveMarkerCommand,
  ReorderCommentsCommand,
  ReplaceAnnotationCommand,
  UpdateCommentCommand,
} from '../editor/history/commands'
import type { Command } from '../editor/history/command'
import { createMarkerWithComment } from '../domain/factories'
import { newId } from '../domain/ids'
import { moveAnnotation } from '../editor/tools/tools'
import type {
  Annotation,
  Comment,
  MarkerAnnotation,
  Project,
  ToolId,
  Viewport,
} from '../domain/types'

export interface EditorSnapshot {
  project: Project
  tool: ToolId
  selectedId: string | null
  canUndo: boolean
  canRedo: boolean
}

export class EditorStore {
  private history: ProjectHistory
  private tool: ToolId = 'select'
  private selectedId: string | null = null
  private listeners = new Set<() => void>()
  private snapshot: EditorSnapshot

  constructor(project: Project) {
    this.history = new ProjectHistory(project)
    this.snapshot = this.compute()
  }

  private compute(): EditorSnapshot {
    return {
      project: this.history.state,
      tool: this.tool,
      selectedId: this.selectedId,
      canUndo: this.history.canUndo,
      canRedo: this.history.canRedo,
    }
  }

  private emit(): void {
    this.snapshot = this.compute()
    for (const listener of this.listeners) listener()
  }

  readonly subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  readonly getSnapshot = (): EditorSnapshot => this.snapshot

  execute(command: Command): void {
    this.history.execute(command)
    this.emit()
  }

  undo(): void {
    this.history.undo()
    this.clampSelection()
    this.emit()
  }

  redo(): void {
    this.history.redo()
    this.clampSelection()
    this.emit()
  }

  setTool(tool: ToolId): void {
    if (this.tool === tool) return
    this.tool = tool
    this.emit()
  }

  select(id: string | null): void {
    if (this.selectedId === id) return
    this.selectedId = id
    this.emit()
  }

  /** Atualiza a navegação sem registrar no histórico (não é undoable). */
  setViewport(viewport: Viewport): void {
    this.history.replace({ ...this.history.state, viewport })
    this.emit()
  }

  /** Edita um comentário (título, descrição, categoria — RF-041, RF-042). */
  updateComment(next: Comment): void {
    this.history.execute(new UpdateCommentCommand(next))
    this.emit()
  }

  /**
   * Substitui uma anotação por uma versão editada (estilo, texto, posição
   * numérica — RF-027, RF-028, seção 12.2). Reversível. Ignora se o id sumiu.
   */
  updateAnnotation(next: Annotation, label?: string): void {
    if (!this.history.state.annotations.some((a) => a.id === next.id)) return
    this.history.execute(new ReplaceAnnotationCommand(next, label))
    this.emit()
  }

  /** Reordena comentários e renumera marcadores (RF-043). */
  reorderComments(orderedIds: readonly string[]): void {
    this.history.execute(new ReorderCommentsCommand(orderedIds))
    this.emit()
  }

  /**
   * Exclui uma anotação de forma reversível (RF-047 para marcador com
   * comentário; RF-050 para as demais). Limpa a seleção se era o objeto.
   */
  deleteAnnotation(id: string): void {
    const annotation = this.history.state.annotations.find((a) => a.id === id)
    if (!annotation) return
    const command: Command =
      annotation.commentId !== undefined
        ? new RemoveMarkerCommand(id)
        : new RemoveAnnotationCommand(id)
    this.history.execute(command)
    if (this.selectedId === id) this.selectedId = null
    this.emit()
  }

  deleteSelected(): void {
    if (this.selectedId !== null) this.deleteAnnotation(this.selectedId)
  }

  /**
   * Move a anotação selecionada por (dx, dy) normalizado — alternativa por
   * teclado ao arraste (seção 12.2, teclas de seta). Reversível como qualquer
   * movimentação. Ignora deslocamentos anulados pelo limite da imagem para não
   * poluir o histórico com passos sem efeito.
   */
  nudgeSelected(dx: number, dy: number): void {
    const id = this.selectedId
    if (id === null) return
    const source = this.history.state.annotations.find((a) => a.id === id)
    if (!source) return
    const moved = moveAnnotation(source, dx, dy)
    if (JSON.stringify(moved.geometry) === JSON.stringify(source.geometry)) {
      return
    }
    this.history.execute(new ReplaceAnnotationCommand(moved, 'Mover objeto'))
    this.emit()
  }

  /**
   * Duplica a anotação selecionada, deslocada, e seleciona a cópia (RF-029).
   * Duplicar um marcador cria também um novo comentário vinculado (RF-040).
   */
  duplicateSelected(): void {
    const id = this.selectedId
    if (id === null) return
    const project = this.history.state
    const source = project.annotations.find((a) => a.id === id)
    if (!source) return

    const offset = 0.02
    const nextZ =
      project.annotations.reduce((max, a) => Math.max(max, a.zIndex), 0) + 1

    if (source.type === 'marker') {
      const moved = moveAnnotation(source, offset, offset) as MarkerAnnotation
      const { annotation, comment } = createMarkerWithComment(
        moved.geometry.point,
        {
          color: source.style.color,
          symbol: source.style.symbol,
          order: project.comments.length + 1,
          zIndex: nextZ,
        },
      )
      this.history.execute(new AddMarkerCommand(annotation, comment))
      this.selectedId = annotation.id
    } else {
      const clone: Annotation = {
        ...moveAnnotation(source, offset, offset),
        id: newId(),
        zIndex: nextZ,
      }
      this.history.execute(new AddAnnotationCommand(clone))
      this.selectedId = clone.id
    }
    this.emit()
  }

  /** Limpa a seleção se o objeto não existe mais (após undo/redo). */
  private clampSelection(): void {
    if (
      this.selectedId !== null &&
      !this.history.state.annotations.some((a) => a.id === this.selectedId)
    ) {
      this.selectedId = null
    }
  }
}
