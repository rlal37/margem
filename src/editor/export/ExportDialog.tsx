/**
 * Modal de exportação (Apêndice B: ExportDialog; seção 6.1). Escolhe formato,
 * permite editar o nome do arquivo e gera/baixa apenas por ação explícita
 * (RF-065, RF-066). Saídas neutras, sem marca (RF-064).
 */

import { useEffect, useRef, useState } from 'react'
import type { Project } from '../../domain/types'
import { buildMarkdown } from './markdownExport'
import { exportMargem } from './margemFile'
import { exportPng } from './pngExport'
import { defaultBaseName, safeFileName, triggerDownload } from './download'
import './ExportDialog.css'

type Format = 'png' | 'markdown' | 'margem'

const EXTENSION: Record<Format, string> = {
  png: '.png',
  markdown: '.md',
  margem: '.margem',
}

interface ExportDialogProps {
  open: boolean
  project: Project
  onClose(): void
}

export function ExportDialog({ open, project, onClose }: ExportDialogProps) {
  const [format, setFormat] = useState<Format>('png')
  const [baseName, setBaseName] = useState(() => defaultBaseName())
  const [includeBackground, setIncludeBackground] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (open) {
      setError(null)
      closeRef.current?.focus()
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onClose()
      }
    }
    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [open, onClose])

  if (!open) return null

  async function handleDownload() {
    setBusy(true)
    setError(null)
    try {
      const filename =
        safeFileName(baseName, defaultBaseName()) + EXTENSION[format]
      if (format === 'markdown') {
        const blob = new Blob([buildMarkdown(project)], {
          type: 'text/markdown;charset=utf-8',
        })
        triggerDownload(blob, filename)
      } else if (format === 'png') {
        const blob = await exportPng(project, { includeBackground })
        triggerDownload(blob, filename)
      } else {
        const imageBlob = await fetch(project.image.source).then((r) =>
          r.blob(),
        )
        const blob = await exportMargem(project, imageBlob)
        triggerDownload(blob, filename)
      }
      onClose()
    } catch {
      setError(
        'A exportação falhou. O projeto continua aberto — tente novamente.',
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="export-dialog__backdrop">
      <div
        className="export-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-dialog-title"
      >
        <div className="export-dialog__header">
          <h2 id="export-dialog-title">Exportar</h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        <fieldset className="export-dialog__formats">
          <legend>Formato</legend>
          <label>
            <input
              type="radio"
              name="format"
              checked={format === 'png'}
              onChange={() => setFormat('png')}
            />
            Imagem anotada (PNG)
          </label>
          <label>
            <input
              type="radio"
              name="format"
              checked={format === 'markdown'}
              onChange={() => setFormat('markdown')}
            />
            Comentários (Markdown)
          </label>
          <label>
            <input
              type="radio"
              name="format"
              checked={format === 'margem'}
              onChange={() => setFormat('margem')}
            />
            Projeto (.margem)
          </label>
        </fieldset>

        {format === 'png' && (
          <label className="export-dialog__option">
            <input
              type="checkbox"
              checked={includeBackground}
              onChange={(e) => setIncludeBackground(e.target.checked)}
            />
            Preencher fundo branco (imagens com transparência)
          </label>
        )}

        <label className="export-dialog__name">
          Nome do arquivo
          <span className="export-dialog__name-field">
            <input
              value={baseName}
              onChange={(e) => setBaseName(e.target.value)}
              aria-label="Nome do arquivo"
            />
            <span aria-hidden="true">{EXTENSION[format]}</span>
          </span>
        </label>

        {error && (
          <p role="alert" className="export-dialog__error">
            {error}
          </p>
        )}

        <p className="export-dialog__privacy">
          O arquivo é gerado neste navegador e baixado localmente.
        </p>

        <div className="export-dialog__actions">
          <button type="button" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="button"
            className="export-dialog__download"
            onClick={handleDownload}
            disabled={busy}
          >
            {busy ? 'Gerando…' : 'Baixar'}
          </button>
        </div>
      </div>
    </div>
  )
}
