/**
 * Carregamento e validação da imagem-base (RF-002 a RF-005).
 *
 * A validação acontece antes de qualquer decodificação custosa e devolve um
 * resultado com mensagem acionável em pt-BR (RF-073, seção 17.2) — a tela
 * anterior nunca é substituída por um arquivo inválido (seção 17.3). Todo o
 * processamento é local (RNF-002): usamos um object URL, sem upload.
 */

import {
  MAX_IMAGE_BYTES,
  MAX_IMAGE_DIMENSION,
  SUPPORTED_IMAGE_TYPES,
} from '../../domain/constants'
import type { ImageAsset, SupportedImageType } from '../../domain/types'

export type LoadImageResult =
  { ok: true; asset: ImageAsset } | { ok: false; error: string }

/** Lê as dimensões de um blob de imagem. Injetável para testes. */
export type ImageDecoder = (blob: Blob) => Promise<{
  width: number
  height: number
}>

function isSupportedType(type: string): type is SupportedImageType {
  return (SUPPORTED_IMAGE_TYPES as readonly string[]).includes(type)
}

/** Decodificador padrão via `createImageBitmap` (nativo, sem rede). */
const defaultDecoder: ImageDecoder = async (blob) => {
  const bitmap = await createImageBitmap(blob)
  try {
    return { width: bitmap.width, height: bitmap.height }
  } finally {
    bitmap.close()
  }
}

/**
 * Valida e carrega um arquivo como imagem-base. `source` é um object URL
 * local; o chamador deve revogá-lo ao descartar o projeto.
 */
export async function loadImageAsset(
  file: File,
  options: { decode?: ImageDecoder; createUrl?: (blob: Blob) => string } = {},
): Promise<LoadImageResult> {
  if (!isSupportedType(file.type)) {
    return {
      ok: false,
      error: 'Este formato não é aceito. Use PNG, JPEG ou WebP.',
    }
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return {
      ok: false,
      error:
        'A imagem é grande demais para este navegador. Tente uma versão menor.',
    }
  }

  const decode = options.decode ?? defaultDecoder

  let dimensions: { width: number; height: number }
  try {
    dimensions = await decode(file)
  } catch {
    return {
      ok: false,
      error:
        'Não foi possível ler esta imagem. O arquivo pode estar corrompido.',
    }
  }

  if (dimensions.width <= 0 || dimensions.height <= 0) {
    return { ok: false, error: 'A imagem não tem dimensões válidas.' }
  }

  if (
    dimensions.width > MAX_IMAGE_DIMENSION ||
    dimensions.height > MAX_IMAGE_DIMENSION
  ) {
    return {
      ok: false,
      error:
        'A imagem é grande demais para este navegador. Tente uma versão menor.',
    }
  }

  const createUrl =
    options.createUrl ?? ((blob: Blob) => URL.createObjectURL(blob))

  const asset: ImageAsset = {
    mimeType: file.type,
    width: dimensions.width,
    height: dimensions.height,
    originalName: file.name,
    source: createUrl(file),
  }
  return { ok: true, asset }
}
