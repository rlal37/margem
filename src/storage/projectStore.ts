/**
 * Persistência do projeto atual (seção 13.3). No MVP há um único projeto
 * recuperável, gravado sob a chave `current`. O JSON do projeto e o Blob da
 * imagem-base ficam em stores separados: a imagem é gravada uma vez ao
 * importar; o JSON é regravado pelo autosave a cada alteração.
 *
 * O `source` da imagem (object URL efêmero) nunca é persistido — é recriado
 * a partir do Blob na recuperação. Assim o dado guardado não contém
 * referências locais inválidas.
 */

import { parseProject } from '../domain/validation'
import type { Project } from '../domain/types'
import { idbDelete, idbGet, idbPut } from './db'

const CURRENT = 'current'

interface StoredProjectRecord {
  project: unknown
  savedAt: string
}

/** Grava o Blob da imagem-base (uma vez, ao importar). */
export function saveImage(blob: Blob): Promise<unknown> {
  return idbPut('image', CURRENT, blob)
}

/** Grava o JSON do projeto (autosave), sem o object URL da imagem. */
export function saveProjectData(project: Project): Promise<unknown> {
  const record: StoredProjectRecord = {
    project: { ...project, image: { ...project.image, source: '' } },
    savedAt: new Date().toISOString(),
  }
  return idbPut('project', CURRENT, record)
}

/** Existe um projeto recuperável? (verificação leve, sem carregar a imagem). */
export async function hasCurrentProject(): Promise<boolean> {
  const record = await idbGet<StoredProjectRecord>('project', CURRENT)
  return record !== undefined
}

/**
 * Carrega o projeto atual e recria o object URL da imagem a partir do Blob.
 * Retorna `null` se não houver projeto, faltar a imagem ou o schema for
 * incompatível (migração: por ora, descartar em vez de abrir corrompido).
 */
export async function loadCurrentProject(): Promise<{
  project: Project
  imageUrl: string
} | null> {
  const record = await idbGet<StoredProjectRecord>('project', CURRENT)
  const blob = await idbGet<Blob>('image', CURRENT)
  if (!record || !blob) return null

  const parsed = parseProject(record.project)
  if (!parsed.ok) return null

  const imageUrl = URL.createObjectURL(blob)
  const project: Project = {
    ...parsed.project,
    image: { ...parsed.project.image, source: imageUrl },
  }
  return { project, imageUrl }
}

/** Apaga todos os dados locais do projeto (RF-055, RNF-012). */
export async function clearCurrentProject(): Promise<void> {
  await idbDelete('project', CURRENT)
  await idbDelete('image', CURRENT)
}
