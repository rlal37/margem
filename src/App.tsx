import { useMemo, useState, type ChangeEvent } from 'react'
import './App.css'
import { EditorProvider } from './app/EditorProvider'
import { EditorShell } from './app/EditorShell'
import { createProject } from './domain/factories'
import { loadImageAsset } from './editor/canvas'
import type { ImageAsset } from './domain/types'

function App() {
  const [image, setImage] = useState<ImageAsset | null>(null)
  const [error, setError] = useState<string | null>(null)

  const project = useMemo(() => (image ? createProject(image) : null), [image])

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    const result = await loadImageAsset(file)
    if (result.ok) {
      setError(null)
      setImage(result.asset)
    } else {
      setError(result.error)
    }
  }

  if (!project) {
    return (
      <main className="empty-state">
        <div className="empty-state__card">
          <h1 className="empty-state__title">
            Traga uma imagem para a margem.
          </h1>
          <p className="empty-state__hint">
            Cole, arraste ou escolha um arquivo PNG, JPEG ou WebP.
          </p>

          <label className="empty-state__button">
            Escolher imagem
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFile}
              className="empty-state__input"
            />
          </label>

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
    )
  }

  return (
    <EditorProvider project={project}>
      <EditorShell />
    </EditorProvider>
  )
}

export default App
