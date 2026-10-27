"use client";

import { useState } from "react";
import { Bar, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from "recharts";
import { ChartLine, Table2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMovimentoReduzido } from "@/hooks/use-movimento-reduzido";
import { formatar, formatarCompacto, type Formato } from "@/lib/formatos";
import { CORES_SERIES } from "./cores";

type Serie = { chave: string; rotulo: string; formato: Formato };
type Props = {
  dados: ({ rotulo: string } & Record<string, number | string>)[];
  /** Barras no eixo da esquerda e linha no da direita, cada uma na sua escala. */
  barras: Serie;
  linha: Serie;
  /** Descrição para leitores de tela. */
  rotulo: string;
};

/**
 * Exceção à regra de um eixo só (pedido do Mayke, Fase 4, entrega 6: investimento e leads por dia no mesmo gráfico): cada
 * eixo diz de quem é na legenda, a dica mostra os dois valores e a tabela tem os números exatos.
 */
export function GraficoDoisEixos({ dados, barras, linha, rotulo }: Props) {
  const reduzido = useMovimentoReduzido();
  const [verTabela, setVerTabela] = useState(false);
  const config: ChartConfig = {
    [barras.chave]: { label: barras.rotulo, color: CORES_SERIES[0] },
    [linha.chave]: { label: linha.rotulo, color: CORES_SERIES[1] },
  };
  const series = [
    { ...barras, cor: CORES_SERIES[0], marca: "h-2.5 w-2.5 rounded-sm", eixo: "eixo da esquerda" },
    { ...linha, cor: CORES_SERIES[1], marca: "h-0.5 w-4 rounded-full", eixo: "eixo da direita" },
  ];

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {series.map((s) => (
          <span key={s.chave} className="flex items-center gap-2 text-sm">
            <span className={s.marca} style={{ background: s.cor }} />
            {s.rotulo}
            <span className="text-muted-foreground">({s.eixo})</span>
          </span>
        ))}
        <Button variant="ghost" size="sm" className="sm:ml-auto" onClick={() => setVerTabela((v) => !v)}>
          {verTabela ? <ChartLine data-icon="inline-start" /> : <Table2 data-icon="inline-start" />}
          {verTabela ? "Ver gráfico" : "Ver tabela"}
        </Button>
      </div>
      {verTabela ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Período</TableHead>
              {series.map((s) => (
                <TableHead key={s.chave} className="text-right">
                  {s.rotulo}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {dados.map((p) => (
              <TableRow key={p.rotulo}>
                <TableCell>{p.rotulo}</TableCell>
                {series.map((s) => (
                  <TableCell key={s.chave} className="text-right tabular-nums">
                    {formatar(Number(p[s.chave]), s.formato)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <ChartContainer config={config} className="aspect-auto h-64 w-full" role="img" aria-label={rotulo}>
          <ComposedChart data={dados} margin={{ top: 8, right: 4, left: 4 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="rotulo" tickLine={false} axisLine={false} tickMargin={8} minTickGap={12} />
            <YAxis yAxisId="esq" tickLine={false} axisLine={false} width={64} tickFormatter={(v: number) => formatarCompacto(v, barras.formato)} />
            <YAxis
              yAxisId="dir"
              orientation="right"
              tickLine={false}
              axisLine={false}
              width={36}
              allowDecimals={false}
              tickFormatter={(v: number) => formatarCompacto(v, linha.formato)}
            />
            <ChartTooltip
              cursor={{ fill: "var(--muted)", opacity: 0.5 }}
              content={({ active, payload, label }) =>
                active && payload?.length ? (
                  <div className="grid min-w-44 gap-1.5 rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
                    <p className="font-medium">{String(label)}</p>
                    {series.map((s) => {
                      const item = payload.find((p) => p.dataKey === s.chave);
                      return (
                        item && (
                          <div key={s.chave} className="flex items-center gap-2">
                            <span className={s.marca} style={{ background: s.cor }} />
                            <span className="text-muted-foreground">{s.rotulo}</span>
                            <span className="ml-auto font-medium tabular-nums">{formatar(Number(item.value), s.formato)}</span>
                          </div>
                        )
                      );
                    })}
                  </div>
                ) : null
              }
            />
            <Bar yAxisId="esq" dataKey={barras.chave} fill={CORES_SERIES[0]} radius={[4, 4, 0, 0]} isAnimationActive={!reduzido} />
            <Line
              yAxisId="dir"
              dataKey={linha.chave}
              type="monotone"
              stroke={CORES_SERIES[1]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--card)" }}
              isAnimationActive={!reduzido}
            />
          </ComposedChart>
        </ChartContainer>
      )}
    </div>
  );
}
