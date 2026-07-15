import { beforeEach, describe, expect, it } from 'vitest'
import {
  createArea,
  createMarkerWithComment,
  createProject,
  createText,
} from '../../domain/factories'
import { markerNumber } from '../../domain/numbering'
import type { ImageAsset, Project } from '../../domain/types'
import { ProjectHistory } from './command'
import {
  AddAnnotationCommand,
  AddMarkerCommand,
  RemoveMarkerCommand,
  ReorderCommentsCommand,
  ReplaceAnnotationCommand,
  UpdateCommentCommand,
} from './commands'

const image: ImageAsset = {
  mimeType: 'image/png',
  width: 1000,
  height: 1000,
  originalName: 'x.png',
  source: 'blob:local',
}

let project: Project

beforeEach(() => {
  project = createProject(image, { id: 'p1', now: 'T' })
})

describe('ProjectHistory', () => {
  it('começa sem poder desfazer nem refazer', () => {
    const history = new ProjectHistory(project)
    expect(history.canUndo).toBe(false)
    expect(history.canRedo).toBe(false)
  })

  it('desfaz e refaz a criação de anotação livre (RF-050)', () => {
    const history = new ProjectHistory(project)
    const area = createArea(
      { x: 0.1, y: 0.1, width: 0.2, height: 0.2 },
      { id: 'a1' },
    )

    history.execute(new AddAnnotationCommand(area))
    expect(history.state.annotations).toHaveLength(1)
    expect(history.canUndo).toBe(true)

    history.undo()
    expect(history.state.annotations).toHaveLength(0)
    expect(history.canRedo).toBe(true)

    history.redo()
    expect(history.state.annotations).toHaveLength(1)
    expect(history.state.annotations[0]?.id).toBe('a1')
  })

  it('executar limpa a pilha de refazer', () => {
    const history = new ProjectHistory(project)
    history.execute(
      new AddAnnotationCommand(
        createArea({ x: 0, y: 0, width: 0.1, height: 0.1 }, { id: 'a1' }),
      ),
    )
    history.undo()
    expect(history.canRedo).toBe(true)

    history.execute(
      new AddAnnotationCommand(
        createText({ x: 0.5, y: 0.5 }, 'oi', { id: 't1' }),
      ),
    )
    expect(history.canRedo).toBe(false)
  })

  it('respeita o limite descartando a ação mais antiga', () => {
    const history = new ProjectHistory(project, 2)
    for (const id of ['a', 'b', 'c']) {
      history.execute(
        new AddAnnotationCommand(
          createArea({ x: 0, y: 0, width: 0.1, height: 0.1 }, { id }),
        ),
      )
    }
    // Só as 2 últimas ações podem ser desfeitas; 'a' permanece.
    history.undo()
    history.undo()
    expect(history.canUndo).toBe(false)
    expect(history.state.annotations.map((a) => a.id)).toEqual(['a'])
  })
})

describe('marcador + comentário', () => {
  it('cria e desfaz marcador com comentário juntos (CA-03)', () => {
    const history = new ProjectHistory(project)
    const { annotation, comment } = createMarkerWithComment(
      { x: 0.5, y: 0.5 },
      { id: 'm1', order: 1 },
    )

    history.execute(new AddMarkerCommand(annotation, comment))
    expect(history.state.annotations).toHaveLength(1)
    expect(history.state.comments).toHaveLength(1)
    expect(markerNumber(annotation, history.state.comments)).toBe(1)

    history.undo()
    expect(history.state.annotations).toHaveLength(0)
    expect(history.state.comments).toHaveLength(0)
  })

  it('exclui marcador e comentário em conjunto e desfaz (RF-047)', () => {
    const { annotation, comment } = createMarkerWithComment(
      { x: 0.5, y: 0.5 },
      { id: 'm1', order: 1 },
    )
    const history = new ProjectHistory(project)
    history.execute(new AddMarkerCommand(annotation, comment))

    history.execute(new RemoveMarkerCommand('m1'))
    expect(history.state.annotations).toHaveLength(0)
    expect(history.state.comments).toHaveLength(0)

    history.undo()
    expect(history.state.annotations).toHaveLength(1)
    expect(history.state.comments).toHaveLength(1)
  })
})

describe('reordenar comentários', () => {
  it('renumera marcadores e desfaz mantendo textos (CA-07)', () => {
    const history = new ProjectHistory(project)
    const first = createMarkerWithComment(
      { x: 0.1, y: 0.1 },
      { id: 'm1', order: 1 },
    )
    const second = createMarkerWithComment(
      { x: 0.2, y: 0.2 },
      { id: 'm2', order: 2 },
    )
    first.comment.title = 'Primeiro'
    second.comment.title = 'Segundo'
    history.execute(new AddMarkerCommand(first.annotation, first.comment))
    history.execute(new AddMarkerCommand(second.annotation, second.comment))

    history.execute(
      new ReorderCommentsCommand([second.comment.id, first.comment.id]),
    )
    expect(markerNumber(second.annotation, history.state.comments)).toBe(1)
    expect(markerNumber(first.annotation, history.state.comments)).toBe(2)

    history.undo()
    expect(markerNumber(first.annotation, history.state.comments)).toBe(1)
    expect(markerNumber(second.annotation, history.state.comments)).toBe(2)
    // Textos preservados.
    const titles = history.state.comments.map((c) => c.title).sort()
    expect(titles).toEqual(['Primeiro', 'Segundo'])
  })
})

describe('editar anotação e comentário', () => {
  it('substitui anotação e reverte ao estado anterior', () => {
    const history = new ProjectHistory(project)
    const area = createArea(
      { x: 0.1, y: 0.1, width: 0.2, height: 0.2 },
      { id: 'a1', now: 'T' },
    )
    history.execute(new AddAnnotationCommand(area))

    const moved = {
      ...area,
      geometry: { rect: { x: 0.5, y: 0.5, width: 0.2, height: 0.2 } },
    }
    history.execute(new ReplaceAnnotationCommand(moved, 'Mover área'))
    const current = history.state.annotations[0]
    expect(current?.type === 'area' && current.geometry.rect.x).toBe(0.5)

    history.undo()
    const reverted = history.state.annotations[0]
    expect(reverted?.type === 'area' && reverted.geometry.rect.x).toBe(0.1)
  })

  it('edita comentário reversívelmente', () => {
    const { annotation, comment } = createMarkerWithComment(
      { x: 0.5, y: 0.5 },
      { id: 'm1', order: 1 },
    )
    const history = new ProjectHistory(project)
    history.execute(new AddMarkerCommand(annotation, comment))

    history.execute(
      new UpdateCommentCommand({
        ...comment,
        title: 'Ação principal',
        category: 'problema',
      }),
    )
    expect(history.state.comments[0]?.title).toBe('Ação principal')
    expect(history.state.comments[0]?.category).toBe('problema')

    history.undo()
    expect(history.state.comments[0]?.title).toBe('')
    expect(history.state.comments[0]?.category).toBeUndefined()
  })
})
