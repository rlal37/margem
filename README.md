# Margem

Um anotador visual rápido e **local por padrão**. Cole uma imagem, marque o
que importa, escreva um comentário só quando precisar e exporte uma
documentação neutra — sem cadastro, sem servidor e sem prender o trabalho à
ferramenta.

Projeto experimental e de código aberto da Oficina Digital, ao lado do
Vetoriza e do unificador de PDFs.

## Princípios

- **Local por padrão** — imagens e comentários não saem do navegador.
- **Sem cadastro** — nenhuma conta, nenhum backend no MVP.
- **Saída neutra** — PNG, Markdown e `.margem` exportados não contêm marca,
  autoria nem URL da aplicação.
- **Acessível** — WCAG 2.2 AA é requisito, não acabamento.
- **Aberto** — código legível, sob licença MIT.

## Stack

React + TypeScript + Vite. Canvas de anotação em SVG sobre imagem raster,
histórico de comandos para undo/redo, IndexedDB para persistência e deploy
estático (GitHub Pages). Testes com Vitest + Testing Library + Playwright.

## Desenvolvimento

Requer [Node.js](https://nodejs.org/) 24 (veja `.nvmrc`).

```bash
npm install        # instala dependências
npm run dev        # servidor de desenvolvimento
npm run build      # build de produção em dist/
npm run preview    # serve o build localmente
```

## Qualidade

```bash
npm run lint         # ESLint (inclui regras de acessibilidade jsx-a11y)
npm run format       # Prettier — formata o código
npm run format:check # Prettier — verifica formatação
npm test             # Vitest (unidade/integração)
npm run test:e2e     # Playwright (fluxos end-to-end)
```

Critério de aceite de cada tarefa: `npm run lint && npm test && npm run build`
sem erro.

## Status

Em desenvolvimento incremental por pacotes de trabalho (WP-01 a WP-11).
A especificação completa está em
[`docs/margem-requisitos-fluxos-v1.0.md`](docs/margem-requisitos-fluxos-v1.0.md).

## Limitações do MVP

Uma imagem por projeto (PNG, JPEG ou WebP); sem colaboração, contas, múltiplas
páginas, PDF, integrações externas ou IA. Esses itens são backlog posterior,
não deste MVP.

## Licença

[MIT](LICENSE).
