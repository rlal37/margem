import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { createProject } from '../domain/factories'
import type { ImageAsset } from '../domain/types'
import { EditorStore } from './editorStore'
import { useAutosave } from './useAutosave'

const image: ImageAsset = {
  mimeType: 'image/png',
  width: 100,
  height: 80,
  originalName: 'x.png',
  source: 'blob:local',
}

function makeStore() {
  return new EditorStore(createProject(image, { id: 'p1', now: 'T' }))
}

describe('useAutosave', () => {
  it('inicia como salvo quando o armazenamento está ok', () => {
    const { result } = renderHook(() => useAutosave(makeStore()))
    expect(result.current).toBe('saved')
  })

  it('reporta erro quando o armazenamento está degradado (CA-15)', () => {
    // enabled=false: imagem não pôde ser guardada — sinaliza baixar cópia.
    const { result } = renderHook(() => useAutosave(makeStore(), false))
    expect(result.current).toBe('error')
  })
})
