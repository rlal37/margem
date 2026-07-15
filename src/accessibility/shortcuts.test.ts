import { describe, expect, it } from 'vitest'
import { matchShortcut, type KeyChord } from './shortcuts'

function chord(partial: Partial<KeyChord> & { key: string }): KeyChord {
  return { ctrlKey: false, metaKey: false, shiftKey: false, ...partial }
}

describe('matchShortcut', () => {
  it('mapeia teclas de ferramenta (Apêndice A)', () => {
    expect(matchShortcut(chord({ key: 'v' }))).toEqual({
      kind: 'tool',
      tool: 'select',
    })
    expect(matchShortcut(chord({ key: 'm' }))).toEqual({
      kind: 'tool',
      tool: 'marker',
    })
    expect(matchShortcut(chord({ key: 'r' }))).toEqual({
      kind: 'tool',
      tool: 'area',
    })
    expect(matchShortcut(chord({ key: 'h' }))).toEqual({
      kind: 'tool',
      tool: 'pan',
    })
  })

  it('desfaz e refaz com Ctrl/Cmd', () => {
    expect(matchShortcut(chord({ key: 'z', ctrlKey: true }))).toEqual({
      kind: 'undo',
    })
    expect(
      matchShortcut(chord({ key: 'z', metaKey: true, shiftKey: true })),
    ).toEqual({
      kind: 'redo',
    })
    expect(matchShortcut(chord({ key: 'y', ctrlKey: true }))).toEqual({
      kind: 'redo',
    })
  })

  it('duplica com Ctrl/Cmd+D', () => {
    expect(matchShortcut(chord({ key: 'd', ctrlKey: true }))).toEqual({
      kind: 'duplicate',
    })
  })

  it('zoom, ajuste e 100%', () => {
    expect(matchShortcut(chord({ key: '+' }))).toEqual({ kind: 'zoomIn' })
    expect(matchShortcut(chord({ key: '-' }))).toEqual({ kind: 'zoomOut' })
    expect(matchShortcut(chord({ key: '0' }))).toEqual({ kind: 'fit' })
    expect(matchShortcut(chord({ key: '1' }))).toEqual({ kind: 'actual' })
  })

  it('escape, excluir e ajuda', () => {
    expect(matchShortcut(chord({ key: 'Escape' }))).toEqual({ kind: 'escape' })
    expect(matchShortcut(chord({ key: 'Delete' }))).toEqual({ kind: 'delete' })
    expect(matchShortcut(chord({ key: 'Backspace' }))).toEqual({
      kind: 'delete',
    })
    expect(matchShortcut(chord({ key: '?' }))).toEqual({ kind: 'help' })
  })

  it('ignora combinações de Ctrl não reservadas (não vira ferramenta)', () => {
    expect(matchShortcut(chord({ key: 'c', ctrlKey: true }))).toBeNull()
    expect(matchShortcut(chord({ key: 'a', ctrlKey: true }))).toBeNull()
  })

  it('não confunde tecla de ferramenta com combinação modificada', () => {
    // "a" sozinho é a ferramenta Seta; com Ctrl é ignorado (acima).
    expect(matchShortcut(chord({ key: 'a' }))).toEqual({
      kind: 'tool',
      tool: 'arrow',
    })
  })
})
