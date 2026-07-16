import { describe, expect, it } from 'vitest'
import {
  createArea,
  createMarkerWithComment,
  createProject,
} from '../domain/factories'
import { markerNumber } from '../domain/numbering'
import type { ImageAsset } from '../domain/types'
import {
  AddAnnotationCommand,
  AddMarkerCommand,
} from '../editor/history/commands'
import { EditorStore } from './editorStore'

const image: ImageAsset = {
  mimeType: 'image/png',
  width: 1000,
  height: 800,
  originalName: 'x.png',
  source: 'blob:local',
}

function store() {
  return new EditorStore(createProject(image, { id: 'p1', now: 'T' }))
}

describe('EditorStore', () => {
  it('notifica assinantes e executa comandos undoáveis', () => {
    const s = store()
    let notified = 0
    s.subscribe(() => (notified += 1))

    s.execute(
      new AddAnnotationCommand(
        createArea({ x: 0, y: 0, width: 0.2, height: 0.2 }, { id: 'a1' }),
      ),
    )
    expect(s.getSnapshot().project.annotations).toHaveLength(1)
    expect(s.getSnapshot().canUndo).toBe(true)
    expect(notified).toBe(1)

    s.undo()
    expect(s.getSnapshot().project.annotations).toHaveLength(0)
    expect(s.getSnapshot().canRedo).toBe(true)
  })

  it('mantém ferramenta e seleção fora do histórico', () => {
    const s = store()
    s.setTool('marker')
    s.select('a1')
    expect(s.getSnapshot().tool).toBe('marker')
    expect(s.getSnapshot().selectedId).toBe('a1')
    expect(s.getSnapshot().canUndo).toBe(false)
  })

  it('define o nome do projeto sem entrar no histórico', () => {
    const s = store()
    s.setTitle('Revisão da home')
    expect(s.getSnapshot().project.title).toBe('Revisão da home')
    expect(s.getSnapshot().canUndo).toBe(false)
  })

  it('viewport não entra no histórico', () => {
    const s = store()
    s.setViewport({ zoom: 2, panX: 5, panY: 5, fitMode: 'actual' })
    expect(s.getSnapshot().project.viewport.zoom).toBe(2)
    expect(s.getSnapshot().canUndo).toBe(false)
  })

  it('exclui marcador com comentário e limpa seleção (RF-047)', () => {
    const s = store()
    const { annotation, comment } = createMarkerWithComment(
      { x: 0.5, y: 0.5 },
      { id: 'm1', order: 1 },
    )
    s.execute(new AddMarkerCommand(annotation, comment))
    s.select('m1')

    s.deleteSelected()
    expect(s.getSnapshot().project.annotations).toHaveLength(0)
    expect(s.getSnapshot().project.comments).toHaveLength(0)
    expect(s.getSnapshot().selectedId).toBeNull()

    s.undo()
    expect(s.getSnapshot().project.annotations).toHaveLength(1)
    expect(s.getSnapshot().project.comments).toHaveLength(1)
  })

  it('limpa seleção ao desfazer a criação do objeto selecionado', () => {
    const s = store()
    s.execute(
      new AddAnnotationCommand(
        createArea({ x: 0, y: 0, width: 0.2, height: 0.2 }, { id: 'a1' }),
      ),
    )
    s.select('a1')
    s.undo()
    expect(s.getSnapshot().selectedId).toBeNull()
  })

  it('edita comentário de forma reversível (RF-041/042)', () => {
    const s = store()
    const { annotation, comment } = createMarkerWithComment(
      { x: 0.5, y: 0.5 },
      { id: 'm1', order: 1 },
    )
    s.execute(new AddMarkerCommand(annotation, comment))

    s.updateComment({
      ...comment,
      title: 'Ação principal',
      category: 'problema',
    })
    expect(s.getSnapshot().project.comments[0]?.title).toBe('Ação principal')

    s.undo()
    expect(s.getSnapshot().project.comments[0]?.title).toBe('')
  })

  it('duplica anotação livre e seleciona a cópia (RF-029)', () => {
    const s = store()
    s.execute(
      new AddAnnotationCommand(
        createArea({ x: 0.1, y: 0.1, width: 0.2, height: 0.2 }, { id: 'a1' }),
      ),
    )
    s.select('a1')
    s.duplicateSelected()

    const annotations = s.getSnapshot().project.annotations
    expect(annotations).toHaveLength(2)
    const copyId = s.getSnapshot().selectedId
    expect(copyId).not.toBe('a1')
    expect(annotations.some((a) => a.id === copyId)).toBe(true)
  })

  it('duplica marcador criando novo comentário vinculado', () => {
    const s = store()
    const { annotation, comment } = createMarkerWithComment(
      { x: 0.5, y: 0.5 },
      { id: 'm1', order: 1 },
    )
    s.execute(new AddMarkerCommand(annotation, comment))
    s.select('m1')
    s.duplicateSelected()

    expect(s.getSnapshot().project.annotations).toHaveLength(2)
    expect(s.getSnapshot().project.comments).toHaveLength(2)
  })

  it('move a seleção por (dx, dy) de forma reversível (nudge — seção 12.2)', () => {
    const s = store()
    s.execute(
      new AddAnnotationCommand(
        createArea({ x: 0.1, y: 0.1, width: 0.2, height: 0.2 }, { id: 'a1' }),
      ),
    )
    s.select('a1')
    s.nudgeSelected(0.05, 0)

    const rect = s.getSnapshot().project.annotations[0]
    expect(rect?.type).toBe('area')
    if (rect?.type === 'area') {
      expect(rect.geometry.rect.x).toBeCloseTo(0.15)
    }
    expect(s.getSnapshot().canUndo).toBe(true)

    s.undo()
    const back = s.getSnapshot().project.annotations[0]
    if (back?.type === 'area') expect(back.geometry.rect.x).toBeCloseTo(0.1)
  })

  it('nudge sem seleção ou anulado pelo limite não gera comando', () => {
    const s = store()
    s.execute(
      new AddAnnotationCommand(
        createArea({ x: 0, y: 0, width: 0.2, height: 0.2 }, { id: 'a1' }),
      ),
    )
    // Sem seleção: nada acontece.
    s.nudgeSelected(0.1, 0.1)
    expect(s.getSnapshot().canUndo).toBe(true) // só a criação
    s.undo()
    expect(s.getSnapshot().canUndo).toBe(false)

    // Com objeto na borda esquerda, empurrar para fora é anulado (sem histórico).
    s.redo()
    s.select('a1')
    s.nudgeSelected(-0.1, 0)
    expect(s.getSnapshot().canUndo).toBe(true) // ainda só a criação
  })

  it('atualiza estilo/geometria de anotação de forma reversível (RF-027/028)', () => {
    const s = store()
    s.execute(
      new AddAnnotationCommand(
        createArea(
          { x: 0.1, y: 0.1, width: 0.2, height: 0.2 },
          { id: 'a1', color: '#B43A2C' },
        ),
      ),
    )
    const original = s.getSnapshot().project.annotations[0]
    if (original?.type !== 'area') throw new Error('esperava área')
    s.updateAnnotation({
      ...original,
      style: { ...original.style, color: '#1F6FEB' },
    })

    const edited = s.getSnapshot().project.annotations[0]
    if (edited?.type === 'area') expect(edited.style.color).toBe('#1F6FEB')

    s.undo()
    const back = s.getSnapshot().project.annotations[0]
    if (back?.type === 'area') expect(back.style.color).toBe('#B43A2C')
  })

  it('updateAnnotation ignora id inexistente', () => {
    const s = store()
    s.updateAnnotation(
      createArea({ x: 0, y: 0, width: 0.1, height: 0.1 }, { id: 'ghost' }),
    )
    expect(s.getSnapshot().canUndo).toBe(false)
  })

  it('reordena comentários e renumera marcadores (RF-043)', () => {
    const s = store()
    const first = createMarkerWithComment(
      { x: 0.1, y: 0.1 },
      { id: 'm1', order: 1 },
    )
    const second = createMarkerWithComment(
      { x: 0.2, y: 0.2 },
      { id: 'm2', order: 2 },
    )
    s.execute(new AddMarkerCommand(first.annotation, first.comment))
    s.execute(new AddMarkerCommand(second.annotation, second.comment))

    s.reorderComments([second.comment.id, first.comment.id])
    const comments = s.getSnapshot().project.comments
    expect(markerNumber(second.annotation, comments)).toBe(1)
    expect(markerNumber(first.annotation, comments)).toBe(2)
  })
})
