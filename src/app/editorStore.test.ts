import { describe, expect, it } from 'vitest'
import {
  createArea,
  createMarkerWithComment,
  createProject,
} from '../domain/factories'
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
})
