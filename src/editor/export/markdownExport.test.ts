import { describe, expect, it } from 'vitest'
import { createProject } from '../../domain/factories'
import type { Comment, ImageAsset, Project } from '../../domain/types'
import { buildMarkdown } from './markdownExport'

const image: ImageAsset = {
  mimeType: 'image/png',
  width: 800,
  height: 600,
  originalName: 'captura-home.png',
  source: 'blob:live',
}

function comment(order: number, extra: Partial<Comment> = {}): Comment {
  return { id: `c${order}`, order, title: '', body: '', ...extra }
}

function project(comments: Comment[]): Project {
  return {
    ...createProject(image, { id: 'p1', now: 'T', title: 'Revisão da home' }),
    comments,
  }
}

const now = new Date(2026, 6, 15, 9, 5) // 15/07/2026, 09:05

describe('buildMarkdown', () => {
  it('inclui título, imagem de referência e data', () => {
    const md = buildMarkdown(project([]), now)
    expect(md).toContain('# Revisão da home')
    expect(md).toContain('Imagem de referência: `captura-home.png`')
    expect(md).toContain('Exportado em: 15/07/2026, 09:05')
  })

  it('lista comentários numerados com categoria e corpo (RF-062)', () => {
    const md = buildMarkdown(
      project([
        comment(1, {
          title: 'Ação principal',
          category: 'problema',
          body: 'O rótulo não comunica o resultado.',
        }),
      ]),
      now,
    )
    expect(md).toContain('## 01 — Ação principal')
    expect(md).toContain('**Categoria:** Problema')
    expect(md).toContain('O rótulo não comunica o resultado.')
  })

  it('usa "Comentário NN" quando não há título (seção 18.2)', () => {
    const md = buildMarkdown(project([comment(2)]), now)
    expect(md).toContain('## 02 — Comentário 02')
  })

  it('não contém marca da Margem (RF-064)', () => {
    const md = buildMarkdown(project([comment(1, { title: 'x' })]), now)
    expect(md.toLowerCase()).not.toContain('margem')
    expect(md).not.toMatch(/https?:\/\//)
  })
})
