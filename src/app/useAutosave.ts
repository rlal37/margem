/**
 * Autosave local (RF-052, RF-053). Observa o store e grava o projeto após um
 * breve período de inatividade (debounce). Também tenta gravar ao esconder a
 * aba (pagehide/visibilitychange), quando possível (seção 13.3).
 *
 * Uma falha de gravação nunca apaga a sessão em memória (RNF-004): apenas
 * reporta o estado `error` para a interface recomendar baixar uma cópia
 * (CA-15).
 */

import { useEffect, useRef, useState } from 'react'
import type { Project } from '../domain/types'
import { saveProjectData } from '../storage'
import type { EditorStore } from './editorStore'

export type SaveStatus = 'saved' | 'saving' | 'error'

const DEBOUNCE_MS = 800

/**
 * `enabled = false` sinaliza armazenamento degradado (ex.: a imagem-base não
 * pôde ser guardada no IndexedDB). Nesse caso o autosave não grava nada — para
 * não criar uma sessão "recuperável" sem imagem — e reporta `error`, levando a
 * interface a recomendar baixar uma cópia (CA-15).
 */
export function useAutosave(store: EditorStore, enabled = true): SaveStatus {
  const [status, setStatus] = useState<SaveStatus>(enabled ? 'saved' : 'error')
  // O projeto inicial já foi gravado ao importar/recuperar.
  const lastSaved = useRef<Project>(store.getSnapshot().project)

  useEffect(() => {
    if (!enabled) {
      setStatus('error')
      return
    }
    let timer: ReturnType<typeof setTimeout> | undefined

    async function persist(project: Project) {
      try {
        await saveProjectData(project)
        lastSaved.current = project
        setStatus('saved')
      } catch {
        setStatus('error')
      }
    }

    function schedule() {
      const project = store.getSnapshot().project
      if (project === lastSaved.current) return
      setStatus('saving')
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => void persist(project), DEBOUNCE_MS)
    }

    function flush() {
      const project = store.getSnapshot().project
      if (project !== lastSaved.current) void persist(project)
    }

    function onVisibility() {
      if (document.visibilityState === 'hidden') flush()
    }

    const unsubscribe = store.subscribe(schedule)
    window.addEventListener('pagehide', flush)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      unsubscribe()
      if (timer) clearTimeout(timer)
      window.removeEventListener('pagehide', flush)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [store, enabled])

  return status
}
