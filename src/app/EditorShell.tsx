/**
 * Shell do editor (seção 6.2): barra superior, barra de ferramentas e canvas.
 * Liga o store às ferramentas, à camada de anotações e aos controles, e
 * instala os atalhos de teclado (WP-06).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  AnnotationLayer,
  CanvasViewport,
  ObjectList,
  SelectionOverlay,
  imageToScreen,
  type CanvasViewportHandle,
} from '../editor/canvas'
import { ToolRail, useCanvasTools } from '../editor/tools'
import { CommentsPanel } from '../editor/comments'
import { PropertiesPanel } from '../editor/properties'
import { ExportDialog } from '../editor/export'
import {
  ANNOUNCE,
  Announcer,
  LiveRegion,
  useKeyboardShortcuts,
} from '../accessibility'
import { ShortcutHelp } from '../ui/ShortcutHelp'
import type { Annotation, Comment } from '../domain/types'
import { useEditor } from './editorContext'
import { useAutosave, type SaveStatus } from './useAutosave'
import './EditorShell.css'

const SAVE_LABEL: Record<SaveStatus, string> = {
  saving: 'Salvando…',
  saved: 'Salvo neste navegador',
  error: 'Falha ao salvar. Baixe uma cópia.',
}

interface EditorShellProps {
  onNewProject(): void
}

export function EditorShell({ onNewProject }: EditorShellProps) {
  const { project, tool, selectedId, canUndo, canRedo, store } = useEditor()
  const canvasRef = useRef<CanvasViewportHandle>(null)
  const textInputRef = useRef<HTMLInputElement>(null)
  const [helpOpen, setHelpOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const saveStatus = useAutosave(store)

  const announcer = useMemo(() => new Announcer(), [])
  const announce = announcer.announce

  const imageSize = { width: project.image.width, height: project.image.height }
  const tools = useCanvasTools(store, project, imageSize, project.viewport.zoom)

  const toggleHelp = useCallback(() => setHelpOpen((open) => !open), [])
  const openExport = useCallback(() => setExportOpen(true), [])
  useKeyboardShortcuts({
    store,
    canvas: canvasRef,
    cancelGesture: tools.cancelGesture,
    onToggleHelp: toggleHelp,
    onExport: openExport,
    announce,
  })

  const undo = useCallback(() => {
    store.undo()
    announce(ANNOUNCE.undo)
  }, [store, announce])
  const redo = useCallback(() => {
    store.redo()
    announce(ANNOUNCE.redo)
  }, [store, announce])

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
        <div className="editor__meta">
          <span className="editor__title">{project.image.originalName}</span>
          <span
            className={`editor__save editor__save--${saveStatus}`}
            role="status"
            aria-live="polite"
          >
            {SAVE_LABEL[saveStatus]}
          </span>
        </div>
        <div className="editor__actions">
          <button type="button" onClick={onNewProject} title="Novo projeto">
            Novo projeto
          </button>
          <button
            type="button"
            onClick={openExport}
            title="Exportar (Ctrl/Cmd+E)"
          >
            Exportar
          </button>
          <div role="group" aria-label="Histórico">
            <button
              type="button"
              onClick={undo}
              disabled={!canUndo}
              title="Desfazer (Ctrl/Cmd+Z)"
            >
              Desfazer
            </button>
            <button
              type="button"
              onClick={redo}
              disabled={!canRedo}
              title="Refazer (Ctrl/Cmd+Shift+Z)"
            >
              Refazer
            </button>
          </div>
          <div role="group" aria-label="Zoom">
            <button
              type="button"
              onClick={() => canvasRef.current?.zoomOut()}
              title="Diminuir zoom (−)"
            >
              Diminuir zoom
            </button>
            <button
              type="button"
              onClick={() => canvasRef.current?.zoomIn()}
              title="Aumentar zoom (+)"
            >
              Aumentar zoom
            </button>
            <button
              type="button"
              onClick={() => canvasRef.current?.fit()}
              title="Ajustar à tela (0)"
            >
              Ajustar à tela
            </button>
            <button
              type="button"
              onClick={() => canvasRef.current?.actual()}
              title="100% (1)"
            >
              100%
            </button>
          </div>
          <button
            type="button"
            onClick={toggleHelp}
            title="Ajuda e atalhos (?)"
            aria-haspopup="dialog"
          >
            Ajuda
          </button>
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
            onNudge={(dx, dy) => store.nudgeSelected(dx, dy)}
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

        <div className="editor__side">
          <ObjectList
            annotations={project.annotations}
            comments={project.comments}
            selectedId={selectedId}
            onSelect={(id) => store.select(id)}
          />
          {selected && selected.type !== 'marker' ? (
            <PropertiesPanel
              annotation={selected}
              onChange={(next, label) => store.updateAnnotation(next, label)}
              onDelete={() => store.deleteSelected()}
            />
          ) : (
            <CommentsPanel
              comments={project.comments}
              activeMarkerId={selectedId}
              onUpdate={(c) => store.updateComment(c)}
              onReorder={(ids) => store.reorderComments(ids)}
              onDelete={(c) =>
                c.markerAnnotationId &&
                store.deleteAnnotation(c.markerAnnotationId)
              }
              onFocus={focusComment}
            />
          )}
        </div>
      </div>

      <ShortcutHelp open={helpOpen} onClose={() => setHelpOpen(false)} />
      <ExportDialog
        open={exportOpen}
        project={project}
        onClose={() => setExportOpen(false)}
        announce={announce}
      />
      <LiveRegion announcer={announcer} />
    </div>
  )
}
