/**
 * Resolução pura de atalhos de teclado (Apêndice A). Separa "qual tecla" de
 * "o que fazer", ficando testável sem DOM.
 *
 * Regras (seção 12.3): atalhos de uma letra só valem fora de campos de texto;
 * reconhecer Ctrl (Windows/Linux) e Cmd (macOS). Combinações de Ctrl/Cmd não
 * reservadas (copiar, colar, etc.) são ignoradas para não atrapalhar o
 * navegador.
 */

import { TOOLS } from '../editor/tools/tools'
import type { ToolId } from '../domain/types'

export type ShortcutAction =
  | { kind: 'tool'; tool: ToolId }
  | { kind: 'undo' }
  | { kind: 'redo' }
  | { kind: 'delete' }
  | { kind: 'duplicate' }
  | { kind: 'export' }
  | { kind: 'zoomIn' }
  | { kind: 'zoomOut' }
  | { kind: 'fit' }
  | { kind: 'actual' }
  | { kind: 'escape' }
  | { kind: 'help' }

export interface KeyChord {
  key: string
  ctrlKey: boolean
  metaKey: boolean
  shiftKey: boolean
}

const TOOL_BY_KEY: Record<string, ToolId> = Object.fromEntries(
  TOOLS.map((tool) => [tool.shortcut.toLowerCase(), tool.id]),
)

/** Traduz um evento de tecla em uma ação, ou `null` se não houver atalho. */
export function matchShortcut(event: KeyChord): ShortcutAction | null {
  const mod = event.ctrlKey || event.metaKey
  const lower = event.key.toLowerCase()

  if (mod) {
    if (lower === 'z')
      return event.shiftKey ? { kind: 'redo' } : { kind: 'undo' }
    if (lower === 'y') return { kind: 'redo' }
    if (lower === 'd') return { kind: 'duplicate' }
    if (lower === 'e') return { kind: 'export' }
    return null
  }

  switch (event.key) {
    case 'Escape':
      return { kind: 'escape' }
    case 'Delete':
    case 'Backspace':
      return { kind: 'delete' }
    case '?':
      return { kind: 'help' }
    case '+':
    case '=':
      return { kind: 'zoomIn' }
    case '-':
    case '_':
      return { kind: 'zoomOut' }
    case '0':
      return { kind: 'fit' }
    case '1':
      return { kind: 'actual' }
    default:
      break
  }

  const tool = TOOL_BY_KEY[lower]
  return tool ? { kind: 'tool', tool } : null
}

/** Verdadeiro quando o foco está em um campo editável (não aplicar atalhos). */
export function isEditingText(): boolean {
  const el = document.activeElement
  return (
    el instanceof HTMLInputElement ||
    el instanceof HTMLTextAreaElement ||
    el instanceof HTMLSelectElement ||
    (el instanceof HTMLElement && el.isContentEditable)
  )
}
