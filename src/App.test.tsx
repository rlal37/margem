import 'fake-indexeddb/auto'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'
import { clearCurrentProject } from './storage'

beforeEach(async () => {
  await clearCurrentProject()
})

describe('App', () => {
  it('mostra a tela inicial quando não há projeto salvo', async () => {
    render(<App />)
    // A checagem de recuperação é assíncrona; espera a tela inicial.
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Traga uma imagem para a margem.',
      }),
    ).toBeInTheDocument()
  })

  it('oferece a ação de escolher imagem e o aviso de privacidade', async () => {
    render(<App />)
    expect(await screen.findByText('Escolher imagem')).toBeInTheDocument()
    expect(
      screen.getByText('A imagem e as anotações ficam neste navegador.'),
    ).toBeInTheDocument()
  })
})
