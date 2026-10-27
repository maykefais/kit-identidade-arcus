import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Rótulo pequeno em cinza sobre o valor (visual novo). `destaque`: número grande, como valor do cartão. */
export function Dado({ rotulo, destaque, className, children }: { rotulo: string; destaque?: boolean; className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("grid min-w-0 gap-0.5", className)}>
      <dt className="text-xs text-muted-foreground">{rotulo}</dt>
      <dd className={cn("break-words tabular-nums", destaque ? "text-[1.75rem] leading-tight font-normal tracking-tight" : "text-sm font-medium")}>
        {children}
      </dd>
    </div>
  );
}

/** Ícone em quadradinho de fundo claro. `alerta` (flame) só para o que pede atenção; o resto em navy claro. */
export function IconeCartao({ icone: Icone, alerta }: { icone: LucideIcon; alerta?: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-11 shrink-0 items-center justify-center rounded-xl [&_svg]:size-5",
        alerta ? "bg-flame/12 text-flame" : "bg-accent text-accent-foreground",
      )}
    >
      <Icone />
    </span>
  );
}

/** Iniciais da empresa (ou da pessoa) no círculo do cartão. */
export function Iniciais({ nome, className }: { nome: string; className?: string }) {
  const letras = nome
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
  return (
    <span
      aria-hidden
      className={cn("flex size-11 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground", className)}
    >
      {letras}
    </span>
  );
}
