import { useRef, useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useFocusTrap } from './useFocusTrap'

function Dialog({ onClose }: { onClose(): void }) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const firstRef = useRef<HTMLButtonElement>(null)
  useFocusTrap({
    active: true,
    containerRef: dialogRef,
    initialFocusRef: firstRef,
  })
  return (
    <div ref={dialogRef} role="dialog" aria-label="d">
      <button ref={firstRef}>Primeiro</button>
      <button>Segundo</button>
      <button onClick={onClose}>Fechar</button>
    </div>
  )
}

function Harness() {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <button onClick={() => setOpen(true)}>Abrir</button>
      {open && <Dialog onClose={() => setOpen(false)} />}
    </div>
  )
}

describe('useFocusTrap', () => {
  it('leva o foco inicial ao elemento indicado', () => {
    render(<Dialog onClose={() => {}} />)
    expect(screen.getByText('Primeiro')).toHaveFocus()
  })

  it('circula o Tab do último para o primeiro e vice-versa', () => {
    render(<Dialog onClose={() => {}} />)
    const first = screen.getByText('Primeiro')
    const fechar = screen.getByText('Fechar')

    fechar.focus()
    fireEvent.keyDown(document, { key: 'Tab' })
    expect(first).toHaveFocus()

    first.focus()
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
    expect(fechar).toHaveFocus()
  })

  it('devolve o foco a quem abriu ao fechar (desmontar)', () => {
    render(<Harness />)
    const abrir = screen.getByText('Abrir')
    abrir.focus()
    fireEvent.click(abrir)

    // Foco inicial dentro do diálogo.
    expect(screen.getByText('Primeiro')).toHaveFocus()

    fireEvent.click(screen.getByText('Fechar'))
    // Ao fechar, o foco volta ao gatilho.
    expect(abrir).toHaveFocus()
  })
})
