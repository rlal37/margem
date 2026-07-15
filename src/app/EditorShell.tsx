/**
 * Shell do editor (seção 6.2): barra superior, barra de ferramentas e canvas.
 * Liga o store às ferramentas, à camada de anotações e aos controles.
 *
 * Exclusão por Delete e undo/redo por Ctrl/Cmd atendem o essencial; o
 * conjunto completo de atalhos e o painel de comentários são WPs seguintes.
 */

import { useEffect, useRef } from 'react'
import {
  AnnotationLayer,
  CanvasViewport,
  SelectionOverlay,
  imageToScreen,
  type CanvasViewportHandle,
} from '../editor/canvas'
import { ToolRail, useCanvasTools } from '../editor/tools'
import { CommentsPanel } from '../editor/comments'
import type { Annotation, Comment } from '../domain/types'
import { useEditor } from './editorContext'
import './EditorShell.css'

function isEditingText(): boolean {
  const el = document.activeElement
  return (
    el instanceof HTMLInputElement ||
    el instanceof HTMLTextAreaElement ||
    (el instanceof HTMLElement && el.isContentEditable)
  )
}

export function EditorShell() {
  const { project, tool, selectedId, canUndo, canRedo, store } = useEditor()
  const canvasRef = useRef<CanvasViewportHandle>(null)
  const textInputRef = useRef<HTMLInputElement>(null)

  const imageSize = { width: project.image.width, height: project.image.height }
  const tools = useCanvasTools(store, project, imageSize, project.viewport.zoom)

  // Delete exclui a seleção; Ctrl/Cmd+Z desfaz, +Shift refaz (fora de campos).
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (isEditingText()) return
      const mod = event.ctrlKey || event.metaKey
      if (mod && event.key.toLowerCase() === 'z') {
        event.preventDefault()
        if (event.shiftKey) store.redo()
        else store.undo()
        return
      }
      if (
        (event.key === 'Delete' || event.key === 'Backspace') &&
        selectedId !== null
      ) {
        event.preventDefault()
        store.deleteSelected()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [store, selectedId])

  // Foca o editor de texto assim que ele aparece (sem prop autoFocus).
  const isEditingTextAnnotation = tools.textEditor !== null
  useEffect(() => {
    if (isEditingTextAnnotation) textInputRef.current?.focus()
  }, [isEditingTextAnnotation])

  const renderAnnotations: Annotation[] = tools.movingPreview
    ? project.annotations.map((a) =>
        a.id === tools.movingPreview?.id ? tools.movingPreview : a,
      )
    : project.annotations

  const selected = project.annotations.find((a) => a.id === selectedId) ?? null

  const textScreen = tools.textEditor
    ? imageToScreen(project.viewport, tools.textEditor.imagePoint)
    : null

  // Selecionar um comentário seleciona e enquadra o marcador (RF-044).
  function focusComment(comment: Comment) {
    const markerId = comment.markerAnnotationId
    if (!markerId) return
    store.select(markerId)
    const marker = project.annotations.find((a) => a.id === markerId)
    if (marker && marker.type === 'marker') {
      canvasRef.current?.centerOn(marker.geometry.point)
    }
  }

  return (
    <div className="editor">
      <header className="editor__bar">
        <span className="editor__title">{project.image.originalName}</span>
        <div className="editor__actions">
          <div role="group" aria-label="Histórico">
            <button
              type="button"
              onClick={() => store.undo()}
              disabled={!canUndo}
            >
              Desfazer
            </button>
            <button
              type="button"
              onClick={() => store.redo()}
              disabled={!canRedo}
            >
              Refazer
            </button>
          </div>
          <div role="group" aria-label="Zoom">
            <button type="button" onClick={() => canvasRef.current?.zoomOut()}>
              Diminuir zoom
            </button>
            <button type="button" onClick={() => canvasRef.current?.zoomIn()}>
              Aumentar zoom
            </button>
            <button type="button" onClick={() => canvasRef.current?.fit()}>
              Ajustar à tela
            </button>
            <button type="button" onClick={() => canvasRef.current?.actual()}>
              100%
            </button>
          </div>
        </div>
      </header>

      <div className="editor__body">
        <ToolRail activeTool={tool} onSelect={(t) => store.setTool(t)} />

        <main className="editor__canvas">
          <CanvasViewport
            ref={canvasRef}
            image={project.image}
            viewport={project.viewport}
            onViewportChange={(v) => store.setViewport(v)}
            activeTool={tool}
            onToolPointerDown={tools.onToolPointerDown}
            onToolPointerMove={tools.onToolPointerMove}
            onToolPointerUp={tools.onToolPointerUp}
          >
            <AnnotationLayer
              annotations={renderAnnotations}
              comments={project.comments}
              imageWidth={project.image.width}
              imageHeight={project.image.height}
              zoom={project.viewport.zoom}
            />
            {tools.draft && (
              <AnnotationLayer
                annotations={[tools.draft]}
                comments={project.comments}
                imageWidth={project.image.width}
                imageHeight={project.image.height}
                zoom={project.viewport.zoom}
              />
            )}
            {selected && (
              <SelectionOverlay
                annotation={selected}
                imageWidth={project.image.width}
                imageHeight={project.image.height}
                zoom={project.viewport.zoom}
              />
            )}
          </CanvasViewport>

          {tools.textEditor && textScreen && (
            <input
              ref={textInputRef}
              className="editor__text-input"
              aria-label="Texto da anotação"
              value={tools.textEditor.value}
              style={{ left: textScreen.x, top: textScreen.y }}
              onChange={(e) => tools.setTextValue(e.target.value)}
              onBlur={() => tools.commitText()}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  tools.commitText()
                } else if (e.key === 'Escape') {
                  e.preventDefault()
                  tools.cancelText()
                }
              }}
            />
          )}
        </main>

        <CommentsPanel
          comments={project.comments}
          activeMarkerId={selectedId}
          onUpdate={(c) => store.updateComment(c)}
          onReorder={(ids) => store.reorderComments(ids)}
          onDelete={(c) =>
            c.markerAnnotationId && store.deleteAnnotation(c.markerAnnotationId)
          }
          onFocus={focusComment}
        />
      </div>
    </div>
  )
}
