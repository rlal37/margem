# Margem — contexto para Claude Code

Margem é uma aplicação web local-first para anotar imagens (capturas de tela,
interfaces, fotos): marcadores numerados, áreas, setas, desenho livre e texto,
com comentários opcionais vinculados. Projeto da Oficina Digital (junto ao
Vetoriza e ao unificador de PDFs).

A especificação completa está em `docs/margem-requisitos-fluxos-v1.0.md`.
Leia esse documento antes de propor arquitetura ou decisões de escopo — ele
já fecha a maior parte das perguntas de produto. IDs de requisito (RF-XXX,
RNF-XXX, A11Y-XXX, CA-XX) e de work package (WP-XX) usados abaixo referenciam
as seções 8, 12, 15, 20 e 23 desse documento.

## Princípios inegociáveis

- **Local por padrão.** Nenhuma imagem ou comentário sai do navegador. Sem
  backend, sem cadastro no MVP.
- **Saída neutra.** PNG, Markdown e `.margem` exportados nunca contêm marca,
  autoria ou URL da aplicação (RF-064).
- **Acessibilidade não é extra.** WCAG 2.2 AA é requisito de MVP, não polimento
  final (seção 12).
- **Uma tarefa delimitada.** Não adicionar colaboração, contas, múltiplas
  imagens ou IA — isso é backlog posterior (seção 22), não deste MVP.

## Stack

React + TypeScript + Vite. Canvas de anotação em SVG sobre imagem raster
(não canvas bitmap — precisa de seleção individual de objeto). Estado central
pequeno com histórico de comandos para undo/redo. IndexedDB para persistência
(localStorage só para preferências). Deploy estático (GitHub Pages). Testes
com Vitest + Testing Library + Playwright.

## Estrutura de pastas (seção 14.2 do documento)

```
src/
  app/            # shell, rotas, providers, layout
  editor/
    canvas/       # viewport, SVG, seleção e objetos
    tools/        # select, marker, area, arrow, draw, text, pan
    comments/     # painel, vínculo e reordenação
    history/      # comandos, undo e redo
    project/      # novo, abrir, salvar, migrações
    export/       # PNG, Markdown, .margem
  storage/        # IndexedDB e recuperação
  accessibility/  # atalhos, live regions, helpers
  ui/             # componentes visuais reutilizáveis
  domain/         # tipos, validação, regras puras
tests/
```

## Como trabalhar comigo neste projeto

- **Uma unidade de trabalho por vez**, no formato da seção 23.2: contexto,
  tarefa, regras, critérios de aceite, comandos de teste. Não peça "construa
  o editor inteiro" — quebre por WP (23.1) ou por RF individual.
- Toda tarefa termina rodando `npm run lint && npm test && npm run build`
  sem erro. Isso é critério de aceite, não opcional.
- **Ações reversíveis por design.** Qualquer edição de anotação (criar, mover,
  redimensionar, estilo, excluir, reordenar comentário) é um comando no
  histórico — nunca uma mutação direta que undo/redo não alcance.
- **Coordenadas sempre normalizadas** em relação às dimensões originais da
  imagem-base, nunca em pixels de tela.
- **Marcador numerado é o único objeto que cria comentário automaticamente**
  (área, seta, desenho e texto ficam livres por padrão — RF-030, RF-040).
- Um comportamento por commit; refactor separado de mudança funcional;
  testes no mesmo commit da regra que protegem (23.3).
- Se a tarefa envolve issue/commit, referencie o ID do requisito, ex.:
  `RF-043 — Reordenar comentários e renumerar marcadores`.

## Ordem recomendada (roadmap, seção 21 e 23.1)

`WP-01 Base do projeto → WP-02 Domínio → WP-03 Viewport → WP-04 Ferramentas
→ WP-05 Comentários → WP-06 Histórico → WP-07 Persistência → WP-08 Exportação
→ WP-09 Acessibilidade → WP-10 Identidade e conteúdo → WP-11 QA e lançamento`

Antes de travar a arquitetura de componentes, validar na ordem da seção 21.1:
SVG para seleção/transformação/exportação → memória com imagem grande +
autosave → vínculo marcador-comentário e renumeração → fluxo sem mouse.

## Perguntas em aberto (Apêndice C)

Não bloqueiam o início da arquitetura, mas devem ser fechadas por protótipo
pequeno antes do acabamento visual — não decidir por suposição no meio de
uma tarefa não relacionada. Se uma tarefa esbarrar em uma dessas perguntas,
parar e perguntar em vez de assumir uma resposta.
