import { useRef, useState, type ChangeEvent } from 'react'
import './App.css'
import {
  CanvasViewport,
  loadImageAsset,
  type CanvasViewportHandle,
} from './editor/canvas'
import type { ImageAsset, Viewport } from './domain/types'

const INITIAL_VIEWPORT: Viewport = {
  zoom: 1,
  panX: 0,
  panY: 0,
  fitMode: 'fit',
}

function App() {
  const [image, setImage] = useState<ImageAsset | null>(null)
  const [viewport, setViewport] = useState<Viewport>(INITIAL_VIEWPORT)
  const [error, setError] = useState<string | null>(null)
  const canvasRef = useRef<CanvasViewportHandle>(null)

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    const result = await loadImageAsset(file)
    if (result.ok) {
      setError(null)
      setImage(result.asset)
      setViewport(INITIAL_VIEWPORT)
    } else {
      setError(result.error)
    }
  }

  if (!image) {
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
    <div className="editor">
      <header className="editor__bar">
        <span className="editor__title">{image.originalName}</span>
        <div className="editor__zoom" role="group" aria-label="Zoom">
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
      </header>

      <main className="editor__canvas">
        <CanvasViewport
          ref={canvasRef}
          image={image}
          viewport={viewport}
          onViewportChange={setViewport}
        />
      </main>
    </div>
  )
}

export default App
