import { describe, expect, it } from 'vitest'
import { loadImageAsset, type ImageDecoder } from './imageAsset'

function fakeFile(name: string, type: string, size = 1024): File {
  const file = new File([new Uint8Array(1)], name, { type })
  // jsdom não deixa definir size via construtor de forma confiável.
  Object.defineProperty(file, 'size', { value: size })
  return file
}

const decode1x1: ImageDecoder = async () => ({ width: 1440, height: 900 })
const createUrl = () => 'blob:local'

describe('loadImageAsset', () => {
  it('aceita PNG/JPEG/WebP válidos e produz ImageAsset', async () => {
    const result = await loadImageAsset(fakeFile('captura.png', 'image/png'), {
      decode: decode1x1,
      createUrl,
    })
    expect(result).toEqual({
      ok: true,
      asset: {
        mimeType: 'image/png',
        width: 1440,
        height: 900,
        originalName: 'captura.png',
        source: 'blob:local',
      },
    })
  })

  it('rejeita formato não suportado com mensagem acionável', async () => {
    const result = await loadImageAsset(fakeFile('a.gif', 'image/gif'), {
      decode: decode1x1,
      createUrl,
    })
    expect(result).toEqual({
      ok: false,
      error: 'Este formato não é aceito. Use PNG, JPEG ou WebP.',
    })
  })

  it('rejeita arquivo acima do limite de bytes', async () => {
    const huge = fakeFile('big.png', 'image/png', 100 * 1024 * 1024)
    const result = await loadImageAsset(huge, { decode: decode1x1, createUrl })
    expect(result.ok).toBe(false)
  })

  it('rejeita imagem acima do limite de dimensão', async () => {
    const result = await loadImageAsset(fakeFile('wide.png', 'image/png'), {
      decode: async () => ({ width: 20000, height: 100 }),
      createUrl,
    })
    expect(result.ok).toBe(false)
  })

  it('trata falha de decodificação sem lançar', async () => {
    const result = await loadImageAsset(fakeFile('x.png', 'image/png'), {
      decode: async () => {
        throw new Error('corrompido')
      },
      createUrl,
    })
    expect(result.ok).toBe(false)
  })
})
