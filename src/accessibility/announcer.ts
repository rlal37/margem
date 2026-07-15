/**
 * Anunciador para regiões ao vivo (A11Y-010): centraliza mensagens de status
 * que um leitor de tela deve ouvir sem que o foco mude. Segue o mesmo padrão
 * observável do `EditorStore` (assinatura + `useSyncExternalStore`), ficando
 * testável sem DOM.
 *
 * O `nonce` cresce a cada anúncio para forçar a re-leitura mesmo quando a
 * mensagem se repete (ex.: desfazer duas vezes).
 */

export interface Announcement {
  message: string
  nonce: number
}

/** Mensagens padronizadas — fonte única para teclado e barra de ações. */
export const ANNOUNCE = {
  undo: 'Ação desfeita',
  redo: 'Ação refeita',
  delete: 'Objeto excluído',
  duplicate: 'Objeto duplicado',
} as const

export class Announcer {
  private listeners = new Set<() => void>()
  private snapshot: Announcement = { message: '', nonce: 0 }

  readonly subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  readonly getSnapshot = (): Announcement => this.snapshot

  readonly announce = (message: string): void => {
    this.snapshot = { message, nonce: this.snapshot.nonce + 1 }
    for (const listener of this.listeners) listener()
  }
}
