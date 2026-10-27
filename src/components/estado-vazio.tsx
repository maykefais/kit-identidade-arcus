import Image from "next/image";
import { cn } from "@/lib/utils";

/** Tela ou bloco sem conteúdo: diz o que falta e oferece o próximo passo (children). */
export function EstadoVazio({
  titulo,
  descricao,
  children,
  className,
}: {
  titulo: string;
  descricao?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-foreground/15 px-6 py-14 text-center",
        className,
      )}
    >
      {/* Símbolo navy no fundo claro e flame no escuro, como pede o brand book. */}
      <Image src="/marca/arcus-simbolo-navy.png" alt="" width={44} height={44} className="dark:hidden" />
      <Image src="/marca/arcus-simbolo.png" alt="" width={44} height={44} className="hidden dark:block" />
      <div className="grid max-w-md gap-1">
        <p className="text-base font-semibold">{titulo}</p>
        {descricao && <p className="text-sm text-muted-foreground">{descricao}</p>}
      </div>
      {children && <div className="flex flex-wrap justify-center gap-2">{children}</div>}
    </div>
  );
}
