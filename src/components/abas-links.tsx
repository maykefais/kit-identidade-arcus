import Link from "next/link";
import { cn } from "@/lib/utils";

/** Abas que são links (a escolhida vem do servidor pelo `?aba=`), com o visual do seletor das `Tabs`:
 *  trilho translúcido e a escolhida em flame. */
export function AbasLinks({
  rotulo,
  abas,
  atual,
  href,
}: {
  rotulo: string;
  abas: readonly { id: string; rotulo: string }[];
  atual: string;
  href: (id: string) => string;
}) {
  return (
    <nav aria-label={rotulo} className="flex w-full gap-[3px] rounded-[10px] bg-trilho p-[3px] sm:w-auto">
      {abas.map((a) => (
        <Link
          key={a.id}
          href={href(a.id)}
          aria-current={a.id === atual ? "page" : undefined}
          className={cn(
            "flex min-h-9 flex-1 items-center justify-center rounded-[8px] px-3 text-sm font-semibold whitespace-nowrap transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-foreground focus-visible:outline-solid toque:min-h-11 sm:flex-none",
            a.id === atual ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {a.rotulo}
        </Link>
      ))}
    </nav>
  );
}
