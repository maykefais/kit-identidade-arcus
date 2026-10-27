# Guia visual Arcus

Regras de identidade, UI e UX dos sistemas da Arcus. Valem em toda tela: leia antes de criar ou mudar uma.
Vieram do Sistema Comercial Arcus (27/10/2026). Os componentes estão em `src/components/` e a vitrine em `/componentes`.

## Marca

- **Cores**: só os tokens de `src/app/globals.css`, que seguem o brand book (https://brand-book-sigma.vercel.app): navy `#28233F`, ink `#1B1735`, cream `#FAF0D9` e flame `#EE4B25`. Não criar cor solta; cor nova vira token, nos dois temas, com o contraste medido (ver **Contraste**).
- **Logos e textura**: `public/marca/` (logo do tema claro `arcus-logo-claro.png`, do escuro `arcus-fundo-escuro.png`, símbolos e `textura-indigo.jpg`). Telas fora da área logada (entrar, acesso negado) usam `TelaMarca`, com a textura ao lado do conteúdo.
- **Personalidade**: cartões de vidro, números grandes e leves, textura Indigo nas telas de marca. Nada de gradiente fora do fundo e do ícone ativo do menu, nem emoji ou ilustração de banco de imagens.
- **Temas**: claro e escuro, escolhidos pela pessoa (`AlternarTema`) ou pelo sistema operacional. O `SCRIPT_TEMA` no `<head>` aplica o tema antes da primeira pintura, sem piscar.

## Fonte e escala

- Inter em tudo, por `next/font/google` no `layout.tsx` na variável `--font-inter`. Para trocar a fonte, mude só o `--font-sans` em `globals.css` e o layout.
- `tabular-nums` nos números. Pesos: texto 400, menu e rótulos 500, ativo e títulos 600–700 (`font-bold tracking-tight` nos títulos).
- A escala é menor que a padrão do Tailwind e está no `@theme`: `text-base` 14px (texto corrido), `text-sm` 12,5px, `text-xs` 11px, `text-lg` 16px, `text-xl` 18px, `text-2xl` 22px (título de página), `text-3xl` a `text-5xl` 28 a 44px (números grandes e telas de marca).
- Nada abaixo de 10,5px. No celular, campos com 16px, para o iPhone não dar zoom (regra no fim do `globals.css`).

## Vidro, cantos e espaço

- **Fundo**: `--fundo-app`, um gradiente com dois brilhos: flame em cima à direita e lilás embaixo à esquerda.
- **Cartões**: o `Card` já usa o utilitário `vidro` (`--vidro-fundo`, `--borda-vidro`, `--brilho-vidro`, `--sombra-vidro`, com valores próprios no claro e no escuro). O desfoque só vale a partir de `md`; no celular, nenhum `backdrop-filter` em item repetido de lista, porque pesa.
- **Controles**: campos e botões `outline` e `secondary` em vidro, com `--sombra-controle`.
- **Tabela**: sem cartão em volta. Cada linha é uma faixa de vidro e o cabeçalho vai em maiúsculas pequenas.
- **Abas, `AbasLinks` e `ToggleGroup`**: seletor segmentado, com trilho translúcido (`bg-trilho`) e o item escolhido em flame com texto branco.
- **Cantos**: 16px em cartões; 10px em botões, campos e filtros; 8px em linhas de tabela e itens de seletor; 6px em selos.
- **Espaço**: escala de 4px do Tailwind; `gap-8` entre seções e `gap-4` a `gap-6` dentro delas.

## Cores com função

- **Flame** (`--primary`, `#D63F1A`, o flame escurecido para o texto branco ficar legível) marca a ação principal e a escolha ativa: botão `default` com brilho, aba e item escolhidos, `CampoOpcoes`, ícone ativo do menu.
- O flame puro `#EE4B25` nunca leva texto branco, e flame sólido nunca vai em selo.
- Link em flame usa `text-primary-texto`, nunca `text-primary`.
- **Erro, perda e recusa** em vermelho (`--destructive`).
- **Selos de situação** pelo `Badge`:
  - `ok` (verde): feito (Pago, Ativo, Assinado).
  - `espera` (lilás): aguardando alguém (Em análise, Agendada, Pendente).
  - `atencao` (âmbar): meio do caminho (Incompleto, Reaberto).
  - `destructive` (vermelho): erro, recusa, perda.

  A cor de cada situação é decidida onde o selo é criado.

## Botões e hierarquia

- **Tipos**:
  - `default`, flame com brilho: a ação principal da tela (desabilitado, fica sem brilho).
  - `secondary`, tonal lilás: confirma dentro de um cartão (ex.: aprovar).
  - `outline`: vidro com contorno.
  - `ghost`: todo o resto.
- **Alturas**: 40px (`default`) e 36px (`sm`); cabeçalho de tabela usa `h-8`.
- **Uma ação principal por tela**, no `CabecalhoPagina`; o resto `outline` ou `ghost`. A pessoa acha o que fazer em 3 segundos.
- **A ação principal é o próximo passo**: o botão muda com a etapa. Correções e cancelamentos vão para "Mais ações" (⋯).

## Estados e feedback

- Todo `<Suspense>` usa `EsqueletoPagina`. Ação em andamento usa `Button carregando` ou `BotaoEnviar`.
- Lista ou tela sem dados usa `EstadoVazio`, que diz o que falta e oferece o próximo passo. Quem pode agir vê o botão; quem só consulta vê o que vai aparecer ali e quando.
- Toda gravação termina em `toast.success` ou `toast.error` (sonner, pelo `Avisos`). No computador o aviso aparece embaixo à direita, para não cobrir os botões do cabeçalho; no celular, em cima. A mensagem de erro diz como corrigir.
- Excluir, cancelar, aprovar e recusar passam por `ConfirmarAcao`.
- Valores em R$ e datas no formato brasileiro (`lib/formatos.ts`). Número arredondado mostra o exato no `title`, pelo `ValorArredondado` ("R$ 412 mil").

## Formulários

- Use `useFormulario` e os campos de `components/formulario.tsx` (`CampoTexto`, `CampoMoeda`, `CampoInteiro`, `CampoSelecao`, `CampoOpcoes`, `CampoAreaTexto`), com validação em Zod.
- Escolha com até ~5 opções curtas usa `CampoOpcoes` (um toque, a escolhida em flame; `multiplo` para marcar várias). Listas longas usam `CampoSelecao`.
- Campo que não vale para a escolha atual some, em vez de ficar desabilitado.
- Ação curta sobre um registro (até ~6 campos) abre em `Gaveta`, sem perder a lista. Formulário longo, que cria registro, abre em página própria.

## Navegação

- **Volta sempre visível**: toda tela fora do menu tem, acima do título, "← lugar de cima" (`CabecalhoPagina` com `voltar`), com toque de 44px. A volta leva ao lugar de cima com a mesma aba, os mesmos filtros e o mesmo mês (`MemoriaVolta`). A hierarquia tem até 3 níveis, sem trilha completa.
- **O título diz o que é**: no detalhe, sobretítulo com o tipo ("Pedido nº 1036") e o nome no título; o título usa as palavras do botão que abriu a tela.
- **Lista → detalhe → voltar**: toda lista tem busca, filtros principais visíveis e a contagem. No computador é tabela e no celular, cartões compactos (`TabelaDados`). Aba e filtros ficam no endereço (`?aba=`, `AbasNoEndereco`), para poder voltar, recarregar e mandar o link na mesma vista.
- **Depois de gravar**: a pessoa fica onde está e vê o resultado. Só muda de tela quando a gravação cria um registro com próximo passo obrigatório.
- **Os mesmos nomes**: a entrada e o título usam o substantivo, o botão final usa o verbo ("Novo pedido" → "Emitir pedido"; "Novo produto" → "Cadastrar produto"). Salvar = alteração; Cancelar = desfazer um registro; para sair da edição, "Voltar".
- **Esqueleto do app** (exemplos em `referencia/`, para adaptar ao seu menu):
  - **Menu lateral**: itens de 44px, o ícone num quadradinho de 30px e o ativo com o gradiente `--icone-menu-ativo`. Recolhido, fica com 76px e tooltips. "Novo" em flame no topo do menu.
  - **Topo**: controles de 40px (44px no toque).
  - **Celular**: barra inferior flutuante (cápsula de vidro, ativo em cápsula cinza); o topo rola junto com o conteúdo; botão "+" flutuante com os registros do dia a dia, que some ao rolar para baixo e nunca cobre conteúdo.

## Celular primeiro (obrigatório)

- 100% responsivo e pensado primeiro para o celular. Toda tela funciona a 360px sem rolagem lateral, nem dentro de cartões.
- Lista vira cartões no celular. Toque com 44px no mínimo. Nada que dependa só de passar o mouse.
- Respeitar as áreas seguras do iPhone (`env(safe-area-inset-*)`, com `viewportFit: "cover"` no layout).
- Entre 768 e 1.280px, com o menu aberto, o conteúdo ao lado do menu leva `min-w-0`; sem isso, a tela vaza para a direita. Confira em 360, 768, 1.000 e 1.280px.
- Quadro (kanban): as colunas ficam em grade e empilham no celular. Sem arrastar: o card tem "Mudar status" numa `Gaveta`.

## Acessibilidade

- Contraste AA nos dois temas: texto com 4,5:1; ícone e contorno de controle com 3:1.
- Ícone sozinho tem `aria-label`.
- Foco sempre visível: campos com borda flame e anel flame claro. No que já é flame (botão principal, aba escolhida), o anel vai na cor do texto (`foreground`).
- Na área logada, o primeiro Tab é "Pular para o conteúdo", que leva a `#conteudo`.
- Animação só com `prefers-reduced-motion: no-preference` (`useMovimentoReduzido`).

## Gráficos

- Ficam em `src/components/graficos/` e `components/ui/chart.tsx` (Recharts).
- Até 2 séries por gráfico: azul `--chart-1` e flame `--chart-2`, validadas para daltonismo.
- Meta, tendência e comparação vão em tracejado neutro. Nunca dois eixos Y nem cores ciclando.
- Com 2 séries ou mais, legenda. Dica ao passar o mouse e opção de ver em tabela.
- Barras contra meta usam os tokens `--barra-vermelho` (abaixo de 50%), `--barra-amarelo` (atrás do esperado), `--barra-azul` (no ritmo) e `--barra-verde` (meta batida), sobre o `--trilho-barra`.

## Contraste

`src/lib/contraste.test.ts` lê as cores de `globals.css` e mede o contraste nos dois temas, no fundo e no cartão de vidro. Antes de usar uma cor nova: crie o token, ponha a medição no teste e rode `npx vitest run src/lib/contraste.test.ts`.
