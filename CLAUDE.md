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

## Estado atual (2026-07-15)

**WP-01 a WP-09 concluídos, verificados e no ar.** Repositório
`rlal37/margem` (branch `master`), publicado por GitHub Actions em
`https://rlal37.github.io/margem/`. CI roda lint + format:check + test +
build + e2e; deploy automático no push. **Próximo: WP-10 Identidade e
conteúdo** (fechar paleta/tamanhos provisórios, microcopy, Sobre).

O fluxo principal do MVP funciona ponta a ponta: importar imagem (seletor de
arquivo) → anotar (marcador/área/seta/desenho/texto) → comentar → autosave →
recuperar sessão → exportar PNG/Markdown/`.margem` → reimportar `.margem`.

### Arquitetura como construída (pontos de entrada)

- `src/domain/` — puro, sem UI. `types.ts` (união `Annotation`, `Comment`,
  `Project`), `geometry.ts` (coordenadas normalizadas), `factories.ts`,
  `numbering.ts` (ordem/renumeração), `validation.ts` (`parseProject`),
  `constants.ts` (paleta/limites provisórios).
- `src/editor/history/` — `command.ts` (`Command`, `ProjectHistory` com
  `replace` para campos não-undoable) e `commands.ts` (Add/Replace/Remove,
  AddMarker/RemoveMarker, ReorderComments, UpdateComment).
- `src/app/editorStore.ts` — **store central** (`EditorStore` +
  `useSyncExternalStore`): projeto+ferramenta+seleção; toda edição via
  comando. `EditorProvider`/`editorContext.ts` expõem `useEditor()`.
  `useAutosave.ts` (debounce + estado salvando/salvo/falha).
- `src/editor/canvas/` — `viewport.ts` (fit/zoom/pan puros),
  `CanvasViewport.tsx` (SVG, delega ponteiro à ferramenta, `centerOn`),
  `AnnotationLayer.tsx`, `SelectionOverlay.tsx`, `imageAsset.ts` (carregar
  imagem).
- `src/editor/tools/` — `tools.ts` (criação/mover/hit-test puros),
  `useCanvasTools.ts` (gestos → comandos, `cancelGesture`), `ToolRail.tsx`.
- `src/editor/comments/` — `CommentsPanel`/`CommentCard` (edição no blur,
  reordenar ↑/↓, vínculo bidirecional).
- `src/editor/export/` — `pngExport`, `markdownExport`, `margemFile`
  (JSON+base64, export/import), `download.ts`, `ExportDialog.tsx`.
- `src/storage/` — `db.ts` (wrapper IndexedDB) + `projectStore.ts` (chave
  única `current`; imagem como Blob, JSON à parte; object URL recriado no load).
- `src/accessibility/` — `shortcuts.ts` (`matchShortcut` puro) +
  `useKeyboardShortcuts.ts` (anuncia undo/redo/excluir/duplicar); `announcer.ts`
  (`Announcer` observável + `ANNOUNCE`) + `LiveRegion.tsx` (região ao vivo);
  `useFocusTrap.ts` (Tab circular + retorno de foco nos diálogos).
  `src/ui/` — `ShortcutHelp`, `ConfirmDialog` (ambos usam `useFocusTrap`).
- `src/domain/describe.ts` — texto acessível de anotação (tipo, número,
  posição em terços) para a lista de objetos e leitores de tela.
- `src/editor/canvas/ObjectList.tsx` — lista de objetos navegável, seleção
  sincronizada ao canvas (seção 12.2); `CanvasViewport` é focável
  (`role="application"`), setas movem a seleção (`store.nudgeSelected`) e
  Espaço-hold faz pan.
- `src/App.tsx` — fases loading/empty/recovery/editing; `EditorShell.tsx` —
  barra + zonas; painel lateral (`.editor__side`) empilha ObjectList + Comments.

### Convenções já estabelecidas (seguir)

- **Node 24** (winget). No Windows, `node`/`npm` **não ficam no PATH** destas
  sessões: prefixar `$env:Path = [Environment]::GetEnvironmentVariable('Path','Machine')+';'+[Environment]::GetEnvironmentVariable('Path','User')` antes de `npm`.
- **ESLint 9 / react-hooks 5 fixos** (não atualizar sem checar peers — ver
  memória `toolchain-pins`). `verbatimModuleSyntax`+`erasableSyntaxOnly`
  ligados: use `import type`, **sem** enums, **sem** parameter properties.
- Pastas com arquivos reais **não** têm `.gitkeep`. Cada pasta tem `index.ts`.
- Diálogos: `role="dialog"`, foco inicial, Esc em listener de **captura** com
  `stopPropagation` (não usar handlers de clique em elemento não-interativo —
  o `jsx-a11y` barra).
- Testes puros no domínio/tools/export; componentes com Testing Library;
  **fluxos reais no e2e** (Playwright, Chromium). IndexedDB testado com
  `fake-indexeddb`. No e2e o input de imagem é `input[accept*="image"]` e o de
  projeto `input[accept*="margem"]` (há dois inputs de arquivo).
- Sizes de traço/marcador/texto = imagem-px = "aparência a 100%"; export PNG é
  fiel a isso.

### Pendências deixadas para WPs de acabamento

- **WP-09 concluído**: focus-trap + retorno de foco nos diálogos; canvas
  focável com movimento por setas (Shift amplia) e Espaço-hold para pan; lista
  de objetos navegável sincronizada; live regions (`Announcer`) para
  undo/redo/excluir/duplicar/exportar; foco visível global; redução de
  movimento (`prefers-reduced-motion`); `axe-core` em teste (`axe.test.tsx`,
  contraste de cor fica para o WP-10 por depender de layout). Ainda falta:
  propriedades numéricas editáveis como alternativa ao arraste (12.2) — depende
  do PropertiesPanel abaixo.
- **WP-04 restante**: redimensionar/rotacionar (RF-027 completo), duplicar já
  existe; seleção múltipla (RF-026, era "1.1").
- **PropertiesPanel** (painel troca para propriedades ao selecionar objeto
  livre — seção 6.2) ainda não existe.
- **RF-046** (comentário sem marcador) não implementado.
- Paleta/cores e tamanhos são **provisórios** (Apêndice C) — fechar no WP-10.

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
