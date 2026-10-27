"use client";

import Link from "next/link";
import { flexRender, type Cell, type Column, type Row, type Table as TabelaTanstack } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export function rotulo<TDados>(coluna: Column<TDados, unknown>) {
  const cabecalho = coluna.columnDef.header;
  return typeof cabecalho === "string" ? cabecalho : coluna.id;
}

function celula<TDados>(c: Cell<TDados, unknown>) {
  return flexRender(c.column.columnDef.cell, c.getContext());
}

/** Clique que abre a gaveta: botão principal sem ⌘, Ctrl, Shift ou Alt (Enter no link também chega aqui). O resto segue o link. */
export const cliqueSimples = (e: React.MouseEvent) => e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;

function LinkRegistro({
  href,
  cartao = false,
  aoAbrir,
  children,
}: {
  href: string;
  cartao?: boolean;
  aoAbrir?: (origem: HTMLElement) => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={(e) => {
        if (!aoAbrir || !cliqueSimples(e)) return;
        e.preventDefault();
        aoAbrir(e.currentTarget);
      }}
      className={cn(
        "font-medium underline-offset-4 outline-none hover:underline",
        // No cartão, o link cobre o cartão inteiro (alvo de toque grande); o foco aparece no cartão.
        cartao
          ? "after:absolute after:inset-0 after:rounded-2xl"
          : "rounded-sm focus-visible:underline focus-visible:ring-3 focus-visible:ring-ring/50 toque:inline-flex toque:min-h-11 toque:items-center",
      )}
    >
      {children}
    </Link>
  );
}

/** Computador largo (a partir de `xl`): tabela com cabeçalho ordenável. Abaixo disso, com o menu aberto, as colunas não cabem. */
export function TabelaComputador<TDados>({
  tabela,
  link,
  aoAbrir,
}: {
  tabela: TabelaTanstack<TDados>;
  link?: (linha: TDados) => string;
  aoAbrir?: (linha: TDados, origem: HTMLElement) => void;
}) {
  return (
    // Sem cartão em volta: cada linha já é uma faixa de vidro sobre o fundo. min-w-0: a tabela larga rola dentro dela, não a página.
    <div className="hidden min-w-0 xl:block">
      <Table>
        <TableHeader>
          {tabela.getHeaderGroups().map((grupo) => (
            <TableRow key={grupo.id}>
              {grupo.headers.map((cabecalho) => {
                const sentido = cabecalho.column.getIsSorted();
                const Seta = sentido === "asc" ? ArrowUp : sentido === "desc" ? ArrowDown : ArrowUpDown;
                const conteudo = flexRender(cabecalho.column.columnDef.header, cabecalho.getContext());
                const direita = cabecalho.column.columnDef.meta?.alinhar === "direita";
                return (
                  <TableHead
                    key={cabecalho.id}
                    className={direita ? "text-right" : undefined}
                    aria-sort={sentido === "asc" ? "ascending" : sentido === "desc" ? "descending" : undefined}
                  >
                    {cabecalho.isPlaceholder ? null : cabecalho.column.getCanSort() ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        // Compacto e no tipo do cabeçalho (maiúsculas pequenas), não no do botão.
                        className={cn("h-8 px-2 text-[length:inherit] font-medium uppercase", !direita && "-ml-2")}
                        onClick={cabecalho.column.getToggleSortingHandler()}
                      >
                        {conteudo}
                        <Seta className={sentido ? undefined : "opacity-40"} />
                      </Button>
                    ) : (
                      conteudo
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {tabela.getRowModel().rows.map((linha) => (
            <TableRow key={linha.id}>
              {linha.getVisibleCells().map((c, i) => (
                <TableCell
                  key={c.id}
                  className={c.column.columnDef.meta?.alinhar === "direita" ? "text-right tabular-nums" : undefined}
                >
                  {i === 0 && link ? (
                    <LinkRegistro href={link(linha.original)} aoAbrir={aoAbrir && ((o) => aoAbrir(linha.original, o))}>
                      {celula(c)}
                    </LinkRegistro>
                  ) : (
                    celula(c)
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

/** Celular e telas médias (abaixo de `xl`): cartões, em duas colunas a partir de `lg`; a 1ª coluna é o título. */
export function CartoesCelular<TDados>({
  linhas,
  link,
  aoAbrir,
}: {
  linhas: Row<TDados>[];
  link?: (linha: TDados) => string;
  aoAbrir?: (linha: TDados, origem: HTMLElement) => void;
}) {
  return (
    <ul className="grid gap-3 lg:grid-cols-2 xl:hidden">
      {linhas.map((linha) => {
        const [titulo, ...resto] = linha.getVisibleCells();
        const meta = (c: Cell<TDados, unknown>) => c.column.columnDef.meta?.cartao;
        const acoes = resto.filter((c) => !c.column.accessorFn);
        const dadosCartao = resto.filter((c) => c.column.accessorFn);
        const subtitulos = dadosCartao.filter((c) => meta(c) === "subtitulo");
        const campos = dadosCartao.filter((c) => !meta(c));
        return (
          <li
            key={linha.id}
            className="vidro relative grid gap-3 rounded-2xl p-5 text-sm has-[a:focus-visible]:ring-3 has-[a:focus-visible]:ring-ring/50"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="grid min-w-0 gap-0.5">
                <div className="text-[1.0625rem] font-semibold [overflow-wrap:anywhere]">
                  {link ? (
                    <LinkRegistro href={link(linha.original)} cartao aoAbrir={aoAbrir && ((o) => aoAbrir(linha.original, o))}>
                      {celula(titulo)}
                    </LinkRegistro>
                  ) : (
                    celula(titulo)
                  )}
                </div>
                {subtitulos.map((c) => (
                  <div key={c.id} className="text-muted-foreground [overflow-wrap:anywhere]">
                    {celula(c)}
                  </div>
                ))}
              </div>
              {acoes.length > 0 && (
                <div className="relative z-10 -mt-2 -mr-2 flex shrink-0 gap-1">{acoes.map((c) => <div key={c.id}>{celula(c)}</div>)}</div>
              )}
            </div>
            {campos.length > 0 && (
              <dl className="grid gap-1.5">
                {campos.map((c) => (
                  <div key={c.id} className="flex items-baseline justify-between gap-4">
                    <dt className="shrink-0 text-muted-foreground">{rotulo(c.column)}</dt>
                    <dd className="min-w-0 text-right tabular-nums [overflow-wrap:anywhere]">{celula(c)}</dd>
                  </div>
                ))}
              </dl>
            )}
          </li>
        );
      })}
    </ul>
  );
}
