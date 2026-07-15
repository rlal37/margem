/**
 * Barra vertical de ferramentas (Apêndice B: ToolRail; seção 6.3). Cada
 * ferramenta é um botão com nome acessível e atalho no title. Ícones
 * dedicados chegam no WP de identidade (WP-10); por ora usam a inicial.
 */

import type { ToolId } from '../../domain/types'
import { TOOLS } from './tools'
import './ToolRail.css'

interface ToolRailProps {
  activeTool: ToolId
  onSelect(tool: ToolId): void
}

export function ToolRail({ activeTool, onSelect }: ToolRailProps) {
  return (
    <nav className="tool-rail" aria-label="Ferramentas">
      {TOOLS.map((tool) => (
        <button
          key={tool.id}
          type="button"
          className="tool-rail__button"
          aria-pressed={activeTool === tool.id}
          aria-label={tool.label}
          title={`${tool.label} (${tool.shortcut})`}
          onClick={() => onSelect(tool.id)}
        >
          <span aria-hidden="true">{tool.shortcut}</span>
        </button>
      ))}
    </nav>
  )
}
