import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { createArea, createProject } from '../domain/factories'
import type { ImageAsset, Project } from '../domain/types'
import {
  clearCurrentProject,
  hasCurrentProject,
  loadCurrentProject,
  saveImage,
  saveProjectData,
} from './projectStore'

// jsdom não implementa createObjectURL; devolvemos uma URL previsível.
;(URL as unknown as { createObjectURL: (b: Blob) => string }).createObjectURL =
  () => 'blob:recovered'

const image: ImageAsset = {
  mimeType: 'image/png',
  width: 800,
  height: 600,
  originalName: 'captura.png',
  source: 'blob:live',
}

function makeProject(): Project {
  const project = createProject(image, { id: 'p1', now: 'T' })
  return {
    ...project,
    annotations: [
      createArea({ x: 0.1, y: 0.1, width: 0.2, height: 0.2 }, { id: 'a1' }),
    ],
  }
}

const blob = new Blob([new Uint8Array([1, 2, 3])], { type: 'image/png' })

beforeEach(async () => {
  await clearCurrentProject()
})

describe('projectStore', () => {
  it('grava e recupera projeto e imagem, recriando o object URL', async () => {
    await saveImage(blob)
    await saveProjectData(makeProject())

    expect(await hasCurrentProject()).toBe(true)

    const loaded = await loadCurrentProject()
    expect(loaded).not.toBeNull()
    expect(loaded?.project.annotations).toHaveLength(1)
    expect(loaded?.project.title).toBe('Projeto sem título')
    // Object URL efêmero foi descartado e recriado a partir do Blob.
    expect(loaded?.project.image.source).toBe('blob:recovered')
  })

  it('persiste alterações do projeto (autosave)', async () => {
    await saveImage(blob)
    await saveProjectData(makeProject())

    const updated = { ...makeProject(), title: 'Revisão da home' }
    await saveProjectData(updated)

    const loaded = await loadCurrentProject()
    expect(loaded?.project.title).toBe('Revisão da home')
  })

  it('retorna null sem imagem gravada', async () => {
    await saveProjectData(makeProject())
    expect(await loadCurrentProject()).toBeNull()
  })

  it('limpa todos os dados locais (RF-055)', async () => {
    await saveImage(blob)
    await saveProjectData(makeProject())

    await clearCurrentProject()
    expect(await hasCurrentProject()).toBe(false)
    expect(await loadCurrentProject()).toBeNull()
  })
})
