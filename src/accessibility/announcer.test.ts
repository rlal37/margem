import { describe, expect, it } from 'vitest'
import { Announcer } from './announcer'

describe('Announcer', () => {
  it('notifica assinantes e expõe a última mensagem', () => {
    const announcer = new Announcer()
    let calls = 0
    const unsubscribe = announcer.subscribe(() => (calls += 1))

    announcer.announce('Ação desfeita')
    expect(announcer.getSnapshot().message).toBe('Ação desfeita')
    expect(calls).toBe(1)

    unsubscribe()
    announcer.announce('Ignorada')
    expect(calls).toBe(1)
  })

  it('incrementa o nonce a cada anúncio (força re-leitura de repetidos)', () => {
    const announcer = new Announcer()
    announcer.announce('Ação desfeita')
    const first = announcer.getSnapshot().nonce
    announcer.announce('Ação desfeita')
    expect(announcer.getSnapshot().nonce).toBe(first + 1)
  })
})
