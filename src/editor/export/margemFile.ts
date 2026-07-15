/**
 * Arquivo de projeto .margem (RF-063, RF-007, seção 18.3). Contêiner JSON com
 * a imagem-base embutida em base64 — portátil e inspecionável. Sem marca na
 * saída (RF-064); apenas metadado técnico de schema e aplicação geradora,
 * como permite a seção 18.3.
 *
 * As funções puras (`buildMargemJson`/`parseMargemJson`) fazem a serialização
 * e a validação; os invólucros assíncronos cuidam da conversão do Blob.
 */

import { SCHEMA_VERSION } from '../../domain/constants'
import { parseProject } from '../../domain/validation'
import type { Project, SupportedImageType } from '../../domain/types'

interface EmbeddedImage {
  mimeType: SupportedImageType
  base64: string
}

interface MargemJson {
  app: 'margem'
  schemaVersion: string
  project: Project
  image: EmbeddedImage
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

/** Monta o JSON do .margem (sem o object URL efêmero). */
export function buildMargemJson(
  project: Project,
  image: EmbeddedImage,
): string {
  const data: MargemJson = {
    app: 'margem',
    schemaVersion: SCHEMA_VERSION,
    project: { ...project, image: { ...project.image, source: '' } },
    image,
  }
  return JSON.stringify(data, null, 2)
}

export type MargemParseResult =
  | { ok: true; project: Project; image: EmbeddedImage }
  | { ok: false; error: string }

/** Valida e interpreta o conteúdo de um .margem (RF-007). */
export function parseMargemJson(text: string): MargemParseResult {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    return {
      ok: false,
      error:
        'Não foi possível abrir este projeto. O arquivo pode estar incompleto ou ser de outra versão.',
    }
  }

  if (!isObject(raw) || raw.app !== 'margem') {
    return { ok: false, error: 'Este arquivo não é um projeto da Margem.' }
  }

  const parsed = parseProject(raw.project)
  if (!parsed.ok) return { ok: false, error: parsed.error }

  const image = raw.image
  if (
    !isObject(image) ||
    typeof image.mimeType !== 'string' ||
    typeof image.base64 !== 'string'
  ) {
    return { ok: false, error: 'A imagem do projeto está corrompida.' }
  }

  return {
    ok: true,
    project: parsed.project,
    image: {
      mimeType: image.mimeType as SupportedImageType,
      base64: image.base64,
    },
  }
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result.slice(result.indexOf(',') + 1))
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

function base64ToBlob(base64: string, mimeType: string): Blob {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new Blob([bytes], { type: mimeType })
}

/** Gera o Blob do arquivo .margem para download. */
export async function exportMargem(
  project: Project,
  imageBlob: Blob,
): Promise<Blob> {
  const base64 = await blobToBase64(imageBlob)
  const json = buildMargemJson(project, {
    mimeType: project.image.mimeType,
    base64,
  })
  return new Blob([json], { type: 'application/json' })
}

export type MargemImportResult =
  { ok: true; project: Project; imageBlob: Blob } | { ok: false; error: string }

/** Importa um arquivo .margem, recriando o object URL da imagem (RF-007). */
export async function importMargem(file: File): Promise<MargemImportResult> {
  const parsed = parseMargemJson(await file.text())
  if (!parsed.ok) return parsed

  const imageBlob = base64ToBlob(parsed.image.base64, parsed.image.mimeType)
  const imageUrl = URL.createObjectURL(imageBlob)
  const project: Project = {
    ...parsed.project,
    image: { ...parsed.project.image, source: imageUrl },
  }
  return { ok: true, project, imageBlob }
}
