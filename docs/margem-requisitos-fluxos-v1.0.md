**OFICINA DIGITAL**

**Margem**

Documento de requisitos e fluxos do produto

*Anote interfaces e imagens, organize comentários e exporte uma
documentação visual --- sem cadastro, sem servidor e sem prender o
trabalho à ferramenta.*

  -----------------------------------------------------------------------
  **VERSÃO**                          1.0 --- especificação do MVP
  ----------------------------------- -----------------------------------
  **DATA**                            14 de julho de 2026

  **IDIOMA**                          Português do Brasil

  **STATUS**                          Pronto para prototipação e
                                      desenvolvimento
  -----------------------------------------------------------------------

*Um produto experimental, gratuito e de código aberto.*

# **0. Como usar este documento**

*Uma especificação suficientemente detalhada para orientar design,
prototipação, implementação e testes.*

Este documento consolida as decisões já tomadas sobre a Margem e traduz
o conceito em requisitos verificáveis. Ele pode ser usado como
referência para criar wireframes, organizar tarefas no GitHub e conduzir
o desenvolvimento com Claude Code.

+-----------------------------------------------------------------------+
| **Decisões já fechadas**                                              |
|                                                                       |
| A ferramenta aceita qualquer tipo de comentário visual; as anotações  |
| podem existir sem comentários; a linguagem visual será gestual e      |
| editorial; os arquivos exportados serão neutros; o produto será       |
| gratuito, aberto, em português do Brasil, sem cadastro e com          |
| processamento local.                                                  |
+=======================================================================+
+-----------------------------------------------------------------------+

## **Leitura recomendada por etapa**

  -----------------------------------------------------------------------
  **Etapa**                           **Seções prioritárias**
  ----------------------------------- -----------------------------------
  Definição do produto                1 a 5

  Wireframes e protótipo              6 a 10

  Desenvolvimento                     11 a 18

  Testes e lançamento                 19 a 22

  Implementação com Claude Code       23 e apêndices
  -----------------------------------------------------------------------

## **Resumo executivo**

Margem é uma aplicação web de uso rápido para anotar capturas de tela,
interfaces, fotografias e outras imagens. O usuário pode adicionar
marcadores, áreas, setas, traços e textos diretamente sobre a imagem;
criar comentários vinculados quando isso fizer sentido; organizar o
material; e exportar o resultado em formatos neutros.

O MVP funciona integralmente no navegador. Nenhum arquivo precisa ser
enviado a um servidor. O projeto pode ser salvo localmente e
transportado por um arquivo próprio, preservando privacidade e
eliminando a necessidade de conta.

## **Sumário**

  -----------------------------------------------------------------------
  1\. Visão do produto                13\. Dados e persistência local
  ----------------------------------- -----------------------------------
  2\. Objetivos e indicadores de      14\. Arquitetura técnica
  sucesso                             

  3\. Usuários e situações de uso     15\. Requisitos não funcionais

  4\. Princípios de produto           16\. Privacidade e segurança

  5\. Escopo do MVP                   17\. Estados, erros e recuperação

  6\. Arquitetura da informação       18\. Exportações

  7\. Fluxos de usuário               19\. Testes e garantia de qualidade

  8\. Requisitos funcionais           20\. Critérios de aceite

  9\. Modelo de interação             21\. Roadmap

  10\. Conteúdo e microcopy           22\. Backlog posterior

  11\. Direção visual                 23\. Plano de implementação

  12\. Acessibilidade                 Apêndices
  -----------------------------------------------------------------------

# **1. Visão do produto**

*O que é a Margem, qual problema resolve e qual papel ocupa na Oficina
Digital.*

## **1.1 Proposta de valor**

+-----------------------------------------------------------------------+
| **Proposta central**                                                  |
|                                                                       |
| Cole uma imagem, marque o que importa, escreva apenas quando precisar |
| e exporte o resultado. A Margem reduz a distância entre perceber algo |
| visualmente e transformá-lo em uma documentação compartilhável.       |
+=======================================================================+
+-----------------------------------------------------------------------+

## **1.2 Problema**

Comentários visuais simples frequentemente exigem ferramentas maiores do
que a tarefa. Para apontar detalhes em uma interface, revisar uma
composição, explicar uma correção ou registrar uma observação, o usuário
costuma recorrer a editores genéricos, apresentações, documentos ou
plataformas colaborativas que adicionam atrito, exigem conta ou
dificultam a exportação.

A Margem atende o momento intermediário entre a captura de tela e a
conversa: transforma uma imagem em um artefato claro, numerado e
transportável, sem impor um processo único de trabalho.

## **1.3 Posicionamento**

  -----------------------------------------------------------------------
  **A Margem é**                      **A Margem não é**
  ----------------------------------- -----------------------------------
  Um anotador visual rápido e local   Um editor gráfico completo

  Uma ferramenta para comentários     Uma plataforma de gestão de tarefas
  livres                              

  Um meio de criar documentação       Um sistema de colaboração em tempo
  neutra                              real

  Um projeto experimental e de código Um serviço que depende de conta ou
  aberto                              assinatura

  Uma demonstração de produto,        Uma tentativa de substituir Figma,
  interface e front-end               Miro ou ferramentas de issue
                                      tracking
  -----------------------------------------------------------------------

## **1.4 Tese de design**

A Margem parte da ideia de que a anotação é um gesto editorial:
selecionar, enquadrar, sublinhar, relacionar e acrescentar contexto. A
interface deve parecer precisa o bastante para uso profissional e humana
o bastante para não transformar toda observação em um formulário
burocrático.

# **2. Objetivos e indicadores de sucesso**

## **2.1 Objetivos do MVP**

-   Permitir que uma pessoa produza uma imagem anotada útil em poucos
    minutos.

-   Aceitar anotações livres e comentários estruturados sem obrigar o
    vínculo entre ambos.

-   Demonstrar habilidades de UX, UI, interação, acessibilidade e
    desenvolvimento front-end.

-   Funcionar sem cadastro, sem servidor e sem modelos de IA.

-   Gerar arquivos neutros, adequados para uso profissional fora da
    Margem.

-   Oferecer código aberto, documentação clara e uma base evolutiva para
    a Oficina Digital.

## **2.2 Indicadores para validação**

  -----------------------------------------------------------------------
  **Indicador**           **Meta inicial**        **Como observar**
  ----------------------- ----------------------- -----------------------
  Tempo até a primeira    Até 60 segundos para    Teste moderado ou
  anotação                quem entra pela         gravação local de
                          primeira vez            tarefa

  Conclusão do fluxo      Pelo menos 80% dos      Teste de usabilidade
  principal               participantes conseguem com 5 a 8 pessoas
                          importar, anotar e      
                          exportar sem ajuda      

  Dependência de          Nenhuma etapa essencial Observação de
  instruções              exige tutorial externo  hesitações e perguntas

  Acessibilidade por      Fluxo essencial         Roteiro manual e testes
  teclado                 completo sem mouse      automatizados

  Integridade do arquivo  Resultado visual        Comparação de saída em
  exportado               equivalente ao canvas e navegadores suportados
                          texto completo no       
                          Markdown                

  Privacidade             Zero upload de imagens  Inspeção de rede e
                          em uso padrão           documentação técnica
  -----------------------------------------------------------------------

## **2.3 Métricas que não devem orientar o produto**

Número de contas, tempo de permanência e retenção diária não são metas
do MVP. A ferramenta deve respeitar o uso pontual: entrar, resolver e
sair. Caso sejam adotadas métricas públicas, elas devem ser agregadas,
opcionais e sem registrar imagens ou conteúdo de comentários.

# **3. Usuários e situações de uso**

## **3.1 Usuário principal**

O próprio criador da ferramenta é o usuário de referência: um designer
que transita entre produto, tecnologia, inovação e experimentação;
trabalha com documentação visual; prefere utilitários rápidos; e
valoriza privacidade, acessibilidade e autonomia.

## **3.2 Usuários secundários**

  -----------------------------------------------------------------------
  **Perfil**              **Necessidade típica**  **Exemplo de uso**
  ----------------------- ----------------------- -----------------------
  Designer de produto     Explicar ajustes,       Anotar uma tela antes
                          estados e               do handoff
                          inconsistências         

  Designer gráfico        Comentar composição,    Revisar uma peça ou
                          hierarquia e acabamento identidade

  Desenvolvedor           Registrar bugs ou       Apontar desalinhamentos
                          diferenças visuais      em uma captura

  Pesquisador ou          Organizar evidências    Marcar pontos
  facilitador             visuais                 observados em uma
                                                  sessão

  Professor, estudante ou Fazer observações sobre Criar uma devolutiva
  revisor                 imagens e materiais     visual

  Pessoa de produto ou    Comunicar mudanças sem  Preparar uma imagem
  inovação                abrir uma ferramenta    para discussão rápida
                          complexa                
  -----------------------------------------------------------------------

## **3.3 Trabalhos a realizar**

-   Quando eu perceber algo em uma imagem, quero apontá-lo com clareza
    para que outra pessoa entenda rapidamente.

-   Quando eu tiver várias observações, quero organizá-las sem poluir
    visualmente a imagem.

-   Quando eu não precisar escrever, quero apenas desenhar, destacar ou
    relacionar elementos.

-   Quando eu terminar, quero baixar um resultado neutro que possa ser
    usado em qualquer canal.

-   Quando eu precisar continuar depois, quero salvar o projeto sem
    criar uma conta.

-   Quando eu estiver usando teclado ou tecnologia assistiva, quero
    acessar as funções essenciais sem perder contexto.

## **3.4 Contextos fora de escopo**

-   Edição fotográfica avançada ou tratamento de imagem.

-   Revisão simultânea por várias pessoas.

-   Gestão de comentários, responsáveis, prazos ou status de aprovação.

-   Armazenamento centralizado de bibliotecas de projetos.

-   Processamento de documentos sigilosos em infraestrutura externa.

# **4. Princípios de produto**

  -----------------------------------------------------------------------
  **Princípio**                       **Implicação**
  ----------------------------------- -----------------------------------
  Local por padrão                    Imagens, comentários e projetos
                                      permanecem no dispositivo durante o
                                      uso padrão.

  Começar sem cerimônia               A primeira ação deve ser colar,
                                      arrastar ou selecionar uma imagem.
                                      Nenhum cadastro ou configuração
                                      prévia.

  Liberdade com estrutura opcional    O usuário pode anotar livremente;
                                      comentários vinculados aparecem
                                      quando agregam valor, não como
                                      obrigação.

  Uma tarefa delimitada               O produto evita funcionalidades de
                                      colaboração, gestão e edição que
                                      diluam a proposta.

  Saída acima da permanência          O resultado exportado deve
                                      continuar útil fora da aplicação.

  Gestual, não impreciso              A identidade editorial pode ter
                                      traços humanos, mas seleção,
                                      alinhamento e exportação devem ser
                                      confiáveis.

  Acessibilidade demonstrável         A interface deve servir como
                                      exemplo de foco, semântica,
                                      contraste, atalhos e alternativas
                                      textuais.

  Código legível e aberto             A arquitetura deve favorecer
                                      estudo, contribuição e manutenção.
  -----------------------------------------------------------------------

# **5. Escopo do MVP**

## **5.1 Funcionalidades incluídas**

-   Importação de uma imagem por projeto: PNG, JPEG e WebP.

-   Entrada por seletor de arquivo, arrastar e soltar e colar da área de
    transferência.

-   Ferramentas: seleção, marcador numerado, retângulo/área, seta,
    desenho livre, texto e mover canvas.

-   Comentários opcionais vinculados aos marcadores numerados.

-   Anotações livres que não geram comentário automaticamente.

-   Edição de posição, tamanho, direção, espessura, cor e conteúdo
    conforme o tipo de objeto.

-   Painel de comentários com título, descrição, categoria opcional e
    reordenação.

-   Desfazer e refazer.

-   Zoom, ajuste à tela e pan.

-   Salvamento automático local do projeto em andamento.

-   Exportação em PNG, Markdown e arquivo de projeto .margem.

-   Importação de arquivo .margem.

-   Novo projeto e limpeza explícita dos dados locais.

-   Atalhos de teclado e foco visível.

-   Página Sobre/Privacidade e acesso ao repositório.

## **5.2 Funcionalidades excluídas do MVP**

-   Múltiplas imagens ou páginas no mesmo projeto.

-   PDF multipágina como entrada ou saída.

-   Colaboração, comentários de terceiros e links compartilháveis.

-   Autenticação, banco de dados remoto ou sincronização entre
    dispositivos.

-   Histórico de versões persistente.

-   Exportação para Figma, Jira, Notion ou ferramentas externas.

-   Reconhecimento automático de elementos ou análise por IA.

-   Aplicativo móvel dedicado.

-   Ferramentas avançadas de desenho, tipografia ou edição de pixels.

## **5.3 Prioridades MoSCoW**

  -----------------------------------------------------------------------
  **Prioridade**                      **Itens**
  ----------------------------------- -----------------------------------
  Must                                Importar imagem;
                                      criar/editar/excluir anotações;
                                      comentários vinculados;
                                      desfazer/refazer; zoom/pan;
                                      exportar PNG/Markdown/.margem;
                                      persistência local; uso por
                                      teclado.

  Should                              Categorias de comentário;
                                      reordenação; paleta curta de
                                      estilos; colar imagem; atalhos
                                      exibidos; aviso de recuperação de
                                      sessão.

  Could                               Grade/alinhamento; duplicar objeto;
                                      estilos salvos; exportar pacote
                                      ZIP; tema escuro; régua e
                                      coordenadas.

  Won't no MVP                        Colaboração, login, múltiplas
                                      páginas, PDF, integrações, IA e
                                      armazenamento remoto.
  -----------------------------------------------------------------------

# **6. Arquitetura da informação**

## **6.1 Estrutura da aplicação**

  -----------------------------------------------------------------------
  **Área**                            **Conteúdo e ações**
  ----------------------------------- -----------------------------------
  Tela inicial vazia                  Identidade da ferramenta, três
                                      formas de importar imagem,
                                      privacidade local e links
                                      secundários.

  Editor                              Barra superior, barra de
                                      ferramentas, canvas, painel de
                                      comentários e mensagens de estado.

  Modal Exportar                      Formatos, opções específicas,
                                      prévia resumida e ação de download.

  Modal Projeto                       Novo, abrir .margem, salvar
                                      .margem, limpar dados locais e
                                      informações da sessão.

  Ajuda rápida                        Atalhos, descrição das ferramentas
                                      e princípios de privacidade.

  Sobre                               Objetivo, autoria, licença,
                                      tecnologias, repositório e
                                      limitações.
  -----------------------------------------------------------------------

## **6.2 Layout do editor**

O editor adota uma estrutura de quatro zonas: barra superior para ações
globais; barra vertical para ferramentas; canvas central; e painel
lateral para comentários e propriedades. O painel lateral muda de
contexto sem alterar sua posição: mostra comentários quando nada está
selecionado e propriedades quando um objeto está selecionado.

![Wireframe do editor da Margem com barra superior, ferramentas à
esquerda, imagem anotada ao centro e painel de comentários à
direita.](media/image1.png "Wireframe do editor da Margem com barra superior, ferramentas à esquerda, imagem anotada ao centro e painel de comentários à direita."){width="6.35in"
height="3.81in"}

Figura 1 --- Wireframe de referência para a composição do editor. O
desenho é indicativo; não define o acabamento visual final.

## **6.3 Hierarquia de navegação**

-   Ações globais sempre visíveis: projeto, desfazer/refazer, zoom e
    exportar.

-   Ferramentas agrupadas verticalmente e identificadas por ícone, nome
    acessível e tooltip com atalho.

-   Canvas recebe foco como região de trabalho, mas não captura atalhos
    de forma que impeça navegação geral.

-   Painel lateral mantém os comentários em ordem de leitura e oferece
    acesso direto ao objeto correspondente.

-   Mensagens temporárias aparecem em região de status anunciada a
    tecnologias assistivas.

# **7. Fluxos de usuário**

## **7.1 Fluxo principal**

![Fluxo principal do MVP: abrir a Margem, importar imagem, criar
anotações, adicionar comentários opcionais, revisar e exportar ou
salvar.](media/image2.png "Fluxo principal do MVP: abrir a Margem, importar imagem, criar anotações, adicionar comentários opcionais, revisar e exportar ou salvar."){width="6.25in"
height="0.6154877515310586in"}

Figura 2 --- Sequência essencial: importar, anotar, comentar
opcionalmente, revisar e exportar.

## **7.2 Primeira entrada e importação**

![Fluxo de importação: escolher imagem, validar formato e tamanho,
preparar a área de trabalho ou informar correção e tentar
novamente.](media/image3.png "Fluxo de importação: escolher imagem, validar formato e tamanho, preparar a área de trabalho ou informar correção e tentar novamente."){width="5.6in"
height="4.801540901137358in"}

Figura 3 --- Fluxo de importação com validação e recuperação.

1.  Usuário abre a aplicação e encontra uma área de entrada central.

2.  Pode colar uma imagem, arrastá-la ou abrir o seletor de arquivos.

3.  A aplicação valida formato, dimensões e memória estimada.

4.  Em caso válido, prepara o canvas, ajusta a imagem à janela e cria a
    sessão local.

5.  Em caso inválido, mantém a tela inicial e informa como corrigir.

## **7.3 Criar e editar anotações**

![Fluxo de criação de anotação: escolher ferramenta, criar objeto,
vincular comentário apenas ao marcador, editar e
concluir.](media/image4.png "Fluxo de criação de anotação: escolher ferramenta, criar objeto, vincular comentário apenas ao marcador, editar e concluir."){width="5.5in"
height="8.088687664041995in"}

Figura 4 --- Marcadores geram comentários; os demais objetos podem
permanecer livres.

O vínculo automático deve ocorrer apenas no marcador numerado, pois ele
funciona como referência entre imagem e lista. Área, seta, desenho e
texto podem ser criados sem abrir um formulário. O usuário ainda pode
vincular qualquer objeto a um comentário manualmente em uma versão
posterior.

## **7.4 Exportar e salvar**

![Fluxo de exportação: escolher PNG, Markdown ou projeto Margem,
validar, gerar arquivo localmente e concluir o
download.](media/image5.png "Fluxo de exportação: escolher PNG, Markdown ou projeto Margem, validar, gerar arquivo localmente e concluir o download."){width="5.6in"
height="5.85in"}

Figura 5 --- Seleção de formato, validação e geração inteiramente local.

## **7.5 Fluxo essencial por teclado**

![Fluxo essencial sem mouse: entrar por teclado, pular para a área
principal, selecionar ferramenta, criar ou selecionar anotação, editar e
exportar.](media/image6.png "Fluxo essencial sem mouse: entrar por teclado, pular para a área principal, selecionar ferramenta, criar ou selecionar anotação, editar e exportar."){width="6.2in"
height="0.571907261592301in"}

Figura 6 --- Caminho mínimo para uso sem mouse.

## **7.6 Recuperar sessão**

6.  Ao abrir a aplicação, o sistema verifica se existe um projeto local
    não encerrado.

7.  Se existir, oferece: "Continuar projeto" ou "Começar novo".

8.  A escolha não deve apagar dados sem confirmação.

9.  Projetos recuperados mantêm zoom, posição do canvas, objetos,
    comentários e preferências essenciais.

# **8. Requisitos funcionais**

Os requisitos abaixo recebem identificadores para facilitar issues,
commits, testes e critérios de aceite. "Obrigatório no MVP" significa
que a primeira versão pública não deve ser lançada sem o item.

## **8.1 Entrada e projeto**

  -----------------------------------------------------------------------
  **ID**                  **Requisito**           **MVP**
  ----------------------- ----------------------- -----------------------
  RF-001                  Exibir tela inicial com Obrigatório
                          ações para colar,       
                          arrastar ou selecionar  
                          uma imagem.             

  RF-002                  Aceitar PNG, JPEG e     Obrigatório
                          WebP.                   

  RF-003                  Rejeitar arquivos       Obrigatório
                          incompatíveis sem       
                          recarregar a página ou  
                          perder a sessão         
                          existente.              

  RF-004                  Informar limite         Obrigatório
                          recomendado de          
                          dimensões e memória     
                          antes de falhar         
                          silenciosamente.        

  RF-005                  Criar apenas uma        Obrigatório
                          imagem-base por projeto 
                          no MVP.                 

  RF-006                  Permitir iniciar novo   Obrigatório
                          projeto com confirmação 
                          quando houver conteúdo  
                          não exportado.          

  RF-007                  Importar arquivo        Obrigatório
                          .margem validando       
                          versão e integridade.   
  -----------------------------------------------------------------------

## **8.2 Canvas e navegação**

  -----------------------------------------------------------------------
  **ID**                  **Requisito**           **MVP**
  ----------------------- ----------------------- -----------------------
  RF-010                  Exibir imagem-base      Obrigatório
                          centralizada e ajustada 
                          à área disponível.      

  RF-011                  Permitir zoom por       Obrigatório
                          controles, roda do      
                          mouse com modificador e 
                          atalhos.                

  RF-012                  Permitir pan com        Obrigatório
                          ferramenta Mover, barra 
                          de espaço temporária e  
                          gesto de trackpad       
                          quando possível.        

  RF-013                  Oferecer "Ajustar à     Obrigatório
                          tela" e "100%".         

  RF-014                  Preservar a relação     Obrigatório
                          espacial entre imagem e 
                          anotações em qualquer   
                          nível de zoom.          

  RF-015                  Indicar limites da      Obrigatório
                          imagem e área externa   
                          do canvas.              
  -----------------------------------------------------------------------

## **8.3 Objetos de anotação**

  -----------------------------------------------------------------------
  **ID**                  **Requisito**           **MVP**
  ----------------------- ----------------------- -----------------------
  RF-020                  Criar marcador numerado Obrigatório
                          por clique ou           
                          acionamento equivalente 
                          por teclado.            

  RF-021                  Numerar marcadores      Obrigatório
                          automaticamente de      
                          acordo com a ordem dos  
                          comentários.            

  RF-022                  Criar retângulo/área    Obrigatório
                          por arraste.            

  RF-023                  Criar seta por arraste  Obrigatório
                          entre origem e destino. 

  RF-024                  Criar traço livre por   Obrigatório
                          ponteiro, com           
                          simplificação moderada  
                          da curva.               

  RF-025                  Criar texto curto       Obrigatório
                          diretamente no canvas.  

  RF-026                  Selecionar um ou vários Parcial
                          objetos; seleção        
                          múltipla pode ficar     
                          para versão 1.1.        

  RF-027                  Mover, redimensionar e  Obrigatório
                          rotacionar objetos      
                          quando aplicável.       

  RF-028                  Editar cor, espessura e Obrigatório
                          opacidade dentro de     
                          opções pré-definidas.   

  RF-029                  Duplicar e excluir      Recomendado
                          objetos selecionados.   

  RF-030                  Manter anotações livres Obrigatório
                          sem exigir comentário.  
  -----------------------------------------------------------------------

## **8.4 Comentários**

  -----------------------------------------------------------------------
  **ID**                  **Requisito**           **MVP**
  ----------------------- ----------------------- -----------------------
  RF-040                  Criar cartão de         Obrigatório
                          comentário              
                          automaticamente ao      
                          inserir marcador.       

  RF-041                  Permitir título curto e Obrigatório
                          descrição longa.        

  RF-042                  Permitir categoria      Recomendado
                          opcional: observação,   
                          problema, dúvida ou     
                          sugestão.               

  RF-043                  Reordenar comentários e Obrigatório
                          renumerar marcadores    
                          correspondentes.        

  RF-044                  Ao selecionar           Obrigatório
                          comentário, destacar e  
                          enquadrar o marcador    
                          correspondente.         

  RF-045                  Ao selecionar marcador, Obrigatório
                          abrir o comentário      
                          correspondente.         

  RF-046                  Permitir comentário sem Recomendado
                          marcador apenas como    
                          item de documentação.   

  RF-047                  Excluir marcador e      Obrigatório
                          comentário em conjunto, 
                          com possibilidade de    
                          desfazer.               
  -----------------------------------------------------------------------

## **8.5 Histórico e persistência**

  -----------------------------------------------------------------------
  **ID**                  **Requisito**           **MVP**
  ----------------------- ----------------------- -----------------------
  RF-050                  Desfazer e refazer      Obrigatório
                          criação, transformação, 
                          estilo, texto, ordem e  
                          exclusão.               

  RF-051                  Manter histórico mínimo Recomendado
                          de 50 ações ou até      
                          limite seguro de        
                          memória.                

  RF-052                  Salvar automaticamente  Obrigatório
                          o projeto local após    
                          período breve de        
                          inatividade.            

  RF-053                  Exibir estado de        Obrigatório
                          salvamento: salvando,   
                          salvo localmente ou     
                          falha.                  

  RF-054                  Recuperar projeto local Obrigatório
                          após fechamento         
                          inesperado.             

  RF-055                  Permitir limpar         Obrigatório
                          explicitamente dados    
                          locais.                 
  -----------------------------------------------------------------------

## **8.6 Exportação**

  -----------------------------------------------------------------------
  **ID**                  **Requisito**           **MVP**
  ----------------------- ----------------------- -----------------------
  RF-060                  Exportar PNG com imagem Obrigatório
                          e anotações no tamanho  
                          original da             
                          imagem-base.            

  RF-061                  Oferecer opção de       Recomendado
                          incluir ou excluir o    
                          fundo externo ao limite 
                          da imagem; padrão:      
                          excluir.                

  RF-062                  Exportar Markdown com   Obrigatório
                          título do projeto,      
                          lista numerada e textos 
                          completos.              

  RF-063                  Exportar projeto        Obrigatório
                          .margem contendo        
                          imagem, objetos,        
                          comentários,            
                          preferências e versão   
                          do schema.              

  RF-064                  Não inserir marca, nome Obrigatório
                          do autor, URL ou marca  
                          d'água nas saídas.      

  RF-065                  Gerar os arquivos       Obrigatório
                          localmente e iniciar    
                          download apenas após    
                          ação explícita.         

  RF-066                  Usar nomes de arquivo   Obrigatório
                          previsíveis e           
                          editáveis.              
  -----------------------------------------------------------------------

## **8.7 Ajuda e informações**

  -----------------------------------------------------------------------
  **ID**                  **Requisito**           **MVP**
  ----------------------- ----------------------- -----------------------
  RF-070                  Exibir atalhos nos      Obrigatório
                          tooltips e em um painel 
                          de ajuda.               

  RF-071                  Disponibilizar          Obrigatório
                          descrição curta de      
                          privacidade na tela     
                          inicial.                

  RF-072                  Disponibilizar página   Obrigatório
                          Sobre com licença,      
                          repositório,            
                          tecnologias e           
                          limitações.             

  RF-073                  Apresentar mensagens de Obrigatório
                          erro acionáveis em      
                          português do Brasil.    
  -----------------------------------------------------------------------

# **9. Modelo de interação**

## **9.1 Seleção**

-   Clique seleciona um objeto; clique em área vazia remove a seleção.

-   A seleção deve ser perceptível por contorno, alças e indicação
    textual no painel.

-   Objetos pequenos mantêm uma área de clique mínima maior que sua
    forma visível.

-   Esc cancela criação em andamento; novo Esc remove seleção; o
    comportamento deve ser previsível e documentado.

-   Delete ou Backspace exclui o objeto apenas quando o foco não está em
    um campo de texto.

## **9.2 Ferramentas e persistência de modo**

Após criar um objeto, a ferramenta retorna para Selecionar por padrão.
Desenho livre pode permanecer ativo enquanto o usuário continua
desenhando. Um duplo clique ou atalho equivalente pode "fixar"
temporariamente uma ferramenta, mas isso não é necessário para o
primeiro lançamento.

## **9.3 Comportamento por objeto**

  -----------------------------------------------------------------------
  **Objeto**        **Criação**       **Edição          **Relação com
                                      principal**       comentários**
  ----------------- ----------------- ----------------- -----------------
  Marcador          Clique no ponto   Mover; alterar    Cria comentário
                                      símbolo/cor;      vinculado
                                      renumerar por     
                                      ordem             

  Área              Arraste diagonal  Mover;            Livre
                                      redimensionar;    
                                      cor; espessura;   
                                      opacidade         

  Seta              Arraste da origem Mover             Livre
                    ao destino        extremidades;     
                                      espessura; ponta; 
                                      cor               

  Desenho           Traço contínuo    Mover; cor;       Livre
                                      espessura;        
                                      excluir           

  Texto             Clique e          Editar conteúdo;  Livre
                    digitação         tamanho;          
                                      alinhamento; cor  
  -----------------------------------------------------------------------

## **9.4 Gestos e atalhos principais**

  -----------------------------------------------------------------------
  **Ação**                **Mouse/trackpad**      **Teclado**
  ----------------------- ----------------------- -----------------------
  Selecionar              Clique                  Tab até objeto/lista +
                                                  Enter

  Mover canvas            Arraste com ferramenta  Espaço + setas;
                          Mover ou espaço         alternativa por
                                                  controles

  Zoom                    Controles ou gesto com  \+ / -; 0 para ajustar;
                          modificador             1 para 100%

  Desfazer/refazer        Botões                  Ctrl/Cmd+Z;
                                                  Ctrl/Cmd+Shift+Z

  Excluir                 Menu/tecla              Delete/Backspace fora
                                                  de campos

  Duplicar                Menu contextual         Ctrl/Cmd+D

  Exportar                Botão                   Ctrl/Cmd+E

  Salvar projeto          Menu Projeto            Ctrl/Cmd+S gera .margem

  Ajuda                   Botão                   ?
  -----------------------------------------------------------------------

# **10. Conteúdo e microcopy**

## **10.1 Tom de voz**

O texto deve ser direto, claro e levemente editorial. A ferramenta não
precisa soar corporativa nem excessivamente informal. Evitar jargão
técnico quando uma ação cotidiana descreve melhor o que acontece.

  -----------------------------------------------------------------------
  **Princípio**           **Preferir**            **Evitar**
  ----------------------- ----------------------- -----------------------
  Ação concreta           "Cole uma imagem para   "Inicialize um novo
                          começar"                documento"

  Privacidade objetiva    "A imagem fica neste    "Sua privacidade é
                          navegador"              nossa prioridade"

  Erro acionável          "Este formato não é     "Erro 415"
                          aceito. Use PNG, JPEG   
                          ou WebP."               

  Saída clara             "Baixar imagem anotada" "Renderizar composição"

  Estado local            "Salvo neste navegador" "Sincronizado"
  -----------------------------------------------------------------------

## **10.2 Textos essenciais**

  -----------------------------------------------------------------------
  **Contexto**                        **Texto recomendado**
  ----------------------------------- -----------------------------------
  Tela vazia --- título               Traga uma imagem para a margem.

  Tela vazia --- apoio                Cole, arraste ou escolha um arquivo
                                      PNG, JPEG ou WebP.

  Privacidade                         A imagem e as anotações ficam neste
                                      navegador.

  Botão principal                     Escolher imagem

  Estado de salvamento                Salvo neste navegador

  Canvas sem comentário               Esta anotação não tem comentário
                                      --- e não precisa ter.

  Exportar PNG                        Baixar imagem anotada

  Exportar Markdown                   Baixar comentários em Markdown

  Salvar projeto                      Baixar projeto .margem

  Recuperação                         Há um projeto salvo neste
                                      navegador. Continuar de onde parou?

  Confirmação de novo projeto         Começar de novo apaga o projeto
                                      salvo neste navegador. Baixe uma
                                      cópia antes, se precisar.
  -----------------------------------------------------------------------

## **10.3 Categorias opcionais**

  -----------------------------------------------------------------------
  **Categoria**           **Símbolo sugerido**    **Uso**
  ----------------------- ----------------------- -----------------------
  Observação              Círculo                 Comentário informativo
                                                  ou descritivo

  Problema                Triângulo               Algo que precisa ser
                                                  corrigido ou
                                                  investigado

  Dúvida                  Losango                 Questão aberta ou ponto
                                                  a confirmar

  Sugestão                Quadrado                Possibilidade de
                                                  melhoria sem caráter
                                                  obrigatório
  -----------------------------------------------------------------------

# **11. Direção visual**

## **11.1 Conceito**

A identidade da Margem deve evocar revisão editorial, provas gráficas,
anotações manuscritas, sinais de correção e comentários nas bordas de
uma página. Essa referência aparece nos objetos de anotação e nos
detalhes da interface, não em uma simulação literal de papel.

## **11.2 Equilíbrio visual**

  -----------------------------------------------------------------------
  **Gestual/editorial**               **Preciso/digital**
  ----------------------------------- -----------------------------------
  Traços com pequenas variações e     Handles, hit areas e alinhamento
  terminações orgânicas               matematicamente consistentes

  Marcadores que lembram carimbos ou  Numeração inequívoca e alto
  sinais de revisão                   contraste

  Setas com personalidade             Ponta e direção legíveis em
                                      qualquer escala

  Tipografia de destaque com presença Textos de interface em sans-serif
  editorial                           legível

  Cor de anotação expressiva          Paleta curta e previsível
  -----------------------------------------------------------------------

## **11.3 Sistema visual recomendado**

-   Base neutra, quente e pouco saturada para a interface, deixando a
    imagem do usuário no centro.

-   Uma cor principal de anotação forte; opções secundárias limitadas e
    acessíveis.

-   Tipografia serifada apenas em marca, títulos editoriais e mensagens
    de entrada; sans-serif nas funções.

-   Ícones simples, acompanhados de rótulos acessíveis e tooltips.

-   Bordas e divisões leves; o canvas deve ser a área de maior contraste
    estrutural.

-   Evitar texturas pesadas, sombras excessivas, ruído visual e
    metáforas físicas que prejudiquem leitura.

## **11.4 Exportação neutra**

+-----------------------------------------------------------------------+
| **Regra de neutralidade**                                             |
|                                                                       |
| A identidade da Margem pertence à aplicação. O PNG, o Markdown e o    |
| arquivo de projeto não devem incluir logotipo, assinatura, URL,       |
| rodapé promocional ou marca d'água. Atribuição pode existir apenas na |
| página Sobre e no repositório.                                        |
+=======================================================================+
+-----------------------------------------------------------------------+

# **12. Acessibilidade**

A implementação deve usar como referência o nível AA da WCAG 2.2,
complementado por testes reais com teclado, leitores de tela e
diferentes níveis de zoom. A área gráfica exige soluções equivalentes em
texto; não basta tornar os botões acessíveis.

## **12.1 Requisitos de interface**

  -----------------------------------------------------------------------
  **ID**                              **Requisito**
  ----------------------------------- -----------------------------------
  A11Y-001                            Todas as ações essenciais devem
                                      funcionar por teclado.

  A11Y-002                            Foco visível, consistente e não
                                      oculto por painéis ou modais.

  A11Y-003                            Ordem de foco acompanha barra
                                      superior, ferramentas, canvas e
                                      painel lateral de forma previsível.

  A11Y-004                            Botões têm nome acessível; ícones
                                      decorativos são ignorados por
                                      leitor de tela.

  A11Y-005                            Tooltips não são a única fonte de
                                      informação.

  A11Y-006                            Cor não é o único meio de
                                      diferenciar categoria, seleção,
                                      erro ou status.

  A11Y-007                            Controles mantêm área de
                                      acionamento confortável e
                                      espaçamento suficiente.

  A11Y-008                            Interface permanece operável com
                                      zoom do navegador em 200% e reflow
                                      quando aplicável.

  A11Y-009                            Movimento e animação respeitam
                                      preferência por redução de
                                      movimento.

  A11Y-010                            Mensagens de sucesso e erro são
                                      anunciadas em região de status.
  -----------------------------------------------------------------------

## **12.2 Acessibilidade do canvas**

-   O canvas deve ter nome e instrução breve acessíveis.

-   Cada objeto deve possuir representação no painel ou em uma lista
    navegável, com tipo, número e posição aproximada.

-   A seleção pelo painel deve sincronizar com a seleção visual.

-   Movimentação fina pode ser feita por teclas de seta; Shift aumenta o
    deslocamento.

-   Propriedades numéricas editáveis oferecem alternativa a gestos de
    arrastar.

-   Marcadores e comentários compartilham identificadores consistentes.

-   Desenhos livres podem ser descritos pelo usuário no painel; a
    aplicação não tenta inferir significado.

## **12.3 Atalhos e conflitos**

Atalhos nunca devem interferir com digitação em campos. A aplicação deve
reconhecer Ctrl no Windows/Linux e Cmd no macOS. Atalhos de uma única
letra funcionam apenas quando o foco está no editor, não em formulários
ou modais.

# **13. Dados e persistência local**

## **13.1 Entidades principais**

  -----------------------------------------------------------------------
  **Entidade**                        **Campos mínimos**
  ----------------------------------- -----------------------------------
  Project                             id, schemaVersion, title,
                                      createdAt, updatedAt, image,
                                      viewport, preferences

  ImageAsset                          mimeType, width, height,
                                      originalName, blob/data reference,
                                      checksum opcional

  Annotation                          id, type, geometry, style, zIndex,
                                      createdAt, updatedAt, commentId
                                      opcional

  Comment                             id, markerAnnotationId opcional,
                                      order, title, body, category
                                      opcional

  Viewport                            zoom, panX, panY, fitMode

  Preferences                         última ferramenta, espessura, cor,
                                      redução de movimento, painel aberto
  -----------------------------------------------------------------------

## **13.2 Schema conceitual**

  -----------------------------------------------------------------------
  {\
  \"schemaVersion\": \"1.0\",\
  \"project\": {\
  \"id\": \"uuid\",\
  \"title\": \"Projeto sem título\",\
  \"image\": { \"mimeType\": \"image/png\", \"width\": 1440, \"height\":
  900 },\
  \"annotations\": \[\
  {\
  \"id\": \"annotation-1\",\
  \"type\": \"marker\",\
  \"geometry\": { \"x\": 0.46, \"y\": 0.31 },\
  \"style\": { \"color\": \"#B43A2C\", \"symbol\": \"circle\" },\
  \"commentId\": \"comment-1\"\
  }\
  \],\
  \"comments\": \[\
  { \"id\": \"comment-1\", \"order\": 1, \"title\": \"Ação principal\",
  \"body\": \"\...\" }\
  \]\
  }\
  }
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

Coordenadas geométricas devem ser normalizadas em relação às dimensões
originais da imagem sempre que possível. Isso facilita redimensionamento
do viewport e preserva a exportação no tamanho original.

## **13.3 Estratégia de armazenamento**

-   IndexedDB para projeto, imagem e blobs; localStorage apenas para
    preferências pequenas e sinalizadores.

-   Autosave com debounce após alterações e salvamento imediato antes de
    eventos de fechamento quando possível.

-   Um único projeto recuperável no MVP reduz complexidade e evita uma
    falsa biblioteca de arquivos.

-   Arquivo .margem transporta todos os dados necessários e atua como
    backup explícito.

-   Migrações de schema devem preservar compatibilidade com arquivos
    anteriores ou oferecer mensagem clara quando isso não for possível.

# **14. Arquitetura técnica**

## **14.1 Direção recomendada**

  -----------------------------------------------------------------------
  **Camada**              **Recomendação**        **Motivo**
  ----------------------- ----------------------- -----------------------
  Aplicação               React + TypeScript +    Ecossistema conhecido,
                          Vite, ou equivalente    tipagem e deploy
                          leve                    estático simples

  Canvas                  SVG para objetos sobre  Seleção individual,
                          imagem raster           nitidez, edição e
                                                  exportação previsíveis

  Estado                  Store central pequena   Desfazer/refazer e
                          com histórico de        sincronização
                          comandos                canvas/painel

  Persistência            IndexedDB com wrapper   Blobs, projetos maiores
                          leve                    e recuperação local

  Exportação PNG          Composição via canvas   Saída raster em
                          offscreen a partir da   dimensões originais
                          imagem + objetos SVG    

  Arquivo .margem         ZIP ou container JSON + Transportar projeto
                          imagem                  completo e permitir
                                                  inspeção

  Deploy                  GitHub Pages ou         Sem backend e coerente
                          hospedagem estática     com a Oficina Digital

  Testes                  Vitest + Testing        Unidade, integração e
                          Library + Playwright    fluxos reais
  -----------------------------------------------------------------------

## **14.2 Organização sugerida do código**

  -----------------------------------------------------------------------
  src/\
  app/ \# shell, rotas, providers e layout\
  editor/\
  canvas/ \# viewport, SVG, seleção e objetos\
  tools/ \# select, marker, area, arrow, draw, text, pan\
  comments/ \# painel, vínculo e reordenação\
  history/ \# comandos, undo e redo\
  project/ \# novo, abrir, salvar e migrações\
  export/ \# PNG, Markdown e .margem\
  storage/ \# IndexedDB e recuperação\
  accessibility/ \# atalhos, live regions e helpers\
  ui/ \# componentes visuais reutilizáveis\
  domain/ \# tipos, validação e regras puras\
  tests/
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

## **14.3 Modelo de comandos**

Ações editáveis devem ser representadas como comandos reversíveis: criar
objeto, mover, redimensionar, alterar estilo, editar texto, reordenar
comentário e excluir. Esse modelo reduz inconsistências no histórico e
facilita testes unitários.

## **14.4 Dependências**

Priorizar APIs nativas e dependências pequenas. Bibliotecas de canvas
completas podem acelerar o desenvolvimento, mas devem ser avaliadas pelo
peso, acessibilidade, controle de exportação e facilidade de manutenção.
O projeto deve documentar toda dependência central e o motivo de sua
adoção.

# **15. Requisitos não funcionais**

  -----------------------------------------------------------------------
  **ID**                              **Requisito**
  ----------------------------------- -----------------------------------
  RNF-001                             Aplicação utilizável após
                                      carregamento em conexão comum e
                                      cacheável como site estático.

  RNF-002                             Nenhuma imagem ou comentário
                                      enviado pela rede no fluxo padrão.

  RNF-003                             Operações comuns de mover e
                                      redimensionar mantêm resposta
                                      visual fluida em imagens usuais.

  RNF-004                             Falhas de persistência não podem
                                      apagar silenciosamente a sessão em
                                      memória.

  RNF-005                             Exportação mantém proporções,
                                      coordenadas e espessuras de forma
                                      previsível.

  RNF-006                             Compatibilidade inicial: versões
                                      estáveis recentes de Chrome, Edge,
                                      Firefox e Safari desktop.

  RNF-007                             Interface responsiva até tablets,
                                      com edição completa priorizada para
                                      desktop.

  RNF-008                             Código TypeScript sem erros, lint
                                      configurado e build reproduzível.

  RNF-009                             Cobertura de testes concentrada nas
                                      regras de domínio e fluxos
                                      críticos, não em porcentagem
                                      arbitrária.

  RNF-010                             Erros não previstos devem ser
                                      registrados localmente no console
                                      sem incluir conteúdo do usuário em
                                      telemetria.

  RNF-011                             Downloads utilizam nomes seguros e
                                      não executáveis.

  RNF-012                             Aplicação permite apagar todos os
                                      dados locais em uma ação explícita.
  -----------------------------------------------------------------------

## **15.1 Limites técnicos iniciais**

O MVP deve comunicar limites de forma transparente em vez de prometer
suporte irrestrito. Recomenda-se iniciar com imagens de até 12.000 ×
12.000 pixels e tamanho de arquivo de até 25 MB, tratando esses valores
como limites configuráveis após testes de memória em diferentes
navegadores.

+-----------------------------------------------------------------------+
| **Decisão a validar tecnicamente**                                    |
|                                                                       |
| Os limites acima são pontos de partida, não compromissos finais. O    |
| desenvolvimento deve testar uso de memória, exportação e recuperação  |
| em máquinas medianas antes da publicação.                             |
+=======================================================================+
+-----------------------------------------------------------------------+

# **16. Privacidade e segurança**

## **16.1 Modelo de privacidade**

-   Processamento local por padrão e ausência de backend no MVP.

-   Nenhuma coleta de imagem, texto de comentário, nome de arquivo ou
    projeto.

-   Aviso claro de que dados permanecem no navegador até serem apagados
    ou substituídos.

-   Exportação ocorre apenas por ação explícita do usuário.

-   Código aberto permite auditoria do comportamento da aplicação.

## **16.2 Controles de segurança**

-   Validar MIME type e assinatura básica dos arquivos, sem confiar
    apenas na extensão.

-   Sanitizar textos ao gerar Markdown, HTML de interface ou nomes de
    arquivo.

-   Não executar SVG enviado como documento ativo no MVP; SVG não é
    formato de entrada inicial.

-   Usar Content Security Policy compatível com deploy estático quando
    possível.

-   Evitar dependências que enviem telemetria automaticamente.

-   Impedir que o arquivo .margem inclua caminhos locais, metadados
    desnecessários ou dados externos ao projeto.

## **16.3 Texto curto de privacidade**

+-----------------------------------------------------------------------+
| **Texto recomendado**                                                 |
|                                                                       |
| Seus arquivos não são enviados. A Margem processa a imagem e salva o  |
| projeto neste navegador. Você pode baixar uma cópia ou apagar os      |
| dados locais a qualquer momento.                                      |
+=======================================================================+
+-----------------------------------------------------------------------+

# **17. Estados, erros e recuperação**

## **17.1 Estados globais**

  -----------------------------------------------------------------------
  **Estado**                          **Comportamento esperado**
  ----------------------------------- -----------------------------------
  Vazio                               Mostrar entrada de imagem,
                                      privacidade e ajuda mínima.

  Carregando imagem                   Indicar processamento; permitir
                                      cancelar quando possível.

  Editando                            Canvas ativo, autosave e histórico
                                      disponíveis.

  Salvando                            Indicador discreto; edição
                                      continua.

  Falha ao salvar                     Manter dados em memória, informar
                                      risco e oferecer baixar .margem.

  Exportando                          Bloquear apenas a ação duplicada;
                                      manter aplicação responsiva.

  Falha ao exportar                   Explicar causa provável, preservar
                                      projeto e oferecer nova tentativa.

  Recuperação disponível              Exibir escolha entre continuar e
                                      começar novo.
  -----------------------------------------------------------------------

## **17.2 Erros previstos**

  -----------------------------------------------------------------------
  **Situação**            **Mensagem**            **Recuperação**
  ----------------------- ----------------------- -----------------------
  Arquivo incompatível    "Este formato não é     Manter tela anterior
                          aceito. Use PNG, JPEG   
                          ou WebP."               

  Imagem grande demais    "A imagem é grande      Não importar; explicar
                          demais para este        limite
                          navegador. Tente uma    
                          versão menor."          

  Arquivo .margem         "Não foi possível abrir Não substituir sessão
  inválido                este projeto. O arquivo atual
                          pode estar incompleto   
                          ou ser de outra         
                          versão."                

  Espaço local            "Não foi possível       Oferecer .margem
  insuficiente            salvar neste navegador. 
                          Baixe o projeto para    
                          não perder o trabalho." 

  Falha ao gerar PNG      "A imagem não pôde ser  Tentar novamente;
                          gerada. O projeto       sugerir reduzir tamanho
                          continua aberto."       

  Área de transferência   "Não encontramos uma    Manter foco e orientar
  sem imagem              imagem para colar."     
  -----------------------------------------------------------------------

## **17.3 Proteção contra perda**

-   Autosave local após mudanças significativas.

-   Confirmação antes de novo projeto, abrir outro arquivo ou limpar
    dados quando houver alterações recentes.

-   Desfazer disponível após exclusão de objeto ou comentário.

-   Falha de persistência gera recomendação imediata de baixar .margem.

-   Abertura de arquivo incompatível nunca substitui o projeto em
    memória antes da validação completa.

# **18. Exportações**

## **18.1 PNG**

-   Usar dimensões originais da imagem-base, independentemente do zoom
    atual.

-   Incluir apenas a imagem e objetos visíveis; nunca incluir seleção,
    alças, guias ou interface.

-   Preservar transparência quando a imagem-base permitir; caso
    contrário, manter fundo original.

-   Aplicar espessuras relativas coerentes com a escala de exportação.

-   Usar nome padrão: margem-AAAA-MM-DD-HHMM.png, editável no modal.

## **18.2 Markdown**

O Markdown deve ser legível sem a aplicação e não depender de sintaxe
proprietária. Comentários sem título usam "Comentário 01". Categorias
aparecem como texto opcional. Anotações livres sem comentário não
precisam constar no arquivo textual.

  -----------------------------------------------------------------------
  \# Projeto sem título\
  \
  Imagem de referência: \`captura-home.png\`\
  Exportado em: 14/07/2026, 21:30\
  \
  \## 01 --- Ação principal\
  \*\*Categoria:\*\* Problema\
  \
  O rótulo do botão não comunica o que acontece depois da busca.\
  \
  \## 02 --- Estado vazio\
  \
  Documentar o comportamento quando nenhum resultado for encontrado.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

## **18.3 Arquivo .margem**

-   Extensão própria para facilitar identificação e abertura pela
    aplicação.

-   Conteúdo versionado, validável e documentado.

-   Imagem incorporada para que o projeto seja portátil.

-   Sem marca na saída, mas com metadado técnico de schema e aplicação
    geradora.

-   Compatibilidade futura por migrações ou mensagens claras.

## **18.4 Pacote combinado**

Um ZIP com PNG + Markdown + .margem é uma boa funcionalidade posterior.
Não é obrigatório no MVP porque os três downloads independentes mantêm a
implementação e a interface mais simples.

# **19. Testes e garantia de qualidade**

## **19.1 Testes de usabilidade**

  -----------------------------------------------------------------------
  **Tarefa**                          **Critério de sucesso**
  ----------------------------------- -----------------------------------
  Importar uma captura                Participante encontra pelo menos
                                      uma forma de entrada sem instrução.

  Criar três anotações diferentes     Participante distingue marcador,
                                      área e seta.

  Criar anotação sem comentário       Participante entende que isso é
                                      permitido.

  Editar e reordenar comentários      Marcadores acompanham a nova
                                      numeração.

  Corrigir um erro                    Participante usa desfazer ou edita
                                      o objeto.

  Exportar PNG e Markdown             Participante identifica o formato
                                      adequado e encontra os arquivos.

  Fechar e voltar                     Projeto local é recuperado e o
                                      usuário compreende onde estava
                                      salvo.
  -----------------------------------------------------------------------

## **19.2 Testes técnicos**

-   Unidade: geometria, normalização de coordenadas, numeração,
    serialização, migração e geração de Markdown.

-   Integração: criação de marcador + comentário, reordenação, exclusão,
    undo/redo e autosave.

-   End-to-end: importar, anotar, salvar, recarregar, exportar e abrir
    .margem.

-   Visual: comparar exportação PNG com referência para objetos e
    escalas críticas.

-   Acessibilidade: axe ou equivalente, mais roteiro manual de teclado e
    leitor de tela.

-   Compatibilidade: matriz reduzida de navegadores e sistemas.

-   Performance: imagens pequenas, médias, grandes e próximas ao limite.

## **19.3 Matriz mínima de ambiente**

  -----------------------------------------------------------------------
  **Sistema**             **Navegadores**         **Foco**
  ----------------------- ----------------------- -----------------------
  Windows                 Chrome, Edge, Firefox   Atalhos Ctrl,
                                                  clipboard, download e
                                                  alta densidade de tela

  macOS                   Safari, Chrome          Atalhos Cmd, trackpad,
                                                  exportação e fontes

  Linux                   Firefox ou Chrome       Build aberto, teclado e
                                                  persistência

  iPad/tablet             Safari/Chrome quando    Visualização e edição
                          viável                  básica; não bloquear o
                                                  lançamento desktop
  -----------------------------------------------------------------------

## **19.4 Checklist de regressão**

-   [ ] Abrir projeto antigo após mudança de schema.

-   [ ] Exportar depois de reordenar comentários.

-   [ ] Desfazer exclusão de marcador vinculado.

-   [ ] Colar imagem quando já existe projeto.

-   [ ] Editar texto com atalhos ativos.

-   [ ] Salvar quando IndexedDB está indisponível ou cheio.

-   [ ] Usar zoom do navegador em 200%.

-   [ ] Reduzir janela com painel lateral aberto.

-   [ ] Navegar apenas por teclado do início ao download.

# **20. Critérios de aceite do MVP**

  -----------------------------------------------------------------------
  **ID**                              **Critério**
  ----------------------------------- -----------------------------------
  CA-01                               Dado que não há projeto, quando o
                                      usuário cola um PNG válido, então o
                                      editor abre com a imagem ajustada e
                                      nenhum dado é enviado pela rede.

  CA-02                               Dado um arquivo incompatível,
                                      quando o usuário tenta importá-lo,
                                      então recebe mensagem acionável e
                                      permanece no estado anterior.

  CA-03                               Dado o editor aberto, quando o
                                      usuário cria um marcador, então um
                                      comentário vinculado é criado e
                                      ambos compartilham o mesmo número.

  CA-04                               Dado o editor aberto, quando o
                                      usuário cria uma seta, área,
                                      desenho ou texto, então a anotação
                                      pode existir sem comentário.

  CA-05                               Dado um objeto selecionado, quando
                                      o usuário altera propriedades,
                                      então o canvas e o estado
                                      persistido refletem a mudança.

  CA-06                               Dado que uma ação foi realizada,
                                      quando o usuário desfaz, então o
                                      estado anterior é restaurado; ao
                                      refazer, a ação retorna.

  CA-07                               Dado que comentários foram
                                      reordenados, quando a ordem muda,
                                      então os marcadores são renumerados
                                      sem perder seus textos.

  CA-08                               Dado um projeto editado, quando o
                                      autosave termina, então aparece
                                      "Salvo neste navegador".

  CA-09                               Dado um projeto salvo localmente,
                                      quando a aplicação é reaberta,
                                      então oferece recuperar ou começar
                                      novo sem apagar automaticamente.

  CA-10                               Dado um projeto válido, quando o
                                      usuário exporta PNG, então a saída
                                      contém imagem e anotações, sem
                                      interface, seleção ou marca da
                                      Margem.

  CA-11                               Dado um projeto com comentários,
                                      quando exporta Markdown, então o
                                      arquivo mantém ordem, títulos,
                                      categorias e descrições.

  CA-12                               Dado um projeto, quando salva
                                      .margem e abre o arquivo novamente,
                                      então imagem, objetos, comentários
                                      e ordem são restaurados.

  CA-13                               Dado o uso apenas por teclado,
                                      quando o usuário percorre o fluxo
                                      principal, então consegue importar,
                                      selecionar ferramenta, editar,
                                      exportar e baixar.

  CA-14                               Dado foco em campo de texto, quando
                                      o usuário pressiona letras usadas
                                      como atalhos, então elas são
                                      digitadas e não trocam ferramentas.

  CA-15                               Dado uma falha de persistência,
                                      quando o autosave não é concluído,
                                      então o projeto permanece em
                                      memória e a aplicação oferece
                                      baixar uma cópia.

  CA-16                               Dado qualquer exportação, quando o
                                      arquivo é baixado, então não contém
                                      logotipo, autoria, URL ou marca
                                      d'água.
  -----------------------------------------------------------------------

## **20.1 Definição de pronto**

-   [ ] Critérios de aceite críticos aprovados.

-   [ ] Fluxo principal testado com pelo menos cinco pessoas que não
    participaram do desenvolvimento.

-   [ ] Nenhum erro bloqueador nos navegadores suportados.

-   [ ] Roteiro de teclado concluído sem bloqueios.

-   [ ] Repositório público com README, licença e instruções de
    desenvolvimento.

-   [ ] Página Sobre e texto de privacidade publicados.

-   [ ] Deploy reproduzível pelo GitHub Actions ou processo documentado.

-   [ ] Limitações conhecidas registradas e visíveis.

# **21. Roadmap**

  -----------------------------------------------------------------------
  **Fase**                **Entrega**             **Objetivo**
  ----------------------- ----------------------- -----------------------
  0 --- Fundamentos       Modelo de dados, spike  Reduzir riscos técnicos
                          SVG, persistência e     antes da UI completa
                          exportação              

  1 --- Editor básico     Importação, canvas,     Validar manipulação
                          seleção, marcador, área visual
                          e seta                  

  2 --- Documentação      Comentários, vínculo,   Entregar a proposta
                          reordenação e Markdown  central

  3 --- Acabamento do MVP Desenho, texto,         Preparar lançamento
                          histórico, autosave,    público
                          .margem, acessibilidade 

  4 --- Publicação        README, licença, página Integrar à Oficina
                          Sobre, testes, deploy e Digital
                          divulgação              

  1.1 pós-lançamento      Correções, duplicação,  Responder ao uso real
                          seleção múltipla e      sem ampliar demais o
                          pacote ZIP              escopo
  -----------------------------------------------------------------------

## **21.1 Ordem recomendada de validação**

10. Validar se SVG atende bem seleção, transformação e exportação.

11. Validar memória com imagem raster grande e autosave em IndexedDB.

12. Validar o vínculo marcador-comentário e a renumeração.

13. Validar o fluxo sem mouse antes de finalizar a arquitetura de
    componentes.

14. Validar a neutralidade das saídas com usos reais: GitHub issue,
    mensagem, documento e apresentação.

# **22. Backlog posterior**

## **22.1 Evoluções coerentes**

  -----------------------------------------------------------------------
  **Ideia**               **Valor**               **Risco de escopo**
  ----------------------- ----------------------- -----------------------
  Múltiplas imagens       Documentar fluxos e     Transformar o produto
                          sequências              em board/canvas
                                                  complexo

  PDF multipágina         Revisar documentos      Processamento e
                          visuais                 navegação mais
                                                  complexos

  Pacote ZIP              Compartilhar resultado  Baixo risco
                          completo                

  Modelos de estilo       Criar convenções de     Pode aumentar
                          revisão                 configuração

  Link local via arquivo  Transferir projeto de   Baixo risco
                          forma simples           

  Importar SVG com        Trabalhar com           Risco de segurança e
  segurança               interfaces vetoriais    sanitização

  PWA offline             Reforçar uso local      Cuidado com cache e
                                                  atualizações

  Integrações sem conta   Copiar formato para     Manutenção de formatos
                          GitHub/Linear/Notion    externos
  -----------------------------------------------------------------------

## **22.2 Ideias que devem permanecer fora por mais tempo**

-   Colaboração em tempo real.

-   Sistema de equipes e permissões.

-   Hospedagem de imagens e links públicos.

-   Gestão de tarefas e aprovação.

-   Análise automática por modelos de IA.

-   Marketplace de templates ou monetização dentro da ferramenta.

# **23. Plano de implementação**

*Uma sequência de trabalho adequada para desenvolvimento incremental com
Claude Code.*

## **23.1 Pacotes de trabalho**

  -----------------------------------------------------------------------
  **Pacote**                          **Entrega**
  ----------------------------------- -----------------------------------
  WP-01 --- Base do projeto           Vite/React/TypeScript, lint,
                                      testes, estrutura, GitHub Pages e
                                      CI.

  WP-02 --- Domínio                   Tipos, schema, coordenadas
                                      normalizadas, objetos e comandos
                                      reversíveis.

  WP-03 --- Viewport                  Imagem-base, zoom, pan, ajuste à
                                      tela e resize.

  WP-04 --- Ferramentas               Seleção, marcador, área, seta,
                                      desenho e texto.

  WP-05 --- Comentários               Painel, vínculo, edição,
                                      reordenação e sincronização.

  WP-06 --- Histórico                 Undo/redo, atalhos e estados de
                                      interação.

  WP-07 --- Persistência              IndexedDB, autosave, recuperação,
                                      limpar dados e migrações.

  WP-08 --- Exportação                PNG, Markdown, .margem, nomes e
                                      validação.

  WP-09 --- Acessibilidade            Foco, teclado, live regions,
                                      propriedades alternativas e testes.

  WP-10 --- Identidade e conteúdo     Interface editorial, microcopy,
                                      onboarding mínimo e Sobre.

  WP-11 --- QA e lançamento           Cross-browser, performance, README,
                                      licença e deploy.
  -----------------------------------------------------------------------

## **23.2 Estratégia para prompts no Claude Code**

Cada solicitação deve ser pequena, verificável e acompanhada de arquivos
ou testes afetados. Evitar pedir "construa a aplicação inteira". Uma boa
unidade de trabalho inclui contexto, comportamento esperado, restrições,
critérios de aceite e comandos de teste.

  -----------------------------------------------------------------------
  Contexto:\
  A Margem usa React + TypeScript e representa anotações SVG em
  coordenadas normalizadas.\
  \
  Tarefa:\
  Implemente a criação de marcador numerado por clique no canvas.\
  \
  Regras:\
  - O marcador deve criar um Comment vinculado.\
  - A numeração segue a ordem dos comentários.\
  - A ação deve ser reversível por undo/redo.\
  - Não use estado local duplicado entre canvas e painel.\
  \
  Critérios de aceite:\
  1. Clique com ferramenta Marker cria Annotation + Comment.\
  2. Undo remove ambos; redo restaura ambos.\
  3. Testes unitários e de integração passam.\
  4. npm run lint, npm test e npm run build concluem sem erro.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

## **23.3 Estratégia de commits**

-   Um comportamento por commit sempre que possível.

-   Commits de refatoração separados de mudanças funcionais.

-   Testes adicionados no mesmo commit da regra que protegem.

-   Mensagens em inglês ou português, mas consistentes no repositório.

-   Issues com IDs do requisito: "RF-043 --- Reordenar comentários e
    renumerar marcadores".

## **23.4 README mínimo**

-   O que é a Margem e para quem serve.

-   Demonstração e link publicado.

-   Princípios: local, sem cadastro, exportável e aberto.

-   Tecnologias e arquitetura resumida.

-   Como executar, testar e publicar.

-   Formatos suportados e limitações.

-   Como contribuir e relatar problemas.

-   Licença recomendada: MIT, caso seja compatível com sua intenção de
    compartilhamento.

# **A. Apêndice --- Atalhos propostos**

  -----------------------------------------------------------------------
  **Atalho**                          **Ação**
  ----------------------------------- -----------------------------------
  V                                   Selecionar

  M                                   Marcador

  R                                   Área/retângulo

  A                                   Seta

  P                                   Desenho/lápis

  T                                   Texto

  H ou Espaço                         Mover canvas

  Ctrl/Cmd+Z                          Desfazer

  Ctrl/Cmd+Shift+Z                    Refazer

  Ctrl/Cmd+D                          Duplicar

  Delete/Backspace                    Excluir seleção

  Ctrl/Cmd+S                          Baixar projeto .margem

  Ctrl/Cmd+E                          Abrir exportação

  \+ / -                              Zoom

  0                                   Ajustar à tela

  1                                   100%

  Esc                                 Cancelar/limpar seleção

  ?                                   Ajuda
  -----------------------------------------------------------------------

# **B. Apêndice --- Inventário de componentes**

  -----------------------------------------------------------------------
  **Componente**                      **Responsabilidade**
  ----------------------------------- -----------------------------------
  AppShell                            Layout, regiões, responsividade e
                                      atalhos globais

  EmptyState                          Importação, privacidade e
                                      recuperação

  TopBar                              Projeto, histórico, zoom, estado de
                                      salvamento e exportar

  ToolRail                            Ferramentas, seleção e tooltips

  CanvasViewport                      Zoom, pan, imagem e coordenadas

  AnnotationLayer                     Renderização e hit testing dos
                                      objetos

  SelectionOverlay                    Contorno, alças e indicadores

  CommentsPanel                       Lista, edição, categorias e
                                      reordenação

  PropertiesPanel                     Propriedades do objeto selecionado

  ExportDialog                        Formatos, opções, nomes e download

  ProjectDialog                       Novo, abrir, salvar e limpar dados

  ShortcutHelp                        Atalhos e instruções do canvas

  Toast/LiveRegion                    Estados, erros e confirmações

  ConfirmDialog                       Proteção contra perda de dados
  -----------------------------------------------------------------------

# **C. Apêndice --- Questões abertas para o protótipo**

-   [ ] O painel lateral deve começar com comentários ou propriedades
    quando um objeto está selecionado?

-   [ ] O marcador numerado pode ser reposicionado sem alterar a posição
    do ponto que ele indica, usando um "rabicho", ou é sempre um único
    ponto?

-   [ ] O desenho livre deve ser suavizado automaticamente ou manter o
    traço cru?

-   [ ] Quantas opções de cor são suficientes sem transformar a Margem
    em editor gráfico?

-   [ ] A categoria do comentário muda automaticamente símbolo e cor, ou
    símbolo e categoria são independentes?

-   [ ] O texto no canvas precisa de mais de dois tamanhos no MVP?

-   [ ] O modo mobile deve permitir edição básica ou apenas visualização
    e exportação?

-   [ ] Qual formato interno é mais adequado para .margem: ZIP legível
    ou JSON com imagem embutida?

-   [ ] Quais limites de imagem mantêm exportação estável nos
    navegadores suportados?

+-----------------------------------------------------------------------+
| **Como decidir**                                                      |
|                                                                       |
| Resolver estas questões por protótipos pequenos e testes de uso. Elas |
| não impedem o início da arquitetura, mas devem ser fechadas antes do  |
| acabamento visual do MVP.                                             |
+=======================================================================+
+-----------------------------------------------------------------------+

# **D. Apêndice --- Checklist de lançamento**

-   [ ] Nome, domínio/rota e favicon definidos.

-   [ ] Logo/wordmark da Margem aplicado apenas na interface.

-   [ ] Tela vazia testada com colar, arrastar e selecionar.

-   [ ] Limites de arquivo documentados.

-   [ ] Atalhos revisados em Windows e macOS.

-   [ ] Teclado e leitor de tela testados.

-   [ ] PNG comparado em diferentes escalas.

-   [ ] Markdown revisado em GitHub e editor de texto.

-   [ ] Arquivo .margem aberto após download e após nova versão do
    build.

-   [ ] Dados locais podem ser apagados.

-   [ ] Nenhuma requisição contém imagem ou comentário.

-   [ ] README, licença e contribuição publicados.

-   [ ] Página Sobre e privacidade disponíveis.

-   [ ] Erros conhecidos documentados.

-   [ ] Link incluído na Oficina Digital junto ao Vetoriza e ao
    unificador de PDFs.

**Margem**

*uma ferramenta para transformar observações visuais em artefatos
claros*

Documento de requisitos e fluxos --- versão 1.0
