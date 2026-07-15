/**
 * Instala os atalhos de teclado globais do editor, aplicando as ações
 * resolvidas por `matchShortcut`. Ignora eventos enquanto o foco está em um
 * campo de texto (seção 12.3, CA-14).
 */

import { useEffect, type RefObject } from 'react'
import type { EditorStore } from '../app/editorStore'
import type { CanvasViewportHandle } from '../editor/canvas'
import { ANNOUNCE } from './announcer'
import { isEditingText, matchShortcut } from './shortcuts'

interface KeyboardShortcutsOptions {
  store: EditorStore
  canvas: RefObject<CanvasViewportHandle | null>
  /** Cancela um gesto/edição em andamento; retorna se havia algo a cancelar. */
  cancelGesture(): boolean
  onToggleHelp(): void
  onExport(): void
  /** Anuncia o resultado da ação em região ao vivo (A11Y-010). */
  announce?(message: string): void
}

export function useKeyboardShortcuts({
  store,
  canvas,
  cancelGesture,
  onToggleHelp,
  onExport,
  announce,
}: KeyboardShortcutsOptions): void {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (isEditingText()) return
      const action = matchShortcut(event)
      if (!action) return

      switch (action.kind) {
        case 'tool':
          event.preventDefault()
          store.setTool(action.tool)
          break
        case 'undo':
          event.preventDefault()
          store.undo()
          announce?.(ANNOUNCE.undo)
          break
        case 'redo':
          event.preventDefault()
          store.redo()
          announce?.(ANNOUNCE.redo)
          break
        case 'delete':
          event.preventDefault()
          if (store.getSnapshot().selectedId !== null) {
            store.deleteSelected()
            announce?.(ANNOUNCE.delete)
          }
          break
        case 'duplicate':
          event.preventDefault()
          if (store.getSnapshot().selectedId !== null) {
            store.duplicateSelected()
            announce?.(ANNOUNCE.duplicate)
          }
          break
        case 'export':
          event.preventDefault()
          onExport()
          break
        case 'zoomIn':
          event.preventDefault()
          canvas.current?.zoomIn()
          break
        case 'zoomOut':
          event.preventDefault()
          canvas.current?.zoomOut()
          break
        case 'fit':
          event.preventDefault()
          canvas.current?.fit()
          break
        case 'actual':
          event.preventDefault()
          canvas.current?.actual()
          break
        case 'escape':
          // Esc cancela a criação em andamento; um novo Esc remove a seleção
          // (seção 9.1).
          if (!cancelGesture()) store.select(null)
          break
        case 'help':
          event.preventDefault()
          onToggleHelp()
          break
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [store, canvas, cancelGesture, onToggleHelp, onExport, announce])
}
