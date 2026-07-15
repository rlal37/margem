import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { createMarkerWithComment } from '../../domain/factories'
import type { Comment } from '../../domain/types'
import { AnnotationLayer } from './AnnotationLayer'

function renderLayer(
  comments: Comment[],
  marker: ReturnType<typeof createMarkerWithComment>['annotation'],
) {
  return render(
    <svg>
      <AnnotationLayer
        annotations={[marker]}
        comments={comments}
        imageWidth={100}
        imageHeight={100}
        zoom={1}
      />
    </svg>,
  )
}

describe('AnnotationLayer — símbolo do marcador', () => {
  it('marcador sem categoria é um círculo', () => {
    const { annotation, comment } = createMarkerWithComment(
      { x: 0.5, y: 0.5 },
      { id: 'm1', order: 1 },
    )
    const { container } = renderLayer([comment], annotation)
    expect(container.querySelector('circle')).not.toBeNull()
    expect(container.querySelector('polygon')).toBeNull()
  })

  it('categoria "problema" desenha um triângulo (polígono)', () => {
    const { annotation, comment } = createMarkerWithComment(
      { x: 0.5, y: 0.5 },
      { id: 'm1', order: 1 },
    )
    const { container } = renderLayer(
      [{ ...comment, category: 'problema' }],
      annotation,
    )
    const polygon = container.querySelector('polygon')
    expect(polygon).not.toBeNull()
    expect(polygon?.getAttribute('fill')).toBe('#B43A2C')
  })
})
