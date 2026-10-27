import type { Metadata } from "next";
import { Suspense } from "react";
import { CabecalhoPagina } from "@/components/cabecalho-pagina";
import { EsqueletoPagina } from "@/components/esqueletos";
import { EstadoVazio } from "@/components/estado-vazio";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AcaoPrincipalExemplo, BotoesExemplo, FormularioExemplo, GraficoExemplo, TabelaExemplo } from "./exemplos";

export const metadata: Metadata = { title: "Componentes" };

// Vitrine dos componentes base com dados fictícios; nada aqui lê ou grava no banco.
function Conteudo() {
  return (
    <>
      <CabecalhoPagina titulo="Componentes" descricao="Vitrine dos componentes base, com dados fictícios.">
        <AcaoPrincipalExemplo />
      </CabecalhoPagina>

      <div className="flex flex-col gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Botões e estados</CardTitle>
            <CardDescription>
              Uma ação principal por tela; carregando, desabilitado, aviso de erro e confirmação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BotoesExemplo />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Barras</CardTitle>
            <CardDescription>Uma série; passe o mouse para ver o valor</CardDescription>
          </CardHeader>
          <CardContent>
            <GraficoExemplo />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Negociações</CardTitle>
            <CardDescription>Tabela com busca, filtro, ordenação e paginação</CardDescription>
          </CardHeader>
          <CardContent>
            <TabelaExemplo />
          </CardContent>
        </Card>

        <div className="grid gap-8 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Formulário</CardTitle>
              <CardDescription>Validação com Zod; o valor em reais vira centavos</CardDescription>
            </CardHeader>
            <CardContent>
              <FormularioExemplo />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tela vazia</CardTitle>
              <CardDescription>Diz o que falta e oferece o próximo passo</CardDescription>
            </CardHeader>
            <CardContent>
              <EstadoVazio
                titulo="Nenhum produto cadastrado"
                descricao="Cadastre o primeiro produto para emitir pedidos."
              >
                <AcaoPrincipalExemplo rotulo="Cadastrar produto" />
              </EstadoVazio>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

export default function Componentes() {
  return (
    // Sem o layout do app (menu e topo), o miolo leva aqui a largura e o espaço do `#conteudo`.
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 p-4 md:p-8">
      <Suspense fallback={<EsqueletoPagina />}>
        <Conteudo />
      </Suspense>
    </main>
  );
}
