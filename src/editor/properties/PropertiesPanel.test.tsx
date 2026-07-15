import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { createArea, createText } from '../../domain/factories'
import type { AreaAnnotation, TextAnnotation } from '../../domain/types'
import { PropertiesPanel } from './PropertiesPanel'

describe('PropertiesPanel', () => {
  it('troca a cor pela paleta (RF-028, reversível via store)', () => {
    const area = createArea(
      { x: 0.1, y: 0.1, width: 0.2, height: 0.2 },
      { id: 'a1', color: '#B43A2C' },
    )
    const onChange = vi.fn()
    render(
      <PropertiesPanel
        annotation={area}
        onChange={onChange}
        onDelete={() => {}}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Cor #1F6FEB' }))
    expect(onChange).toHaveBeenCalledTimes(1)
    const next = onChange.mock.calls[0][0] as AreaAnnotation
    expect(next.style.color).toBe('#1F6FEB')
  })

  it('edita a posição por número — alternativa ao arraste (seção 12.2)', () => {
    const area = createArea(
      { x: 0.2, y: 0.2, width: 0.2, height: 0.2 },
      { id: 'a1' },
    )
    const onChange = vi.fn()
    render(
      <PropertiesPanel
        annotation={area}
        onChange={onChange}
        onDelete={() => {}}
      />,
    )
    fireEvent.change(screen.getByLabelText('X'), { target: { value: '50' } })
    const next = onChange.mock.calls[0][0] as AreaAnnotation
    expect(next.geometry.rect.x).toBeCloseTo(0.5)
  })

  it('oferece os dois tamanhos de texto (decisão do Apêndice C)', () => {
    const text = createText({ x: 0.5, y: 0.5 }, 'oi', {
      id: 't1',
      fontSize: 16,
    })
    const onChange = vi.fn()
    render(
      <PropertiesPanel
        annotation={text}
        onChange={onChange}
        onDelete={() => {}}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Grande' }))
    const next = onChange.mock.calls[0][0] as TextAnnotation
    expect(next.style.fontSize).toBe(28)
  })

  it('aciona a exclusão do objeto', () => {
    const area = createArea(
      { x: 0, y: 0, width: 0.1, height: 0.1 },
      { id: 'a1' },
    )
    const onDelete = vi.fn()
    render(
      <PropertiesPanel
        annotation={area}
        onChange={() => {}}
        onDelete={onDelete}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Excluir objeto' }))
    expect(onDelete).toHaveBeenCalled()
  })
})
