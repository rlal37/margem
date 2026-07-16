/**
 * Barra vertical de ferramentas (Apêndice B: ToolRail; seção 6.3). Cada
 * ferramenta é um botão com ícone e rótulo; o `title` traz um resumo do que a
 * ferramenta faz e o atalho (o ícone é decorativo, o nome acessível vem do
 * texto).
 */

import { useEffect, useState, type ComponentType } from 'react'
import type { ToolId } from '../../domain/types'
import {
  IconArea,
  IconArrow,
  IconChevronLeft,
  IconDraw,
  IconMarker,
  IconPan,
  IconSelect,
  IconText,
} from '../../ui/icons'
import { TOOLS } from './tools'
import './ToolRail.css'

const COLLAPSE_KEY = 'margem:toolrail-collapsed'

const TOOL_ICONS: Record<ToolId, ComponentType<{ size?: number }>> = {
  select: IconSelect,
  marker: IconMarker,
  area: IconArea,
  arrow: IconArrow,
  draw: IconDraw,
  text: IconText,
  pan: IconPan,
}

/** Resumo do que cada ferramenta faz (usado no tooltip). */
const TOOL_DESCRIPTIONS: Record<ToolId, string> = {
  select: 'Selecionar, mover e editar objetos',
  marker: 'Ponto numerado — cria um comentário vinculado',
  area: 'Destacar uma região retangular',
  arrow: 'Desenhar uma seta para apontar algo',
  draw: 'Desenhar à mão livre',
  text: 'Escrever um texto sobre a imagem',
  pan: 'Arrastar para mover a área de trabalho',
}

interface ToolRailProps {
  activeTool: ToolId
  onSelect(tool: ToolId): void
}

export function ToolRail({ activeTool, onSelect }: ToolRailProps) {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(COLLAPSE_KEY) === '1'
    } catch {
      return false
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSE_KEY, collapsed ? '1' : '0')
    } catch {
      /* preferência não essencial */
    }
  }, [collapsed])

  return (
    <nav
      className={`tool-rail${collapsed ? ' tool-rail--collapsed' : ''}`}
      aria-label="Ferramentas"
    >
      <button
        type="button"
        className="tool-rail__toggle"
        aria-expanded={!collapsed}
        aria-label={
          collapsed
            ? 'Expandir barra de ferramentas'
            : 'Recolher barra de ferramentas'
        }
        title={collapsed ? 'Expandir' : 'Recolher'}
        onClick={() => setCollapsed((c) => !c)}
      >
        <IconChevronLeft size={18} />
      </button>

      {TOOLS.map((tool) => {
        const Icon = TOOL_ICONS[tool.id]
        return (
          <button
            key={tool.id}
            type="button"
            className="tool-rail__button"
            aria-pressed={activeTool === tool.id}
            aria-label={tool.label}
            title={`${TOOL_DESCRIPTIONS[tool.id]} (${tool.shortcut})`}
            onClick={() => onSelect(tool.id)}
          >
            <Icon size={20} />
            <span className="tool-rail__label">{tool.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
