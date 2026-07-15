import 'fake-indexeddb/auto'
import { fireEvent, render, screen } from '@testing-library/react'
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

  it('mostra o wordmark e abre a página Sobre (WP-10)', async () => {
    render(<App />)
    await screen.findByText('Escolher imagem')
    // Wordmark da ferramenta na tela inicial.
    expect(screen.getByText('Margem')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Sobre a Margem' }))
    const dialog = await screen.findByRole('dialog', { name: 'Sobre a Margem' })
    expect(dialog).toBeInTheDocument()
    // Conteúdo essencial: privacidade e licença/atribuição.
    expect(screen.getByText(/licença MIT/)).toBeInTheDocument()
  })
})
