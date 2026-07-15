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
  RemoveAnnotationCommand,
  RemoveMarkerCommand,
} from '../editor/history/commands'
import type { Command } from '../editor/history/command'
import type { Project, ToolId, Viewport } from '../domain/types'

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

  /**
   * Exclui a anotação selecionada de forma reversível (RF-047 para marcador
   * com comentário; RF-050 para as demais).
   */
  deleteSelected(): void {
    const id = this.selectedId
    if (id === null) return
    const annotation = this.history.state.annotations.find((a) => a.id === id)
    if (!annotation) return
    const command: Command =
      annotation.commentId !== undefined
        ? new RemoveMarkerCommand(id)
        : new RemoveAnnotationCommand(id)
    this.history.execute(command)
    this.selectedId = null
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
