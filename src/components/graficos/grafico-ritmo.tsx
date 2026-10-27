"use client";

import { useId, useSyncExternalStore } from "react";
import { Area, CartesianGrid, ComposedChart, Line, ReferenceDot, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { formatar, formatarArredondado, formatarCompacto, type Formato } from "@/lib/formatos";
import { COR_REFERENCIA, CORES_SERIES } from "./cores";

type Props = {
  /** Rótulo de cada dia do mês no eixo ("1/10" … "31/10"). */
  dias: string[];
  /** Acumulado do mês até hoje (ou até o fim, mês fechado). */
  atual: number[];
  /** Acumulado da meta dividida pelos dias (null sem meta). */
  ritmo: number[] | null;
  /** Acumulado do período de comparação inteiro, alinhado pelo dia do mês (null sem comparação). */
  comparacao: number[] | null;
  rotuloAtual: string;
  rotuloComparacao: string | null;
  /** Mês em andamento: o último ponto ganha "R$ 412 mil hoje". */
  marcaHoje?: boolean;
  formato?: Formato;
  rotulo: string;
};

// Só o que a dica usa do Recharts (o tipo completo do content não aceita props extras).
type PropsDica = { active?: boolean; payload?: ReadonlyArray<{ payload?: unknown }>; label?: unknown };
type Linha = { dia: string; atual?: number; ritmo?: number; comparacao?: number };

const COR_ATUAL = CORES_SERIES[1]; // flame, como no esboço
const COR_COMPARACAO = CORES_SERIES[0];
// Tamanho das marcas dos eixos, em rem (cresce com a letra do Modo TV); a cor (muted-foreground) vem do ChartContainer.
const EIXO = { fontSize: "0.65625rem" };
// Letra da raiz (16 px; 20 px no Modo TV): a largura do eixo Y é em px e acompanha a letra para "600 mil" não cortar.
const semAviso = () => () => {};
const letraRaiz = () => parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;

/** Acumulado do mês dia a dia contra o ritmo da meta (tracejado) e o mês da comparação (linha fina). Sem animação: TV e prints estáveis. */
export function GraficoRitmo({ dias, atual, ritmo, comparacao, rotuloAtual, rotuloComparacao, marcaHoje = false, formato = "moeda", rotulo }: Props) {
  const gradiente = `ritmo-${useId().replace(/\W/g, "")}`;
  const escala = useSyncExternalStore(semAviso, letraRaiz, () => 16) / 16;
  const dados: Linha[] = dias.map((dia, i) => ({ dia, atual: atual[i], ritmo: ritmo?.[i], comparacao: comparacao?.[i] }));
  const ultimo = atual.length - 1;
  const feito = atual[ultimo] ?? 0;
  const resumo = [
    `${rotulo}: ${rotuloAtual} ${formatar(feito, formato)} até ${dias[ultimo] ?? dias[0]}`,
    // O "esperado até hoje" fica só na Meta do mês (uma conta só na tela); aqui, onde o ritmo da meta termina.
    ritmo && `meta acumulada fecha o mês em ${formatar(ritmo.at(-1) ?? 0, formato)}`,
    comparacao && rotuloComparacao && `${rotuloComparacao} ${formatar(comparacao[Math.min(ultimo, comparacao.length - 1)] ?? 0, formato)} no mesmo dia`,
  ]
    .filter(Boolean)
    .join("; ");

  // Nada feito, sem meta e sem nada na comparação: um eixo com cinco "0" e uma reta não dizem nada.
  const zerado = (s: number[] | null) => !s || s.every((v) => !v);
  if (zerado(atual) && zerado(ritmo) && zerado(comparacao))
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        Nada registrado em {rotuloAtual.charAt(0).toLowerCase() + rotuloAtual.slice(1)}
        {marcaHoje ? " ainda" : ""}.
      </p>
    );

  return (
    <div className="grid gap-3">
      <p aria-hidden className="flex flex-wrap gap-x-4 gap-y-1 text-[0.65625rem] text-muted-foreground [[data-modo-tv]_&]:text-sm">
        <span className="flex items-center gap-1.5">
          <span className="h-[3px] w-3.5 rounded-full" style={{ background: COR_ATUAL }} /> {rotuloAtual}
        </span>
        {ritmo && (
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 border-t-2 border-dashed" style={{ borderColor: COR_REFERENCIA }} /> Meta acumulada
          </span>
        )}
        {comparacao && rotuloComparacao && (
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-3.5 rounded-full" style={{ background: COR_COMPARACAO }} /> {rotuloComparacao}
          </span>
        )}
      </p>

      <ChartContainer config={{ atual: { label: rotuloAtual, color: COR_ATUAL } }} className="aspect-auto h-52 w-full sm:h-60 [[data-modo-tv]_&]:h-36" role="img" aria-label={resumo}>
        {/* Sem a camada de teclado: o contêiner é uma imagem com o resumo no rótulo. */}
        <ComposedChart data={dados} margin={{ top: 8, right: 12, left: 0, bottom: 0 }} accessibilityLayer={false}>
          <defs>
            <linearGradient id={gradiente} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COR_ATUAL} stopOpacity={0.28} />
              <stop offset="100%" stopColor={COR_ATUAL} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="dia" tickLine={false} axisLine={false} tickMargin={8} tick={EIXO} ticks={dias.filter((_, i) => i % 7 === 0)} />
          {/* Eixo sem "R$" em cada marca ("600 mil"); a dica mantém o "R$". */}
          <YAxis
            tickLine={false}
            axisLine={false}
            width={Math.round((formato === "moeda" ? 48 : 32) * escala)}
            tick={EIXO}
            tickFormatter={(v: number) => formatarCompacto(v, formato).replace(/^R\$\s*/, "")}
          />
          <ChartTooltip
            cursor={{ stroke: COR_REFERENCIA, strokeDasharray: "4 4" }}
            content={({ active, payload, label }) => (
              <Dica active={active} payload={payload} label={label} formato={formato} nomes={[rotuloAtual, rotuloComparacao ?? ""]} />
            )}
          />
          {ritmo && (
            <Line dataKey="ritmo" type="linear" stroke={COR_REFERENCIA} strokeWidth={1.5} strokeDasharray="5 5" dot={false} activeDot={false} isAnimationActive={false} />
          )}
          {comparacao && (
            <Line dataKey="comparacao" type="linear" stroke={COR_COMPARACAO} strokeWidth={1.5} strokeOpacity={0.8} dot={false} activeDot={false} isAnimationActive={false} />
          )}
          <Area
            dataKey="atual"
            type="linear"
            stroke={COR_ATUAL}
            strokeWidth={3}
            fill={`url(#${gradiente})`}
            activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--card)" }}
            isAnimationActive={false}
          />
          {ultimo >= 0 && (
            <ReferenceDot
              x={dias[ultimo]}
              y={feito}
              r={5}
              fill={COR_ATUAL}
              stroke="var(--card)"
              strokeWidth={2}
              label={marcaHoje ? { content: (p) => <MarcaHoje viewBox={p.viewBox} texto={`${formatarArredondado(feito, formato)} hoje`} aDireita={ultimo < dias.length * 0.7} /> } : undefined}
            />
          )}
        </ComposedChart>
      </ChartContainer>
    </div>
  );
}

/** "R$ 412 mil hoje" acima do último ponto: à direita dele no começo do mês, à esquerda perto do fim (não sai do gráfico). */
function MarcaHoje({ viewBox, texto, aDireita }: { viewBox?: unknown; texto: string; aDireita: boolean }) {
  const { x = 0, y = 0, width = 0 } = (viewBox ?? {}) as { x?: number; y?: number; width?: number };
  const centro = x + width / 2;
  return (
    // Halo na cor do fundo (o --card é translúcido): o texto não encosta na linha tracejada.
    <text
      x={aDireita ? centro + 6 : centro - 6}
      y={y - 6}
      textAnchor={aDireita ? "start" : "end"}
      fontSize="0.65625rem"
      fontWeight={600}
      fill="var(--primary-texto)"
      stroke="var(--background)"
      strokeWidth={3}
      strokeLinejoin="round"
      paintOrder="stroke"
    >
      {texto}
    </text>
  );
}

function Dica({ active, payload, label, formato, nomes: [nomeAtual, nomeComparacao] }: PropsDica & { formato: Formato; nomes: [string, string] }) {
  if (!active || !payload?.length) return null;
  const linha = payload[0].payload as Linha;
  const itens: [string, number | undefined][] = [
    [nomeAtual, linha.atual],
    // Até o fim do dia; o "esperado até hoje" (até ontem) é o da Meta do mês. Mesmo nome da legenda.
    ["Meta acumulada", linha.ritmo],
    [nomeComparacao, linha.comparacao],
  ];
  return (
    <div className="grid min-w-40 gap-1 rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="font-medium">Até {String(label)}</p>
      {itens.map(([nome, valor]) =>
        valor == null ? null : (
          <div key={nome} className="flex items-center gap-2">
            <span className="text-muted-foreground">{nome}</span>
            <span className="ml-auto font-medium tabular-nums" title={formatar(valor, formato)}>
              {formatarArredondado(valor, formato)}
            </span>
          </div>
        ),
      )}
    </div>
  );
}
