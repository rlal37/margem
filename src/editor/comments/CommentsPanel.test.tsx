import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Comment } from '../../domain/types'
import { CommentsPanel } from './CommentsPanel'

function comment(id: string, order: number, title = ''): Comment {
  return { id, order, title, body: '', markerAnnotationId: `m-${id}` }
}

function setup(overrides: Partial<Parameters<typeof CommentsPanel>[0]> = {}) {
  const props = {
    comments: [comment('a', 1, 'Primeiro'), comment('b', 2, 'Segundo')],
    activeMarkerId: null,
    onUpdate: vi.fn(),
    onReorder: vi.fn(),
    onDelete: vi.fn(),
    onFocus: vi.fn(),
    ...overrides,
  }
  render(<CommentsPanel {...props} />)
  return props
}

describe('CommentsPanel', () => {
  it('mostra estado vazio sem comentários', () => {
    setup({ comments: [] })
    expect(screen.getByText(/não precisam ter/i)).toBeInTheDocument()
  })

  it('lista comentários na ordem e edita o título no blur (RF-041)', () => {
    const props = setup()
    const input = screen.getByLabelText('Título do comentário 1')
    fireEvent.change(input, { target: { value: 'Ação principal' } })
    expect(props.onUpdate).not.toHaveBeenCalled() // só no blur
    fireEvent.blur(input)
    expect(props.onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'a', title: 'Ação principal' }),
    )
  })

  it('altera categoria imediatamente (RF-042)', () => {
    const props = setup()
    const select = within(
      screen
        .getByLabelText('Título do comentário 1')
        .closest('li') as HTMLElement,
    ).getByRole('combobox')
    fireEvent.change(select, { target: { value: 'problema' } })
    expect(props.onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'a', category: 'problema' }),
    )
  })

  it('reordena movendo para baixo (RF-043)', () => {
    const props = setup()
    fireEvent.click(screen.getByLabelText('Mover comentário 1 para baixo'))
    expect(props.onReorder).toHaveBeenCalledWith(['b', 'a'])
  })

  it('destaca o comentário do marcador selecionado (RF-045)', () => {
    setup({ activeMarkerId: 'm-b' })
    const activeCard = screen
      .getByLabelText('Título do comentário 2')
      .closest('li')
    expect(activeCard?.className).toContain('comment-card--active')
  })

  it('aciona foco no marcador pelo número (RF-044)', () => {
    const props = setup()
    fireEvent.click(screen.getByLabelText('Ir para o marcador 1'))
    expect(props.onFocus).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'a' }),
    )
  })
})
