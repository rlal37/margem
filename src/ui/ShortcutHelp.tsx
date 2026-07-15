/**
 * Ajuda rápida (Apêndice B: ShortcutHelp; RF-070): diálogo com os atalhos,
 * uma descrição das ferramentas e o princípio de privacidade (seção 6.1).
 * Acessibilidade completa (focus trap) é aprofundada no WP-09; aqui já há
 * role de diálogo, foco inicial, Esc e clique no fundo para fechar.
 */

import { useEffect, useRef } from 'react'
import './ShortcutHelp.css'

interface ShortcutHelpProps {
  open: boolean
  onClose(): void
}

interface Row {
  keys: string
  action: string
}

const GROUPS: { title: string; rows: Row[] }[] = [
  {
    title: 'Ferramentas',
    rows: [
      { keys: 'V', action: 'Selecionar' },
      { keys: 'M', action: 'Marcador' },
      { keys: 'R', action: 'Área' },
      { keys: 'A', action: 'Seta' },
      { keys: 'P', action: 'Desenho' },
      { keys: 'T', action: 'Texto' },
      { keys: 'H', action: 'Mover canvas' },
    ],
  },
  {
    title: 'Navegação',
    rows: [
      { keys: '+ / −', action: 'Aproximar / afastar zoom' },
      { keys: '0', action: 'Ajustar à tela' },
      { keys: '1', action: '100%' },
    ],
  },
  {
    title: 'Edição',
    rows: [
      { keys: 'Ctrl/Cmd + Z', action: 'Desfazer' },
      { keys: 'Ctrl/Cmd + Shift + Z', action: 'Refazer' },
      { keys: 'Ctrl/Cmd + D', action: 'Duplicar' },
      { keys: 'Delete', action: 'Excluir seleção' },
      { keys: 'Esc', action: 'Cancelar criação / limpar seleção' },
    ],
  },
  {
    title: 'Ajuda',
    rows: [{ keys: '?', action: 'Abrir e fechar esta ajuda' }],
  },
]

export function ShortcutHelp({ open, onClose }: ShortcutHelpProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) dialogRef.current?.focus()
  }, [open])

  // Esc fecha o diálogo. Em captura, para evitar que o atalho global de Esc
  // (limpar seleção) também dispare enquanto a ajuda está aberta.
  useEffect(() => {
    if (!open) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onClose()
      }
    }
    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="shortcut-help__backdrop">
      <div
        ref={dialogRef}
        className="shortcut-help"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcut-help-title"
        tabIndex={-1}
      >
        <div className="shortcut-help__header">
          <h2 id="shortcut-help-title">Atalhos e ajuda</h2>
          <button type="button" onClick={onClose} aria-label="Fechar ajuda">
            ✕
          </button>
        </div>

        {GROUPS.map((group) => (
          <section key={group.title} className="shortcut-help__group">
            <h3>{group.title}</h3>
            <dl>
              {group.rows.map((row) => (
                <div key={row.action} className="shortcut-help__row">
                  <dt>
                    <kbd>{row.keys}</kbd>
                  </dt>
                  <dd>{row.action}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}

        <p className="shortcut-help__privacy">
          A imagem e as anotações ficam neste navegador. Nada é enviado para um
          servidor.
        </p>
      </div>
    </div>
  )
}
