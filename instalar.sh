#!/usr/bin/env bash
# Instala o kit de identidade Arcus no projeto Next.js da pasta atual.
# Uso, na raiz do projeto: bash <pasta do kit>/instalar.sh
set -euo pipefail

KIT="$(cd "$(dirname "$0")" && pwd)"

[ -f package.json ] || { echo "Rode na raiz do projeto (não achei package.json)."; exit 1; }
[ -d src/app ] || { echo "O kit espera o App Router em src/app (com @/ apontando para src/). Peça ao Claude Code para adaptar os caminhos."; exit 1; }
# Os arquivos do kit substituem os de mesmo nome; com tudo no git, dá para ver e desfazer pelo diff.
if git rev-parse --git-dir >/dev/null 2>&1; then
  [ -z "$(git status --porcelain)" ] || { echo "Há mudanças sem commit. Faça commit (ou stash) antes de instalar."; exit 1; }
else
  echo "O projeto não está no git: os arquivos de mesmo nome serão substituídos sem volta."
  read -r -p "Continuar? [s/N] " r; [ "$r" = "s" ] || exit 1
fi

mkdir -p src public docs
cp -R "$KIT/src/." src/
cp -R "$KIT/public/." public/
cp "$KIT/components.json" .
cp "$KIT/GUIA-VISUAL.md" docs/
# O teste de contraste só entra em projeto com vitest; sem ele, o arquivo quebraria o build.
if grep -q '"vitest"' package.json; then
  if [ ! -f vitest.config.ts ] && [ ! -f vitest.config.mts ]; then
    cp "$KIT/vitest.config.ts" .
    npm i -D jsdom # o vitest.config.ts do kit roda os testes em jsdom
  fi
else
  rm src/lib/contraste.test.ts
fi

# Versões testadas com o kit (a tabela quebra na 9 do @tanstack/react-table).
npm i radix-ui@^1.8.1 class-variance-authority@^0.7.1 cn@^0.5.0 lucide-react@^1.58.0 recharts@^3.8.0 sonner@^2.0.8 \
  tw-animate-css@^1.4.0 react-hook-form@^7.90.0 zod@^4.6.7 @tanstack/react-table@^8.21.3 shadcn@^4.22.0

echo
echo "Arquivos copiados e dependências instaladas."
echo "Agora peça ao Claude Code: \"Termine a instalação do kit em $KIT seguindo o LEIA-ME.md, a partir do passo 2.\""
