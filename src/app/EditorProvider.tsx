/**
 * Provedor do store do editor. Cria uma instância de `EditorStore` por
 * projeto e a expõe via contexto. Os hooks de consumo ficam em
 * `editorContext.ts`.
 */

import { useMemo, type ReactNode } from 'react'
import type { Project } from '../domain/types'
import { EditorStore } from './editorStore'
import { EditorContext } from './editorContext'

interface EditorProviderProps {
  project: Project
  children: ReactNode
}

export function EditorProvider({ project, children }: EditorProviderProps) {
  // Uma store por projeto; recria ao trocar de projeto (nova imagem).
  const store = useMemo(() => new EditorStore(project), [project])
  return (
    <EditorContext.Provider value={store}>{children}</EditorContext.Provider>
  )
}
