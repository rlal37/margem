/**
 * Traduz gestos de ponteiro (em pixels da imagem) nas ações de cada
 * ferramenta, emitindo comandos reversíveis para o store. Mantém o rascunho
 * (preview) de criação e de movimentação para o canvas desenhar em tempo
 * real, sem sujar o histórico — só o resultado final vira comando (RF-050).
 *
 * Regra de modo: após criar um objeto, a ferramenta volta para Selecionar
 * (seção 9.2).
 */

import { useCallback, useRef, useState } from 'react'
import type { EditorStore } from '../../app/editorStore'
import { DEFAULT_FONT_SIZE } from '../../domain/constants'
import {
  createArea,
  createArrow,
  createDraw,
  createMarkerWithComment,
  createText,
} from '../../domain/factories'
import type {
  NormalizedPoint,
  PixelPoint,
  PixelSize,
} from '../../domain/geometry'
import type { Annotation, Project } from '../../domain/types'
import {
  AddAnnotationCommand,
  AddMarkerCommand,
  ReplaceAnnotationCommand,
} from '../history/commands'
import {
  areaRectFromDrag,
  hitTest,
  isArrowDragValid,
  moveAnnotation,
} from './tools'

const PICK_SCREEN_PX = 12
const DRAW_MIN_STEP = 0.002

type Gesture =
  | { kind: 'none' }
  | {
      kind: 'create'
      tool: 'area' | 'arrow'
      start: NormalizedPoint
      current: NormalizedPoint
    }
  | { kind: 'draw'; points: NormalizedPoint[] }
  | {
      kind: 'move'
      original: Annotation
      start: NormalizedPoint
      dx: number
      dy: number
    }

export interface TextEditorState {
  imagePoint: PixelPoint
  value: string
}

export interface CanvasToolsResult {
  onToolPointerDown(point: PixelPoint): void
  onToolPointerMove(point: PixelPoint): void
  onToolPointerUp(point: PixelPoint): void
  /** Preview de criação (área/seta/desenho). */
  draft: Annotation | null
  /** Preview de um objeto sendo movido (sobrepõe o original). */
  movingPreview: Annotation | null
  textEditor: TextEditorState | null
  setTextValue(value: string): void
  commitText(): void
  cancelText(): void
  /** Cancela criação/edição em andamento; retorna se havia algo (Esc). */
  cancelGesture(): boolean
}

export function useCanvasTools(
  store: EditorStore,
  project: Project,
  imageSize: PixelSize,
  zoom: number,
): CanvasToolsResult {
  const [gesture, setGesture] = useState<Gesture>({ kind: 'none' })
  const [textEditor, setTextEditor] = useState<TextEditorState | null>(null)

  // Espelhos do estado para leitura síncrona em cancelGesture (evento Esc).
  const gestureRef = useRef(gesture)
  gestureRef.current = gesture
  const textEditorRef = useRef(textEditor)
  textEditorRef.current = textEditor

  const cancelGesture = useCallback((): boolean => {
    const wasActive =
      gestureRef.current.kind !== 'none' || textEditorRef.current !== null
    setGesture({ kind: 'none' })
    setTextEditor(null)
    return wasActive
  }, [])

  const toNorm = useCallback(
    (point: PixelPoint): NormalizedPoint => ({
      x: point.x / imageSize.width,
      y: point.y / imageSize.height,
    }),
    [imageSize],
  )

  const nextZIndex = useCallback(
    () =>
      project.annotations.reduce((max, a) => Math.max(max, a.zIndex), 0) + 1,
    [project.annotations],
  )

  const strokeStyle = () => ({
    color: project.preferences.color,
    strokeWidth: project.preferences.strokeWidth,
  })

  const onToolPointerDown = useCallback(
    (point: PixelPoint) => {
      const norm = toNorm(point)
      const tool = store.getSnapshot().tool

      switch (tool) {
        case 'select': {
          const pickRadius = PICK_SCREEN_PX / zoom
          const id = hitTest(project.annotations, point, imageSize, pickRadius)
          store.select(id)
          const original = project.annotations.find((a) => a.id === id)
          if (original) {
            setGesture({ kind: 'move', original, start: norm, dx: 0, dy: 0 })
          }
          break
        }
        case 'marker': {
          const { annotation, comment } = createMarkerWithComment(norm, {
            color: project.preferences.color,
            order: project.comments.length + 1,
            zIndex: nextZIndex(),
          })
          store.execute(new AddMarkerCommand(annotation, comment))
          store.setTool('select')
          store.select(annotation.id)
          break
        }
        case 'text':
          setTextEditor({ imagePoint: point, value: '' })
          break
        case 'area':
        case 'arrow':
          setGesture({ kind: 'create', tool, start: norm, current: norm })
          break
        case 'draw':
          setGesture({ kind: 'draw', points: [norm] })
          break
        default:
          break
      }
    },
    [store, project, imageSize, zoom, toNorm, nextZIndex],
  )

  const onToolPointerMove = useCallback(
    (point: PixelPoint) => {
      const norm = toNorm(point)
      setGesture((current) => {
        switch (current.kind) {
          case 'create':
            return { ...current, current: norm }
          case 'draw': {
            const last = current.points[current.points.length - 1]
            if (
              last &&
              Math.hypot(norm.x - last.x, norm.y - last.y) < DRAW_MIN_STEP
            ) {
              return current
            }
            return { kind: 'draw', points: [...current.points, norm] }
          }
          case 'move':
            return {
              ...current,
              dx: norm.x - current.start.x,
              dy: norm.y - current.start.y,
            }
          default:
            return current
        }
      })
    },
    [toNorm],
  )

  const onToolPointerUp = useCallback(() => {
    setGesture((current) => {
      if (current.kind === 'create') {
        if (current.tool === 'area') {
          const rect = areaRectFromDrag(current.start, current.current)
          if (rect) {
            const annotation = createArea(rect, {
              ...strokeStyle(),
              opacity: 1,
              zIndex: nextZIndex(),
            })
            store.execute(new AddAnnotationCommand(annotation))
            store.setTool('select')
            store.select(annotation.id)
          }
        } else if (isArrowDragValid(current.start, current.current)) {
          const annotation = createArrow(current.start, current.current, {
            ...strokeStyle(),
            zIndex: nextZIndex(),
          })
          store.execute(new AddAnnotationCommand(annotation))
          store.setTool('select')
          store.select(annotation.id)
        }
      } else if (current.kind === 'draw') {
        if (current.points.length >= 2) {
          const annotation = createDraw(current.points, {
            ...strokeStyle(),
            zIndex: nextZIndex(),
          })
          store.execute(new AddAnnotationCommand(annotation))
          store.setTool('select')
          store.select(annotation.id)
        }
      } else if (current.kind === 'move') {
        if (current.dx !== 0 || current.dy !== 0) {
          const moved = moveAnnotation(current.original, current.dx, current.dy)
          store.execute(new ReplaceAnnotationCommand(moved, 'Mover objeto'))
        }
      }
      return { kind: 'none' }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store, nextZIndex, project.preferences])

  const commitText = useCallback(() => {
    setTextEditor((editor) => {
      if (editor && editor.value.trim() !== '') {
        const norm = toNorm(editor.imagePoint)
        const annotation = createText(norm, editor.value, {
          color: project.preferences.color,
          fontSize: DEFAULT_FONT_SIZE,
          zIndex: nextZIndex(),
        })
        store.execute(new AddAnnotationCommand(annotation))
        store.setTool('select')
        store.select(annotation.id)
      }
      return null
    })
  }, [store, project.preferences.color, toNorm, nextZIndex])

  const cancelText = useCallback(() => setTextEditor(null), [])
  const setTextValue = useCallback(
    (value: string) => setTextEditor((e) => (e ? { ...e, value } : e)),
    [],
  )

  const draft = draftFromGesture(gesture, project)
  const movingPreview =
    gesture.kind === 'move'
      ? moveAnnotation(gesture.original, gesture.dx, gesture.dy)
      : null

  return {
    onToolPointerDown,
    onToolPointerMove,
    onToolPointerUp,
    draft,
    movingPreview,
    textEditor,
    setTextValue,
    commitText,
    cancelText,
    cancelGesture,
  }
}

function draftFromGesture(
  gesture: Gesture,
  project: Project,
): Annotation | null {
  const style = {
    color: project.preferences.color,
    strokeWidth: project.preferences.strokeWidth,
  }
  if (gesture.kind === 'create') {
    if (gesture.tool === 'area') {
      const rect = areaRectFromDrag(gesture.start, gesture.current)
      return rect
        ? createArea(rect, { ...style, opacity: 1, id: 'draft' })
        : null
    }
    return createArrow(gesture.start, gesture.current, {
      ...style,
      id: 'draft',
    })
  }
  if (gesture.kind === 'draw' && gesture.points.length >= 2) {
    return createDraw(gesture.points, { ...style, id: 'draft' })
  }
  return null
}
