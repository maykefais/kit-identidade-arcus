"use client";

import { useEffect, useId, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type FilterFn,
  type RowData,
  type SortingState,
} from "@tanstack/react-table";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { EstadoVazio } from "@/components/estado-vazio";
import { CartoesCelular, rotulo, TabelaComputador } from "@/components/tabela-dados-corpo";
import { Gaveta } from "@/components/gaveta";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatar } from "@/lib/formatos";
import { contemTexto } from "@/lib/texto";
import { trocarParametros } from "@/lib/url";
import { cn } from "@/lib/utils";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    /** Números e valores: alinhados à direita na tabela. */
    alinhar?: "direita";
    /** No cartão do celular (a 1ª coluna é o título): "subtitulo" vai sob o título; "oculta" não aparece. */
    cartao?: "subtitulo" | "oculta";
    /** Coluna só para filtrar (ex.: faixa de valor): não aparece na tabela nem no cartão. */
    soFiltro?: true;
  }
}

export type FiltroColuna = {
  coluna: string;
  titulo: string;
  opcoes: { valor: string; rotulo: string }[];
};

type Props<TDados> = {
  // Colunas com tipos de valor diferentes entre si (padrão da TanStack Table).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  colunas: ColumnDef<TDados, any>[];
  dados: TDados[];
  /** Placeholder da busca livre; sem ele, a busca não aparece. */
  busca?: string;
  filtros?: FiltroColuna[];
  linhasPorPagina?: number;
  /** Texto quando não há nenhum registro (sem filtro aplicado). */
  vazio?: { titulo: string; descricao?: string };
  /** Página de detalhe do registro: a 1ª coluna vira link e, no celular, o cartão inteiro é tocável. */
  link?: (linha: TDados) => string;
  /** Com `link`: o clique simples chama aoAbrir (gaveta) em vez de navegar; ⌘/Ctrl/Shift/meio seguem o link. */
  aoAbrir?: (linha: TDados, origem: HTMLElement) => void;
};

const TODOS = "__todos__";

const buscaSemAcento: FilterFn<unknown> = (linha, coluna, busca: string) =>
  contemTexto(linha.getValue(coluna), busca);

/**
 * Lista com busca, filtros, ordenação e paginação. No computador, tabela; no celular (abaixo de `md`),
 * cartões empilhados com a busca no topo e os filtros numa gaveta: nada rola para o lado. Busca e filtros ficam no
 * endereço (`?busca=`, `?<coluna>=`): voltar, recarregar e mandar o link mantêm a mesma vista (P3).
 */
export function TabelaDados<TDados>({
  colunas,
  dados,
  busca,
  filtros = [],
  linhasPorPagina = 20,
  vazio,
  link,
  aoAbrir,
}: Props<TDados>) {
  const id = useId();
  const parametros = useSearchParams();
  // Fora do Next (testes) não há endereço. Filtro com valor que a lista não tem fica de fora.
  const filtrosDe = (p: URLSearchParams | null): ColumnFiltersState =>
    filtros.flatMap((f) => {
      const valor = p?.get(f.coluna);
      return valor && f.opcoes.some((o) => o.valor === valor) ? [{ id: f.coluna, value: valor }] : [];
    });
  const buscaDe = (p: URLSearchParams | null) => (busca && p?.get("busca")) || "";
  const [ordenacao, setOrdenacao] = useState<SortingState>([]);
  const [filtrosColuna, setFiltrosColuna] = useState<ColumnFiltersState>(() => filtrosDe(parametros));
  const [buscaGlobal, setBuscaGlobal] = useState(() => buscaDe(parametros));
  const [gavetaAberta, setGavetaAberta] = useState(false);

  // Só os parâmetros desta lista (uma por tela), em texto: compara o estado com o endereço sem regravar à toa.
  const chave = (f: ColumnFiltersState, b: string) =>
    JSON.stringify([...filtros.map((x) => [x.coluna, (f.find((c) => c.id === x.coluna)?.value as string | undefined) ?? ""]), ...(busca ? [["busca", b.trim()]] : [])]);
  const noEndereco = chave(filtrosColuna, buscaGlobal);
  const doEndereco = chave(filtrosDe(parametros), buscaDe(parametros));
  // O endereço mudou por fora (link para a mesma lista com outros filtros, tela guardada pelo Next): segue o endereço.
  const [enderecoVisto, setEnderecoVisto] = useState(doEndereco);
  if (doEndereco !== enderecoVisto) {
    setEnderecoVisto(doEndereco);
    if (doEndereco !== noEndereco) {
      setFiltrosColuna(filtrosDe(parametros));
      setBuscaGlobal(buscaDe(parametros));
    }
  }
  useEffect(() => {
    const pares: [string, string][] = JSON.parse(noEndereco);
    if (pares.length) trocarParametros(Object.fromEntries(pares));
  }, [noEndereco]);

  const tabela = useReactTable({
    data: dados,
    columns: colunas,
    state: { sorting: ordenacao, columnFilters: filtrosColuna, globalFilter: buscaGlobal },
    onSortingChange: setOrdenacao,
    onColumnFiltersChange: setFiltrosColuna,
    onGlobalFilterChange: setBuscaGlobal,
    globalFilterFn: buscaSemAcento as FilterFn<TDados>,
    defaultColumn: { filterFn: "equalsString" },
    initialState: {
      pagination: { pageSize: linhasPorPagina },
      columnVisibility: Object.fromEntries(
        colunas.filter((c) => c.meta?.soFiltro).map((c) => [c.id ?? ("accessorKey" in c ? String(c.accessorKey) : ""), false]),
      ),
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const total = tabela.getFilteredRowModel().rows.length;
  const linhas = tabela.getRowModel().rows;
  const paginas = tabela.getPageCount();
  const filtrando = buscaGlobal.trim() !== "" || filtrosColuna.length > 0;
  const textoTotal = `${formatar(total)} ${total === 1 ? "registro" : "registros"}`;
  // Celular: sem cabeçalho de tabela, a ordenação vai para a gaveta de filtros.
  const ordenaveis = tabela.getAllLeafColumns().filter((c) => c.accessorFn && c.getCanSort() && c.getIsVisible());
  const ordemAtual = ordenacao[0] ? `${ordenacao[0].id}:${ordenacao[0].desc ? "desc" : "asc"}` : TODOS;

  function limparFiltros() {
    setBuscaGlobal("");
    setFiltrosColuna([]);
    tabela.setPageIndex(0);
  }

  function seletorFiltro(filtro: FiltroColuna, celular: boolean) {
    const coluna = tabela.getColumn(filtro.coluna);
    return (
      <Select
        key={filtro.coluna}
        value={(coluna?.getFilterValue() as string | undefined) ?? TODOS}
        onValueChange={(valor) => {
          coluna?.setFilterValue(valor === TODOS ? undefined : valor);
          tabela.setPageIndex(0);
        }}
      >
        <SelectTrigger
          id={celular ? `${id}-${filtro.coluna}` : undefined}
          aria-label={celular ? undefined : filtro.titulo}
          className={celular ? "w-full" : "w-44"}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={TODOS}>{celular ? "Todos" : `${filtro.titulo}: todos`}</SelectItem>
          {filtro.opcoes.map((opcao) => (
            <SelectItem key={opcao.valor} value={opcao.valor}>
              {opcao.rotulo}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <div className="grid gap-3">
      {(busca || filtros.length > 0) && (
        <div className="flex flex-wrap items-center gap-2">
          {busca && (
            <div className="relative min-w-0 flex-1 md:w-72 md:flex-none">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                aria-label="Buscar"
                placeholder={busca}
                value={buscaGlobal}
                onChange={(e) => {
                  setBuscaGlobal(e.target.value);
                  tabela.setPageIndex(0);
                }}
                className="pl-8"
              />
            </div>
          )}
          {filtros.length > 0 && (
            <>
              <div className="hidden md:contents">{filtros.map((filtro) => seletorFiltro(filtro, false))}</div>
              <div className={cn("md:hidden", !busca && "flex-1")}>
                <Gaveta
                  titulo="Filtros"
                  aberto={gavetaAberta}
                  aoMudar={setGavetaAberta}
                  gatilho={
                    <Button variant="outline" className={cn(!busca && "w-full")}>
                      <SlidersHorizontal data-icon="inline-start" />
                      Filtros
                      {filtrosColuna.length > 0 && <Badge className="ml-0.5 tabular-nums">{filtrosColuna.length}</Badge>}
                    </Button>
                  }
                >
                  <div className="grid gap-4 px-4">
                    {filtros.map((filtro) => (
                      <div key={filtro.coluna} className="grid gap-2">
                        <Label htmlFor={`${id}-${filtro.coluna}`}>{filtro.titulo}</Label>
                        {seletorFiltro(filtro, true)}
                      </div>
                    ))}
                    {ordenaveis.length > 0 && (
                      <div className="grid gap-2">
                        <Label htmlFor={`${id}-ordem`}>Ordenar por</Label>
                        <Select
                          value={ordemAtual}
                          onValueChange={(valor) => {
                            const [coluna, sentido] = valor.split(":");
                            setOrdenacao(valor === TODOS ? [] : [{ id: coluna, desc: sentido === "desc" }]);
                          }}
                        >
                          <SelectTrigger id={`${id}-ordem`} className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={TODOS}>Padrão</SelectItem>
                            {ordenaveis.flatMap((c) => [
                              <SelectItem key={`${c.id}:asc`} value={`${c.id}:asc`}>
                                {rotulo(c)}, crescente
                              </SelectItem>,
                              <SelectItem key={`${c.id}:desc`} value={`${c.id}:desc`}>
                                {rotulo(c)}, decrescente
                              </SelectItem>,
                            ])}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <div className="grid gap-2 pt-2">
                      <Button onClick={() => setGavetaAberta(false)}>Ver {textoTotal}</Button>
                      <Button variant="ghost" onClick={limparFiltros} disabled={!filtrando}>
                        Limpar filtros
                      </Button>
                    </div>
                  </div>
                </Gaveta>
              </div>
            </>
          )}
          {/* Celular: total e "Limpar" numa linha própria; computador: em linha com os filtros. */}
          <div className="flex w-full items-center justify-between gap-2 md:contents">
            {filtrando && (
              <Button variant="ghost" size="sm" onClick={limparFiltros}>
                <X data-icon="inline-start" />
                Limpar filtros
              </Button>
            )}
            <span className="order-first text-sm text-muted-foreground md:order-none md:ml-auto" aria-live="polite">
              {textoTotal}
            </span>
          </div>
        </div>
      )}

      {linhas.length === 0 ? (
        filtrando ? (
          <EstadoVazio titulo="Nenhum resultado" descricao="Nada corresponde à busca ou aos filtros.">
            <Button variant="outline" onClick={limparFiltros}>
              Limpar filtros
            </Button>
          </EstadoVazio>
        ) : (
          <EstadoVazio titulo={vazio?.titulo ?? "Nenhum registro ainda"} descricao={vazio?.descricao} />
        )
      ) : (
        <>
          <TabelaComputador tabela={tabela} link={link} aoAbrir={aoAbrir} />
          <CartoesCelular linhas={linhas} link={link} aoAbrir={aoAbrir} />
        </>
      )}

      {paginas > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm md:justify-end">
          <span className="text-muted-foreground">
            Página {tabela.getState().pagination.pageIndex + 1} de {paginas}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => tabela.previousPage()} disabled={!tabela.getCanPreviousPage()}>
              Anterior
            </Button>
            <Button variant="outline" size="sm" onClick={() => tabela.nextPage()} disabled={!tabela.getCanNextPage()}>
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
