/**
 * Barra vertical de ferramentas (Apêndice B: ToolRail; seção 6.3). Cada
 * ferramenta é um botão com ícone; o nome acessível vem do `aria-label` e o
 * atalho aparece no `title` (o ícone é decorativo).
 */

import type { ComponentType } from 'react'
import type { ToolId } from '../../domain/types'
import {
  IconArea,
  IconArrow,
  IconDraw,
  IconMarker,
  IconPan,
  IconSelect,
  IconText,
} from '../../ui/icons'
import { TOOLS } from './tools'
import './ToolRail.css'

const TOOL_ICONS: Record<ToolId, ComponentType<{ size?: number }>> = {
  select: IconSelect,
  marker: IconMarker,
  area: IconArea,
  arrow: IconArrow,
  draw: IconDraw,
  text: IconText,
  pan: IconPan,
}

interface ToolRailProps {
  activeTool: ToolId
  onSelect(tool: ToolId): void
}

export function ToolRail({ activeTool, onSelect }: ToolRailProps) {
  return (
    <nav className="tool-rail" aria-label="Ferramentas">
      {TOOLS.map((tool) => {
        const Icon = TOOL_ICONS[tool.id]
        return (
          <button
            key={tool.id}
            type="button"
            className="tool-rail__button"
            aria-pressed={activeTool === tool.id}
            aria-label={tool.label}
            title={`${tool.label} (${tool.shortcut})`}
            onClick={() => onSelect(tool.id)}
          >
            <Icon size={22} />
          </button>
        )
      })}
    </nav>
  )
}
