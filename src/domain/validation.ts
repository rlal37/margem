/**
 * Validação de projeto (RF-007). Verifica a estrutura essencial e a versão
 * do schema antes de aceitar um projeto vindo do disco (arquivo .margem) ou
 * do armazenamento local. As mensagens são em português do Brasil (RF-073).
 *
 * A abertura de um arquivo inválido nunca deve substituir a sessão em
 * memória (seção 17.3): por isso a validação devolve um resultado em vez de
 * lançar, deixando a decisão ao chamador.
 */

import { SCHEMA_VERSION } from './constants'
import type {
  Annotation,
  AnnotationType,
  Project,
  SupportedImageType,
} from './types'

export type ParseResult =
  { ok: true; project: Project } | { ok: false; error: string }

const ANNOTATION_TYPES: readonly AnnotationType[] = [
  'marker',
  'area',
  'arrow',
  'draw',
  'text',
]

const IMAGE_TYPES: readonly SupportedImageType[] = [
  'image/png',
  'image/jpeg',
  'image/webp',
]

/** Aceita a versão atual do schema. Migrações entram em WP-07/08. */
export function isSupportedSchemaVersion(version: unknown): boolean {
  return version === SCHEMA_VERSION
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isValidAnnotation(value: unknown): value is Annotation {
  if (!isObject(value)) return false
  if (typeof value.id !== 'string') return false
  if (!ANNOTATION_TYPES.includes(value.type as AnnotationType)) return false
  return isObject(value.geometry) && isObject(value.style)
}

/**
 * Valida um valor desconhecido como Project. Não normaliza nem migra: apenas
 * confirma que a estrutura mínima está presente e coerente.
 */
export function parseProject(value: unknown): ParseResult {
  if (!isObject(value)) {
    return { ok: false, error: 'O projeto está vazio ou não é um objeto.' }
  }

  if (!isSupportedSchemaVersion(value.schemaVersion)) {
    return {
      ok: false,
      error:
        'Não foi possível abrir este projeto. O arquivo pode estar incompleto ou ser de outra versão.',
    }
  }

  if (typeof value.id !== 'string' || typeof value.title !== 'string') {
    return { ok: false, error: 'O projeto não tem identificação válida.' }
  }

  const image = value.image
  if (
    !isObject(image) ||
    !IMAGE_TYPES.includes(image.mimeType as SupportedImageType) ||
    !isFiniteNumber(image.width) ||
    !isFiniteNumber(image.height) ||
    image.width <= 0 ||
    image.height <= 0
  ) {
    return { ok: false, error: 'A imagem-base do projeto é inválida.' }
  }

  if (!Array.isArray(value.annotations) || !Array.isArray(value.comments)) {
    return {
      ok: false,
      error: 'As anotações ou comentários estão corrompidos.',
    }
  }

  if (!value.annotations.every(isValidAnnotation)) {
    return { ok: false, error: 'Há uma anotação com formato inválido.' }
  }

  return { ok: true, project: value as unknown as Project }
}
