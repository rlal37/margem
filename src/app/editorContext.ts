/**
 * Contexto e hooks do store do editor. Separado do provedor para manter o
 * arquivo de componente exportando apenas componentes (compatível com Fast
 * Refresh).
 */

import { createContext, useContext, useSyncExternalStore } from 'react'
import { EditorStore, type EditorSnapshot } from './editorStore'

export const EditorContext = createContext<EditorStore | null>(null)

export function useEditorStore(): EditorStore {
  const store = useContext(EditorContext)
  if (!store) {
    throw new Error('useEditorStore precisa estar dentro de <EditorProvider>.')
  }
  return store
}

export function useEditor(): EditorSnapshot & { store: EditorStore } {
  const store = useEditorStore()
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot)
  return { ...snapshot, store }
}
