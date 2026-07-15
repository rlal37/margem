/**
 * Focus-trap para diálogos modais (A11Y-002: foco não escapa para trás de um
 * modal). Enquanto `active`, o Tab circula entre os elementos focáveis do
 * contêiner; ao desativar, o foco volta para quem abriu o diálogo.
 *
 * O foco inicial vai para `initialFocusRef` quando informado; senão, para o
 * primeiro focável (ou o próprio contêiner, que deve ter `tabIndex={-1}`).
 */

import { useEffect, type RefObject } from 'react'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function focusableWithin(container: HTMLElement): HTMLElement[] {
  // O seletor já exclui desabilitados e tabindex=-1. Não filtramos por
  // layout (offsetParent) porque diálogos abertos estão visíveis e isso
  // manteria o comportamento consistente também em ambiente de teste (jsdom).
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter((el) => !el.hasAttribute('hidden'))
}

interface FocusTrapOptions {
  active: boolean
  containerRef: RefObject<HTMLElement | null>
  initialFocusRef?: RefObject<HTMLElement | null>
}

export function useFocusTrap({
  active,
  containerRef,
  initialFocusRef,
}: FocusTrapOptions): void {
  useEffect(() => {
    if (!active) return
    const container = containerRef.current
    if (!container) return

    const previouslyFocused = document.activeElement as HTMLElement | null

    const initial =
      initialFocusRef?.current ?? focusableWithin(container)[0] ?? container
    initial.focus()

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Tab' || !container) return
      const focusables = focusableWithin(container)
      if (focusables.length === 0) {
        event.preventDefault()
        container.focus()
        return
      }
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const activeEl = document.activeElement

      if (!container.contains(activeEl)) {
        event.preventDefault()
        first.focus()
      } else if (event.shiftKey && activeEl === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && activeEl === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown, true)
    return () => {
      document.removeEventListener('keydown', onKeyDown, true)
      previouslyFocused?.focus?.()
    }
  }, [active, containerRef, initialFocusRef])
}
