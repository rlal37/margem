/**
 * Exportação em PNG (RF-060, seção 18.1). Compõe imagem-base + anotações num
 * canvas offscreen no tamanho ORIGINAL da imagem, independentemente do zoom.
 * Inclui apenas imagem e objetos visíveis — nunca seleção, alças ou interface
 * (CA-10) — e nenhuma marca da Margem (RF-064).
 *
 * Tamanhos (traço, marcador, texto) correspondem à aparência a 100%: o PNG é
 * "o que se vê no zoom 100%".
 */

import {
  markerAppearance,
  readableInk,
  symbolPolygon,
} from '../../domain/appearance'
import { markerNumber } from '../../domain/numbering'
import type { Annotation, Project } from '../../domain/types'

const MARKER_RADIUS = 13
const MARKER_FONT = 14
const FONT_FAMILY = "system-ui, 'Segoe UI', Roboto, sans-serif"

interface PngOptions {
  /** Preenche um fundo branco atrás de imagens transparentes (RF-061). */
  includeBackground?: boolean
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Falha ao carregar a imagem-base.'))
    image.src = src
  })
}

export async function exportPng(
  project: Project,
  options: PngOptions = {},
): Promise<Blob> {
  const { width, height } = project.image
  const image = await loadImage(project.image.source)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D indisponível neste navegador.')

  if (options.includeBackground) {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)
  }
  ctx.drawImage(image, 0, 0, width, height)

  const ordered = [...project.annotations].sort((a, b) => a.zIndex - b.zIndex)
  for (const annotation of ordered) {
    drawAnnotation(ctx, annotation, project, width, height)
  }

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('A imagem não pôde ser gerada.'))
    }, 'image/png')
  })
}

function drawAnnotation(
  ctx: CanvasRenderingContext2D,
  annotation: Annotation,
  project: Project,
  w: number,
  h: number,
): void {
  switch (annotation.type) {
    case 'area': {
      const { x, y, width, height } = annotation.geometry.rect
      ctx.save()
      ctx.globalAlpha = annotation.style.opacity
      ctx.strokeStyle = annotation.style.color
      ctx.lineWidth = annotation.style.strokeWidth
      ctx.strokeRect(x * w, y * h, width * w, height * h)
      ctx.restore()
      break
    }
    case 'arrow': {
      const s = annotation.geometry.start
      const e = annotation.geometry.end
      const sx = s.x * w
      const sy = s.y * h
      const ex = e.x * w
      const ey = e.y * h
      ctx.save()
      ctx.strokeStyle = annotation.style.color
      ctx.fillStyle = annotation.style.color
      ctx.lineWidth = annotation.style.strokeWidth
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(sx, sy)
      ctx.lineTo(ex, ey)
      ctx.stroke()
      if (annotation.style.head === 'standard') {
        const angle = Math.atan2(ey - sy, ex - sx)
        const size = Math.max(annotation.style.strokeWidth * 3.5, 8)
        ctx.beginPath()
        ctx.moveTo(ex, ey)
        ctx.lineTo(
          ex - size * Math.cos(angle - Math.PI / 6),
          ey - size * Math.sin(angle - Math.PI / 6),
        )
        ctx.lineTo(
          ex - size * Math.cos(angle + Math.PI / 6),
          ey - size * Math.sin(angle + Math.PI / 6),
        )
        ctx.closePath()
        ctx.fill()
      }
      ctx.restore()
      break
    }
    case 'draw': {
      const pts = annotation.geometry.points
      if (pts.length < 2) break
      ctx.save()
      ctx.strokeStyle = annotation.style.color
      ctx.lineWidth = annotation.style.strokeWidth
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.beginPath()
      pts.forEach((p, i) => {
        const px = p.x * w
        const py = p.y * h
        if (i === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      })
      ctx.stroke()
      ctx.restore()
      break
    }
    case 'text': {
      ctx.save()
      ctx.fillStyle = annotation.style.color
      ctx.font = `${annotation.style.fontSize}px ${FONT_FAMILY}`
      ctx.textAlign =
        annotation.style.align === 'center'
          ? 'center'
          : annotation.style.align === 'right'
            ? 'right'
            : 'left'
      ctx.textBaseline = 'top'
      const x = annotation.geometry.point.x * w
      const y = annotation.geometry.point.y * h
      annotation.text.split('\n').forEach((line, i) => {
        ctx.fillText(line, x, y + i * annotation.style.fontSize * 1.2)
      })
      ctx.restore()
      break
    }
    case 'marker': {
      const cx = annotation.geometry.point.x * w
      const cy = annotation.geometry.point.y * h
      const { symbol, color } = markerAppearance(annotation, project.comments)
      const polygon = symbolPolygon(symbol, MARKER_RADIUS)
      ctx.save()
      ctx.fillStyle = color
      ctx.beginPath()
      if (polygon) {
        polygon.forEach((p, i) => {
          if (i === 0) ctx.moveTo(cx + p.x, cy + p.y)
          else ctx.lineTo(cx + p.x, cy + p.y)
        })
        ctx.closePath()
      } else {
        ctx.arc(cx, cy, MARKER_RADIUS, 0, Math.PI * 2)
      }
      ctx.fill()
      const number = markerNumber(annotation, project.comments)
      if (number !== undefined) {
        ctx.fillStyle = readableInk(color)
        ctx.font = `600 ${MARKER_FONT}px ${FONT_FAMILY}`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(String(number), cx, cy)
      }
      ctx.restore()
      break
    }
  }
}
