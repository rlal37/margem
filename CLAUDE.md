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

**WP-01 a WP-10 concluídos; WP-11 em andamento (parte de engenharia feita).**
Repositório `rlal37/margem` (branch `master`), publicado por GitHub Actions em
`https://rlal37.github.io/margem/`. CI roda lint + format:check + test +
build + e2e (Chromium); deploy automático no push.

**WP-11 — feito (engenharia/QA automatizável):** e2e do CA-14 (atalho não
dispara em campo), limites de arquivo e erros conhecidos no README, correção do
CA-15 (falha de gravação da imagem não é mais silenciosa — `storageOk`/
`useAutosave(enabled)`), e e2e das garantias centrais: privacidade (nenhuma
requisição externa no fluxo), limpar dados (RF-055, some após reload) e
fidelidade do PNG ao tamanho original em qualquer zoom (RF-060, compara IHDR).
**Cross-browser:** e2e só no Chromium é o gate
confiável — Firefox não lança neste ambiente e o WebKit do Playwright não grava
Blob no IndexedDB (limitação de infra, não bug do Safari real; provado por
round-trip cru). **Resta (gate humano):** teste com 5 pessoas, leitor de tela
real, cross-browser manual (Safari/Firefox reais), publicar link na Oficina
Digital, conferir deploy.

O fluxo principal do MVP funciona ponta a ponta: importar imagem (escolher,
colar ou arrastar) → anotar (marcador/área/seta/desenho/texto) → comentar →
categorizar (símbolo+cor do marcador) → editar propriedades → autosave →
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
- `src/domain/appearance.ts` — aparência do marcador dirigida pela categoria
  (`markerAppearance`: símbolo+cor via `CATEGORY_APPEARANCE`; neutro sem
  categoria), `symbolPolygon` (compartilhado SVG+PNG) e `readableInk`
  (contraste WCAG do número). `AnnotationLayer`/`pngExport` desenham o símbolo.
- `src/editor/properties/PropertiesPanel.tsx` — ao selecionar objeto livre, o
  painel troca de comentários para propriedades (cor/espessura/opacidade/ponta/
  tamanho de texto/alinhamento + posição X/Y numérica = alternativa ao arraste,
  12.2). Edição via `store.updateAnnotation` (reversível).
- `src/ui/AboutDialog.tsx` — página Sobre (atribuição só aqui; saída neutra).
- `src/App.tsx` — fases loading/empty/recovery/editing; onboarding por
  escolher/colar/arrastar (`ingestImageFile`); wordmark na tela inicial.
  `EditorShell.tsx` — barra (wordmark + Ajuda/Sobre) + zonas; painel lateral
  (`.editor__side`) = ObjectList + (Propriedades quando objeto livre, senão
  Comentários).

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

- **WP-10 concluído**: Apêndice C fechado — paleta de 5 cores; categoria define
  símbolo+cor do marcador; dois tamanhos de texto (16/28); painel troca para
  propriedades ao selecionar objeto livre (com posição numérica, 12.2).
  Identidade: wordmark na UI, Sobre, onboarding colar/arrastar/escolher. Saída
  permanece neutra (RF-064).
- **WP-04 restante**: redimensionar/rotacionar (RF-027 completo — só posição
  numérica existe); seleção múltipla (RF-026, era "1.1").
- **RF-046** (comentário sem marcador) não implementado.
- **Apêndice C ainda em aberto** (não bloqueiam o MVP): "rabicho" do marcador,
  suavização de desenho livre, edição no mobile, limites de imagem por
  navegador — fechar no WP-11 se necessário.
- **Contraste**: `readableInk` cuida do número do marcador; auditoria de
  contraste da UI como um todo (A11Y-006/008) fica para o WP-11.

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
