/**
 * Página Sobre (seção 6.1): objetivo, privacidade, tecnologias, limitações,
 * licença e repositório. É o único lugar onde atribuição pode aparecer — a
 * saída exportada permanece neutra (RF-064). Acessível: role de diálogo,
 * focus-trap, Esc e retorno de foco.
 */

import { useEffect, useRef } from 'react'
import { useFocusTrap } from '../accessibility'
import './AboutDialog.css'

interface AboutDialogProps {
  open: boolean
  onClose(): void
}

const REPO_URL = 'https://github.com/rlal37/margem'

export function AboutDialog({ open, onClose }: AboutDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useFocusTrap({
    active: open,
    containerRef: dialogRef,
    initialFocusRef: closeRef,
  })

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
    <div className="about-dialog__backdrop">
      <div
        ref={dialogRef}
        className="about-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-dialog-title"
      >
        <div className="about-dialog__header">
          <h2 id="about-dialog-title">Sobre a Margem</h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        <section className="about-dialog__section">
          <h3>Objetivo</h3>
          <p>
            Um anotador visual rápido e local por padrão: traga uma imagem,
            marque o que importa, comente só quando precisar e exporte uma
            documentação neutra.
          </p>
        </section>

        <section className="about-dialog__section">
          <h3>Privacidade</h3>
          <p>
            A imagem e as anotações ficam neste navegador. Nada é enviado a um
            servidor e não há cadastro nem conta.
          </p>
        </section>

        <section className="about-dialog__section">
          <h3>Tecnologias</h3>
          <p>
            React, TypeScript e Vite; anotações em SVG; armazenamento local no
            navegador. Publicado como site estático.
          </p>
        </section>

        <section className="about-dialog__section">
          <h3>Limitações do MVP</h3>
          <p>
            Uma imagem por projeto, sem colaboração, contas ou recursos de IA.
            Essas direções ficam para depois.
          </p>
        </section>

        <section className="about-dialog__section">
          <h3>Licença e código</h3>
          <p>
            Projeto de código aberto da Oficina Digital, sob licença MIT.{' '}
            <a href={REPO_URL} target="_blank" rel="noreferrer noopener">
              Ver o repositório
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  )
}
