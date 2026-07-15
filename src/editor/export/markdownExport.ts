/**
 * Exportação em Markdown (RF-062, seção 18.2). Legível sem a aplicação, sem
 * sintaxe proprietária. Comentários sem título usam "Comentário NN". Anotações
 * livres (sem comentário) não constam. Nenhuma marca da Margem (RF-064).
 */

import { CATEGORY_LABELS } from '../comments/categories'
import { sortedComments } from '../../domain/numbering'
import type { Project } from '../../domain/types'

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

function formatDate(date: Date): string {
  const d = pad(date.getDate())
  const m = pad(date.getMonth() + 1)
  const y = date.getFullYear()
  return `${d}/${m}/${y}, ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function buildMarkdown(
  project: Project,
  now: Date = new Date(),
): string {
  const lines: string[] = [
    `# ${project.title}`,
    '',
    `Imagem de referência: \`${project.image.originalName}\``,
    `Exportado em: ${formatDate(now)}`,
  ]

  for (const comment of sortedComments(project.comments)) {
    const nn = pad(comment.order)
    const title =
      comment.title.trim() !== '' ? comment.title.trim() : `Comentário ${nn}`
    lines.push('', `## ${nn} — ${title}`)
    if (comment.category) {
      lines.push(`**Categoria:** ${CATEGORY_LABELS[comment.category]}`)
    }
    if (comment.body.trim() !== '') {
      lines.push('', comment.body.trim())
    }
  }

  return lines.join('\n') + '\n'
}
