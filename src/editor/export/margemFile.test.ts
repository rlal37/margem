import { describe, expect, it } from 'vitest'
import { createArea, createProject } from '../../domain/factories'
import type { ImageAsset, Project } from '../../domain/types'
import {
  buildMargemJson,
  exportMargem,
  importMargem,
  parseMargemJson,
} from './margemFile'

// jsdom não implementa createObjectURL.
;(URL as unknown as { createObjectURL: (b: Blob) => string }).createObjectURL =
  () => 'blob:imported'

const image: ImageAsset = {
  mimeType: 'image/png',
  width: 800,
  height: 600,
  originalName: 'captura.png',
  source: 'blob:live',
}

function project(): Project {
  return {
    ...createProject(image, { id: 'p1', now: 'T' }),
    annotations: [
      createArea({ x: 0.1, y: 0.1, width: 0.2, height: 0.2 }, { id: 'a1' }),
    ],
  }
}

describe('buildMargemJson / parseMargemJson', () => {
  it('faz roundtrip preservando projeto e imagem', () => {
    const json = buildMargemJson(project(), {
      mimeType: 'image/png',
      base64: 'QUJD',
    })
    const parsed = parseMargemJson(json)
    expect(parsed.ok).toBe(true)
    if (parsed.ok) {
      expect(parsed.project.annotations).toHaveLength(1)
      expect(parsed.image.base64).toBe('QUJD')
      // Object URL efêmero não é persistido.
      expect(parsed.project.image.source).toBe('')
    }
  })

  it('rejeita arquivo que não é da Margem', () => {
    expect(parseMargemJson('{"foo":1}').ok).toBe(false)
    expect(parseMargemJson('não é json').ok).toBe(false)
  })

  it('rejeita schema incompatível', () => {
    const json = buildMargemJson(project(), {
      mimeType: 'image/png',
      base64: 'QUJD',
    })
    const broken = json.replaceAll('"1.0"', '"9.9"')
    expect(parseMargemJson(broken).ok).toBe(false)
  })
})

describe('exportMargem / importMargem', () => {
  it('exporta e reimporta restaurando imagem e anotações (RF-007/RF-063)', async () => {
    const blob = new Blob([new Uint8Array([65, 66, 67, 68])], {
      type: 'image/png',
    })
    const file = await exportMargem(project(), blob)
    const imported = await importMargem(
      new File([file], 'projeto.margem', { type: 'application/json' }),
    )
    expect(imported.ok).toBe(true)
    if (imported.ok) {
      expect(imported.project.annotations).toHaveLength(1)
      expect(imported.imageBlob.size).toBe(4)
      expect(imported.project.image.source).toBe('blob:imported')
    }
  })
})
