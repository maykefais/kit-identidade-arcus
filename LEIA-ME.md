# Kit de identidade visual Arcus

Este kit traz a identidade visual, os componentes e as regras de UX do Sistema Comercial Arcus, para outro sistema da Arcus ficar com a mesma cara. Ele foi feito para projetos em Next.js (App Router) com Tailwind 4 e shadcn/ui. Foi testado num projeto novo do `create-next-app` (Next 16.4): instala, o build passa e a vitrine fica igual à do comercial.

## Instalar (2 minutos)

Na raiz do seu projeto, com tudo commitado:

```bash
gh repo clone maykefais/kit-identidade-arcus ~/kit-identidade-arcus
bash ~/kit-identidade-arcus/instalar.sh
```

O script copia os arquivos e instala as dependências. Depois, no Claude Code do projeto, peça:

> Termine a instalação do kit em `~/kit-identidade-arcus` seguindo o LEIA-ME.md, a partir do passo 2.

Para atualizar depois: `git -C ~/kit-identidade-arcus pull` e rode o `instalar.sh` de novo.

## O que tem aqui

| Pasta ou arquivo | O que é | O que fazer |
|---|---|---|
| `instalar.sh` | Copia os arquivos e instala as dependências | Rodar na raiz do projeto |
| `GUIA-VISUAL.md` | Regras de marca, UI e UX | Vai para `docs/`; citar no `CLAUDE.md` do projeto |
| `src/app/globals.css` | Cores, fonte, vidro, temas claro e escuro, animações | Substituir o `globals.css` do projeto |
| `src/components/ui/` | Componentes shadcn já no visual Arcus | Copiar (substitui os de mesmo nome) |
| `src/components/` | Componentes da casa: formulário, tabela, gaveta, cabeçalho, estado vazio, gráficos etc. | Copiar |
| `src/hooks/`, `src/lib/` | Utilitários dos componentes (formatos BR, tema, contraste) | Copiar |
| `src/app/componentes/` | Vitrine com dados fictícios, em `/componentes` | Copiar para conferir; pode apagar depois |
| `public/marca/` | Logos e textura da marca | Copiar |
| `components.json` | Configuração do shadcn (estilo, ícones lucide) | Usar no lugar do atual |
| `vitest.config.ts` | Configuração do teste de contraste | Copiar, se o projeto ainda não tiver |
| `referencia/` | Layout raiz, menu lateral, topo e barra do celular do sistema comercial | **Só ler e adaptar.** Dependem do login e das rotas do comercial |
| `capturas/` | A vitrine no claro e no escuro, no computador e no celular | Para comparar o resultado |

## Passo a passo (para o Claude Code)

1. **Arquivos e dependências**: o `instalar.sh` faz este passo. Ele copia `src/`, `public/marca/`, `components.json` e o guia para `docs/`, e instala as dependências nas versões testadas. Os arquivos do kit substituem os de mesmo nome; o diff no git mostra o que mudou, e componentes do projeto que usavam a versão antiga devem ser ajustados. O teste de contraste só é copiado se o projeto tiver vitest. O `globals.css` usa o loader `@tailwindcss/turbopack` no `next.config.ts`, que o `create-next-app` atual já traz.
2. **Layout raiz**: junte ao `src/app/layout.tsx` o que está em `referencia/layout-raiz-exemplo.tsx`:
   - Inter na variável `--font-inter`;
   - `<ScriptInline html={SCRIPT_TEMA} />` no `<head>`;
   - `TooltipProvider` e `<Avisos />` no `<body>`;
   - `lang="pt-BR"`, `suppressHydrationWarning` e o `viewport` com `viewportFit: "cover"`.
3. **Esqueleto do app**: monte o menu lateral, o topo e a barra inferior do celular com base em `referencia/`, trocando as rotas, as permissões e o login pelos do projeto. Mantenha as medidas, os estados e o comportamento descritos no `GUIA-VISUAL.md`, seção **Navegação**.
4. **Regra para as próximas telas**: adicione ao `CLAUDE.md` (ou `AGENTS.md`) do projeto:
   > Interface: siga `docs/GUIA-VISUAL.md` em toda tela. Use os componentes de `src/components/` antes de criar novos e só as cores de `globals.css`.
5. **Conferir**:
   - Com vitest no projeto: `npx vitest run src/lib/contraste.test.ts` passa.
   - `/componentes` fica igual às `capturas/`, nos dois temas.
   - O build passa e nenhuma tela rola para o lado a 360px.

## Fora do kit

O que é regra de negócio do comercial ficou de fora: painéis de metas, corrida, sino, busca rápida, login e banco. A aba "Painel interativo" da vitrine também saiu, porque usa as contas de metas do comercial.
