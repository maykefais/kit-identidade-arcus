"use client";

import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatar, formatarCompacto, type Formato } from "@/lib/formatos";
import { cn } from "@/lib/utils";
import { CORES_SERIES } from "./graficos/cores";

export type Serie = { chave: string; rotulo: string };

type Props = {
  dados: Record<string, string | number>[];
  eixoX: string;
  series: Serie[];
  tipo?: "barra" | "linha";
  formato?: Formato;
  /** Descrição para leitores de tela. */
  rotulo: string;
  className?: string;
};

export function Grafico({
  dados,
  eixoX,
  series: todas,
  tipo = "barra",
  formato = "numero",
  rotulo,
  className,
}: Props) {
  const series = todas.slice(0, CORES_SERIES.length); // até 2 séries (paleta validada)
  const config: ChartConfig = Object.fromEntries(
    series.map((s, i) => [s.chave, { label: s.rotulo, color: CORES_SERIES[i] }]),
  );
  const Grafico = tipo === "barra" ? BarChart : LineChart;

  return (
    <ChartContainer config={config} className={cn("aspect-auto h-72 w-full", className)} role="img" aria-label={rotulo}>
      <Grafico data={dados} margin={{ left: 4, right: 4 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey={eixoX} tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={72}
          tickFormatter={(v: number) => formatarCompacto(v, formato)}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(valor, nome) => (
                <>
                  <span
                    className="size-2.5 shrink-0 rounded-[2px]"
                    style={{ background: `var(--color-${String(nome)})` }}
                  />
                  <span className="text-muted-foreground">{config[String(nome)]?.label ?? nome}</span>
                  <span className="ml-auto font-medium text-foreground tabular-nums">
                    {formatar(Number(valor), formato)}
                  </span>
                </>
              )}
            />
          }
        />
        {series.length > 1 && <ChartLegend content={<ChartLegendContent />} />}
        {series.map((s) =>
          tipo === "barra" ? (
            <Bar key={s.chave} dataKey={s.chave} fill={`var(--color-${s.chave})`} radius={4} />
          ) : (
            <Line
              key={s.chave}
              dataKey={s.chave}
              stroke={`var(--color-${s.chave})`}
              strokeWidth={2}
              dot={false}
              type="monotone"
            />
          ),
        )}
      </Grafico>
    </ChartContainer>
  );
}
