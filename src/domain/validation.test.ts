import { describe, expect, it } from 'vitest'
import { createProject } from './factories'
import { isSupportedSchemaVersion, parseProject } from './validation'
import type { ImageAsset } from './types'

const image: ImageAsset = {
  mimeType: 'image/png',
  width: 1440,
  height: 900,
  originalName: 'captura.png',
  source: 'blob:local',
}

describe('isSupportedSchemaVersion', () => {
  it('aceita a versão atual e rejeita outras', () => {
    expect(isSupportedSchemaVersion('1.0')).toBe(true)
    expect(isSupportedSchemaVersion('0.9')).toBe(false)
    expect(isSupportedSchemaVersion(undefined)).toBe(false)
  })
})

describe('parseProject', () => {
  it('aceita um projeto válido', () => {
    const result = parseProject(createProject(image, { id: 'p1' }))
    expect(result.ok).toBe(true)
  })

  it('rejeita versão de schema incompatível com mensagem acionável', () => {
    const result = parseProject({ ...createProject(image), schemaVersion: '9' })
    expect(result).toEqual({
      ok: false,
      error:
        'Não foi possível abrir este projeto. O arquivo pode estar incompleto ou ser de outra versão.',
    })
  })

  it('rejeita imagem-base inválida', () => {
    const project = createProject(image)
    const broken = { ...project, image: { ...project.image, width: 0 } }
    expect(parseProject(broken).ok).toBe(false)
  })

  it('rejeita anotação com tipo desconhecido', () => {
    const project = createProject(image)
    const broken = {
      ...project,
      annotations: [{ id: 'x', type: 'blob', geometry: {}, style: {} }],
    }
    expect(parseProject(broken).ok).toBe(false)
  })

  it('rejeita valores não-objeto', () => {
    expect(parseProject(null).ok).toBe(false)
    expect(parseProject('projeto').ok).toBe(false)
  })
})
