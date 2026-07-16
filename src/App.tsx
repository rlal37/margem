import {
  useCallback,
  useEffect,
  useState,
  type ChangeEvent,
  type DragEvent,
} from 'react'
import './App.css'
import { EditorProvider } from './app/EditorProvider'
import { EditorShell } from './app/EditorShell'
import { createProject } from './domain/factories'
import { loadImageAsset } from './editor/canvas'
import { importMargem } from './editor/export'
import {
  clearCurrentProject,
  hasCurrentProject,
  loadCurrentProject,
  saveImage,
  saveProjectData,
} from './storage'
import { ConfirmDialog } from './ui/ConfirmDialog'
import { AboutDialog } from './ui/AboutDialog'
import type { Project } from './domain/types'

type Phase = 'loading' | 'empty' | 'recovery' | 'editing'

function App() {
  const [phase, setPhase] = useState<Phase>('loading')
  const [project, setProject] = useState<Project | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [confirmNew, setConfirmNew] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  // Falso quando a imagem-base não pôde ser guardada localmente (ex.: Safari em
  // navegação privada): a sessão segue em memória, mas não é recuperável.
  const [storageOk, setStorageOk] = useState(true)

  // Na abertura, verifica se há um projeto recuperável (RF-054, seção 7.6).
  useEffect(() => {
    let cancelled = false
    hasCurrentProject()
      .then((has) => {
        if (!cancelled) setPhase(has ? 'recovery' : 'empty')
      })
      .catch(() => {
        if (!cancelled) setPhase('empty')
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Ingestão única de imagem, compartilhada por escolher, colar e arrastar
  // (seção 6.1: três formas de importar).
  const ingestImageFile = useCallback(async (file: File) => {
    const result = await loadImageAsset(file)
    if (!result.ok) {
      setError(result.error)
      return
    }

    const created = createProject(result.asset)
    // A imagem é o dado que torna a sessão recuperável. Se ela não puder ser
    // guardada, não gravamos o JSON (evita oferecer recuperação sem imagem) e
    // sinalizamos armazenamento degradado — a sessão segue em memória (RNF-004,
    // CA-15) e a interface recomenda baixar uma cópia.
    let imageSaved = true
    try {
      await saveImage(file)
    } catch {
      imageSaved = false
    }
    if (imageSaved) {
      try {
        await saveProjectData(created)
      } catch {
        /* o autosave tentará novamente */
      }
    }
    setStorageOk(imageSaved)
    setError(null)
    setProject(created)
    setPhase('editing')
  }, [])

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (file) void ingestImageFile(file)
  }

  // Colar imagem da área de transferência, apenas na tela inicial vazia.
  useEffect(() => {
    if (phase !== 'empty') return
    function onPaste(event: ClipboardEvent) {
      const item = Array.from(event.clipboardData?.items ?? []).find((i) =>
        i.type.startsWith('image/'),
      )
      const file = item?.getAsFile()
      if (file) {
        event.preventDefault()
        void ingestImageFile(file)
      }
    }
    window.addEventListener('paste', onPaste)
    return () => window.removeEventListener('paste', onPaste)
  }, [phase, ingestImageFile])

  function handleDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault()
    setDragActive(false)
    const file = event.dataTransfer.files?.[0]
    if (file) void ingestImageFile(file)
  }

  async function handleImportMargem(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    const result = await importMargem(file)
    if (!result.ok) {
      setError(result.error)
      return
    }
    let imageSaved = true
    try {
      await saveImage(result.imageBlob)
    } catch {
      imageSaved = false
    }
    if (imageSaved) {
      try {
        await saveProjectData(result.project)
      } catch {
        /* o autosave tentará novamente */
      }
    }
    setStorageOk(imageSaved)
    setError(null)
    setProject(result.project)
    setPhase('editing')
  }

  async function continueRecovery() {
    const loaded = await loadCurrentProject()
    if (loaded) {
      // Recuperou do IndexedDB: o armazenamento funciona nesta sessão.
      setStorageOk(true)
      setProject(loaded.project)
      setPhase('editing')
    } else {
      setPhase('empty')
    }
  }

  function revokeCurrentImage() {
    if (project?.image.source.startsWith('blob:')) {
      URL.revokeObjectURL(project.image.source)
    }
  }

  async function confirmStartNew() {
    revokeCurrentImage()
    await clearCurrentProject()
    setProject(null)
    setConfirmNew(false)
    setPhase('empty')
  }

  if (phase === 'loading') {
    return <main className="empty-state" aria-busy="true" />
  }

  if (phase === 'editing' && project) {
    return (
      <>
        <EditorProvider project={project}>
          <EditorShell
            onNewProject={() => setConfirmNew(true)}
            storageOk={storageOk}
          />
        </EditorProvider>
        <ConfirmDialog
          open={confirmNew}
          title="Começar de novo?"
          message="Começar de novo apaga o projeto salvo neste navegador. Baixe uma cópia antes, se precisar."
          confirmLabel="Começar novo"
          onConfirm={confirmStartNew}
          onCancel={() => setConfirmNew(false)}
        />
      </>
    )
  }

  if (phase === 'recovery') {
    return (
      <main className="empty-state">
        <div className="empty-state__card">
          <h1 className="empty-state__title">
            Há um projeto salvo neste navegador.
          </h1>
          <p className="empty-state__hint">Continuar de onde parou?</p>
          <div className="empty-state__choices">
            <button
              type="button"
              className="empty-state__button"
              onClick={continueRecovery}
            >
              Continuar projeto
            </button>
            <button
              type="button"
              className="empty-state__link"
              onClick={() => setConfirmNew(true)}
            >
              Começar novo
            </button>
          </div>
        </div>
        <ConfirmDialog
          open={confirmNew}
          title="Começar de novo?"
          message="Começar de novo apaga o projeto salvo neste navegador. Baixe uma cópia antes, se precisar."
          confirmLabel="Começar novo"
          onConfirm={confirmStartNew}
          onCancel={() => setConfirmNew(false)}
        />
      </main>
    )
  }

  // phase === 'empty'
  return (
    <>
      <main
        className={`empty-state${dragActive ? ' empty-state--drag' : ''}`}
        onDragOver={(e) => {
          e.preventDefault()
          setDragActive(true)
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
      >
        <div className="empty-state__card">
          <p className="empty-state__brand">Margem</p>
          <h1 className="empty-state__title">
            Traga uma imagem para a margem.
          </h1>
          <p className="empty-state__hint">
            Cole, arraste ou escolha um arquivo PNG, JPEG ou WebP.
          </p>

          <div className="empty-state__choices">
            <label className="empty-state__button">
              Escolher imagem
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFile}
                className="empty-state__input"
              />
            </label>

            <label className="empty-state__link">
              Abrir projeto .margem
              <input
                type="file"
                accept=".margem,application/json"
                onChange={handleImportMargem}
                className="empty-state__input"
              />
            </label>

            <button
              type="button"
              className="empty-state__link"
              onClick={() => setAboutOpen(true)}
              aria-haspopup="dialog"
            >
              Sobre a Margem
            </button>
          </div>

          {error && (
            <p role="alert" className="empty-state__error">
              {error}
            </p>
          )}

          <p className="empty-state__privacy">
            A imagem e as anotações ficam neste navegador.
          </p>
        </div>
      </main>
      <AboutDialog open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </>
  )
}

export default App
