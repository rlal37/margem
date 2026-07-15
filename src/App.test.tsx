import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('mostra a tela inicial para trazer uma imagem', () => {
    render(<App />)
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Traga uma imagem para a margem.',
      }),
    ).toBeInTheDocument()
  })

  it('oferece a ação de escolher imagem e o aviso de privacidade', () => {
    render(<App />)
    expect(screen.getByText('Escolher imagem')).toBeInTheDocument()
    expect(
      screen.getByText('A imagem e as anotações ficam neste navegador.'),
    ).toBeInTheDocument()
  })
})
