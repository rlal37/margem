import { describe, expect, it } from 'vitest'
import {
  createArea,
  createArrow,
  createDraw,
  createMarker,
  createMarkerWithComment,
  createProject,
  createText,
} from './factories'
import { parseProject } from './validation'
import type { ImageAsset } from './types'

const image: ImageAsset = {
  mimeType: 'image/png',
  width: 1440,
  height: 900,
  originalName: 'captura.png',
  source: 'blob:local',
}

describe('fatorias de anotação', () => {
  it('cria marcador livre por padrão (sem comentário)', () => {
    const marker = createMarker({ x: 0.5, y: 0.5 }, { now: 'T', id: 'm1' })
    expect(marker).toMatchObject({
      id: 'm1',
      type: 'marker',
      geometry: { point: { x: 0.5, y: 0.5 } },
      createdAt: 'T',
      updatedAt: 'T',
    })
    expect(marker.commentId).toBeUndefined()
  })

  it('cria área, seta, desenho e texto com o tipo correto', () => {
    expect(createArea({ x: 0, y: 0, width: 0.3, height: 0.2 }).type).toBe(
      'area',
    )
    expect(createArrow({ x: 0, y: 0 }, { x: 1, y: 1 }).type).toBe('arrow')
    expect(createDraw([{ x: 0, y: 0 }]).type).toBe('draw')
    expect(createText({ x: 0.1, y: 0.1 }, 'oi').type).toBe('text')
  })
})

describe('createMarkerWithComment', () => {
  it('vincula marcador e comentário nos dois sentidos (RF-040)', () => {
    const { annotation, comment } = createMarkerWithComment(
      { x: 0.4, y: 0.3 },
      { id: 'm1', order: 1 },
    )
    expect(annotation.commentId).toBe(comment.id)
    expect(comment.markerAnnotationId).toBe(annotation.id)
    expect(comment.order).toBe(1)
  })
})

describe('createProject', () => {
  it('cria projeto vazio válido com schema atual', () => {
    const project = createProject(image, { id: 'p1', now: 'T' })
    expect(project.schemaVersion).toBe('1.0')
    expect(project.annotations).toEqual([])
    expect(project.comments).toEqual([])
    expect(project.title).toBe('Projeto sem título')

    const parsed = parseProject(project)
    expect(parsed.ok).toBe(true)
  })
})
