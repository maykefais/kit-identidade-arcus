"use client";

import { useId } from "react";
import { Area, AreaChart } from "recharts";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { formatar, type Formato } from "@/lib/formatos";

/** Minigráfico de tendência para cartões de indicador, em flame como no esboço (passe o mouse para ver cada ponto). */
export function Sparkline({ valores, formato = "numero", rotulo }: { valores: number[]; formato?: Formato; rotulo: string }) {
  const gradiente = `spark-${useId().replace(/\W/g, "")}`;
  const dados = valores.map((v, i) => ({ i, v }));

  return (
    <ChartContainer
      config={{ v: { label: rotulo, color: "var(--chart-2)" } }}
      className="aspect-auto h-8 w-full"
      role="img"
      aria-label={`${rotulo}: evolução no período`}
    >
      {/* Sem a camada de teclado do Recharts: o contêiner já é uma imagem com rótulo e o cartão pode ser link. */}
      <AreaChart data={dados} margin={{ top: 2, right: 2, bottom: 0, left: 2 }} accessibilityLayer={false}>
        <defs>
          <linearGradient id={gradiente} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-v)" stopOpacity={0.3} />
            <stop offset="100%" stopColor="var(--color-v)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <ChartTooltip
          cursor={false}
          content={({ active, payload }) =>
            active && payload?.length ? (
              <span className="rounded-md border bg-popover px-2 py-1 text-xs tabular-nums shadow-sm">
                {formatar(Number(payload[0].value), formato)}
              </span>
            ) : null
          }
        />
        <Area
          dataKey="v"
          // Com poucos pontos (meses), a curva suave inventa subidas que não existem.
          type={valores.length <= 6 ? "linear" : "monotone"}
          stroke="var(--color-v)"
          strokeWidth={2}
          fill={`url(#${gradiente})`}
          activeDot={{ r: 3, strokeWidth: 0 }}
          isAnimationActive={false}
        />
      </AreaChart>
    </ChartContainer>
  );
}
