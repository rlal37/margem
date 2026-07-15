/**
 * Região ao vivo visível apenas para leitores de tela (A11Y-010). Lê o
 * `Announcer` e alterna um espaço em branco pelo `nonce` para garantir que
 * mensagens repetidas também sejam anunciadas.
 */

import { useSyncExternalStore } from 'react'
import type { Announcer } from './announcer'

interface LiveRegionProps {
  announcer: Announcer
}

export function LiveRegion({ announcer }: LiveRegionProps) {
  const { message, nonce } = useSyncExternalStore(
    announcer.subscribe,
    announcer.getSnapshot,
  )
  const text = message ? message + (nonce % 2 === 0 ? '' : ' ') : ''
  return (
    <div
      className="visually-hidden"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {text}
    </div>
  )
}
