"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Menu } from "lucide-react";
import { ICONES_AREA } from "@/components/menu-lateral";
import { useSidebar } from "@/components/ui/sidebar";
import { areaNoMenu, caminhoDoMenu, itemNoCaminho, itensBarraInferior, type Inicio, type ItemMenu } from "@/lib/navegacao";
import { cn } from "@/lib/utils";

// Item ativo em cápsula cinza, como a barra do WhatsApp no iOS.
// Rótulo no piso de 10,5 px e sem folga lateral: "Negociações" cabe inteiro a 360 px.
const ESTILO_ITEM =
  "flex min-h-13 w-full flex-col items-center justify-center gap-0.5 rounded-full px-0 text-[0.65625rem] font-medium tracking-[-0.03em] text-muted-foreground outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 aria-[current=page]:bg-secondary aria-[current=page]:text-foreground";

/** Celular (abaixo de `md`): barra flutuante (cápsula de vidro) com as áreas do dia a dia e o Menu (abre o menu lateral). */
export function NavegacaoInferior({ itens, inicio }: { itens: ItemMenu[]; inicio: Inicio }) {
  const caminho = caminhoDoMenu(usePathname(), useSearchParams());
  const { openMobile, setOpenMobile } = useSidebar();
  // O Painel leva ao início da pessoa e fica ativo nos dois painéis.
  const principais = itensBarraInferior(itens, inicio);
  const menuAtivo = !principais.some((item) => itemNoCaminho(item, caminho));
  // Fora da barra, o Menu mostra a área em que a pessoa está (ex.: "Metas") e continua abrindo o menu.
  const area = areaNoMenu(itens, caminho);
  const IconeMenu = area ? ICONES_AREA[area.area] : Menu;

  return (
    <nav
      data-cromo
      aria-label="Navegação principal"
      className="fixed right-[max(0.75rem,env(safe-area-inset-right))] bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-[max(0.75rem,env(safe-area-inset-left))] z-30 rounded-full border border-white/70 bg-card/75 p-1 shadow-lg backdrop-blur-xl backdrop-saturate-150 md:hidden dark:border-white/10"
    >
      <ul className="flex">
        {principais.map((item) => {
          const ativo = itemNoCaminho(item, caminho);
          const Icone = ICONES_AREA[item.area];
          return (
            <li key={item.href} className="min-w-0 flex-1">
              <Link href={item.href} aria-current={ativo ? "page" : undefined} className={ESTILO_ITEM}>
                <Icone className="size-5" aria-hidden />
                <span className="max-w-full truncate">{item.curto ?? item.titulo}</span>
              </Link>
            </li>
          );
        })}
        <li className="min-w-0 flex-1">
          <button
            type="button"
            onClick={() => setOpenMobile(true)}
            aria-haspopup="dialog"
            aria-expanded={openMobile}
            aria-label={area ? `Menu (${area.titulo})` : undefined}
            aria-current={area ? "page" : undefined}
            className={cn(ESTILO_ITEM, menuAtivo && "bg-secondary text-foreground")}
          >
            <IconeMenu className="size-5" aria-hidden />
            <span className="max-w-full truncate">{area?.curto ?? area?.titulo ?? "Menu"}</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
