import { formatarArredondado } from "@/lib/formatos";
import { cn } from "@/lib/utils";

const RAIO = 52;
const CIRCUNFERENCIA = 2 * Math.PI * RAIO;

/** Anel de progresso com o % no meio (metas de hoje): flame até a meta, verde com a meta batida. */
export function AnelProgresso({ fracao, rotulo, tamanho = 54, className }: { fracao: number; rotulo: string; tamanho?: number; className?: string }) {
  const preenchido = Number.isFinite(fracao) ? Math.min(Math.max(fracao, 0), 1) : 0;
  // Abaixo da meta nunca mostra "100%" (99,6% arredondaria e o anel ainda não está verde).
  const pct = Number.isFinite(fracao) ? Math.round(fracao * 100) : 0;
  const texto = formatarArredondado((fracao < 1 ? Math.min(pct, 99) : pct) / 100, "percentual");
  return (
    <figure className={cn("relative grid shrink-0 place-items-center", className)} style={{ width: tamanho, height: tamanho }}>
      <svg viewBox="0 0 120 120" className="size-full -rotate-90" role="img" aria-label={`${rotulo}: ${texto}`}>
        <circle cx="60" cy="60" r={RAIO} fill="none" strokeWidth="12" className="stroke-foreground/10" />
        <circle
          cx="60"
          cy="60"
          r={RAIO}
          fill="none"
          strokeWidth="12"
          strokeLinecap="round"
          stroke={fracao >= 1 ? "var(--barra-verde)" : "var(--primary)"}
          strokeDasharray={CIRCUNFERENCIA}
          strokeDashoffset={CIRCUNFERENCIA * (1 - preenchido)}
          className="animar-anel transition-[stroke-dashoffset] duration-700 ease-out motion-reduce:transition-none"
          style={{ "--anel-total": CIRCUNFERENCIA } as React.CSSProperties}
        />
      </svg>
      <figcaption aria-hidden className="absolute text-[0.65625rem] font-semibold tabular-nums">
        {texto}
      </figcaption>
    </figure>
  );
}
