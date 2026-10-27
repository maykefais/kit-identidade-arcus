"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * Análise recolhível: `<details>` fechado no celular e aberto a partir de `md`. O servidor manda fechado e o efeito abre
 * no computador, uma vez só; até lá (antes da hidratação), o CSS já mostra o conteúdo a partir de `md`
 * (`::details-content`), então no computador nada pula. Depois do `data-pronto`, abrir e fechar é da pessoa: mudar a
 * largura (girar o celular, redimensionar) não reabre nem fecha.
 */
export function Recolhivel({
  titulo,
  resumo,
  exato,
  className,
  children,
}: {
  titulo: string;
  resumo: string;
  exato?: string;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    // A largura lida direto, uma vez (o useIsMobile da hidratação vale `false` no primeiro efeito). Mesmo corte do `md`.
    d.open = !window.matchMedia("(max-width: 767px)").matches;
    d.dataset.pronto = "";
  }, []);

  return (
    <Card className={cn("gap-0 py-0", className)}>
      <details ref={ref} className="group md:not-data-pronto:details-content:[content-visibility:visible]">
        <summary className="flex min-h-11 cursor-pointer list-none items-center gap-3 px-5 py-3 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
          <h2 className="text-sm font-semibold whitespace-nowrap">{titulo}</h2>
          {/* Resumo arredondado ("R$ 1,24 mi"): o exato no title e para o leitor de tela. */}
          <span title={exato} className="ml-auto text-right text-xs text-pretty text-muted-foreground tabular-nums">
            <span aria-hidden={!!exato}>{resumo}</span>
            {exato && <span className="sr-only">{exato}</span>}
          </span>
          <ChevronDown aria-hidden className="size-4 shrink-0 text-muted-foreground group-open:rotate-180 md:group-not-data-pronto:rotate-180" />
        </summary>
        <div className="px-5 pb-5">{children}</div>
      </details>
    </Card>
  );
}
