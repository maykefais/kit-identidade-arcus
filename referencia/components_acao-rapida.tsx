"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarPlus, MessageSquarePlus, Plus, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import type { AcaoRapida as Acao, Area } from "@/lib/navegacao";

const ICONES: Partial<Record<Area, LucideIcon>> = { reunioes: CalendarPlus, negociacoes: MessageSquarePlus };

function Opcoes({ acoes, ...posicao }: { acoes: Acao[] } & React.ComponentProps<typeof DropdownMenuContent>) {
  return (
    <DropdownMenuContent sideOffset={12} className="w-auto min-w-56 rounded-2xl p-1.5" {...posicao}>
      {acoes.map((acao) => {
        const Icone = ICONES[acao.area] ?? Plus;
        return (
          <DropdownMenuItem key={acao.href} asChild className="min-h-12 gap-3 rounded-xl px-3 text-[0.9375rem] font-medium">
            <Link href={acao.href}>
              <Icone aria-hidden />
              {acao.titulo}
            </Link>
          </DropdownMenuItem>
        );
      })}
    </DropdownMenuContent>
  );
}

/**
 * Celular: botão "+" flutuante acima da barra inferior (que também flutua); a página reserva espaço no fim para ele
 * não cobrir conteúdo. Some ao rolar para baixo (não cobre o campo que a pessoa está preenchendo) e perto do fim da
 * página (não cobre o botão de enviar), e volta ao rolar para cima longe do fim, no topo e ao trocar de tela. No computador, o "Novo" fica no topo do menu lateral (V5).
 */
export function AcaoRapida({ acoes }: { acoes: Acao[] }) {
  const recolhido = useRecolherAoDescer();
  if (!acoes.length) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          data-cromo
          aria-label="Novo registro"
          data-recolhido={recolhido || undefined}
          // Recolhido: fora da tela e fora do Tab (inert não vale num botão que o Radix controla).
          tabIndex={recolhido ? -1 : undefined}
          className="transition-[translate,opacity] duration-200 motion-reduce:transition-none data-recolhido:pointer-events-none data-recolhido:translate-y-40 data-recolhido:opacity-0 fixed right-[max(1rem,env(safe-area-inset-right))] bottom-[calc(5.75rem+max(0.75rem,env(safe-area-inset-bottom)))] z-30 size-14 shadow-lg md:hidden [&_svg]:size-6! [&_svg]:transition-transform data-[state=open]:[&_svg]:rotate-45"
        >
          <Plus aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <Opcoes acoes={acoes} side="top" align="end" />
    </DropdownMenu>
  );
}

/** Computador: "Novo" no topo do menu lateral, com as mesmas opções do "+" do celular. */
export function BotaoNovo({ acoes }: { acoes: Acao[] }) {
  if (!acoes.length) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          tooltip="Novo"
          className="h-11 bg-primary font-semibold text-primary-foreground hover:bg-primary-destaque hover:text-primary-foreground active:bg-primary-destaque active:text-primary-foreground data-[state=open]:bg-primary-destaque data-[state=open]:text-primary-foreground"
        >
          <Plus aria-hidden />
          <span>Novo</span>
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <Opcoes acoes={acoes} side="right" align="start" />
    </DropdownMenu>
  );
}

/** Distância do fim (px) em que o "+" fica escondido: a altura dele, a da barra de baixo e a do último campo. */
const FIM = 320;

/** true depois de rolar para baixo ou perto do fim; volta a false ao subir longe do fim, perto do topo e ao trocar de tela. */
function useRecolherAoDescer() {
  const caminho = usePathname();
  // Guardado com a tela em que aconteceu: trocar de tela já mostra o "+" sem esperar a rolagem.
  const [recolhidoEm, setRecolhidoEm] = useState<string | null>(null);
  useEffect(() => {
    let anterior = window.scrollY;
    function avaliar() {
      const atual = window.scrollY;
      // Lote 2, ponto 6: perto do fim da página o "+" cobriria o último botão ou campo ("Registrar reunião", "Anotação")
      // ao subir um pouco (ou no repique do iPhone); fica escondido até a pessoa se afastar do fim. Vale também sem
      // rolar: posição restaurada, conteúdo que cresce ou encolhe, barra do Safari. No topo (até 80 px) o "+" fica.
      const perto = document.documentElement.scrollHeight - window.innerHeight - atual < FIM;
      if (!perto && Math.abs(atual - anterior) < 8) return; // ignora o tremido do toque
      setRecolhidoEm(atual > 80 && (atual > anterior || perto) ? caminho : null);
      anterior = atual;
    }
    const tamanho = new ResizeObserver(avaliar); // também avalia ao montar
    tamanho.observe(document.body);
    window.addEventListener("scroll", avaliar, { passive: true });
    window.addEventListener("resize", avaliar);
    return () => {
      tamanho.disconnect();
      window.removeEventListener("scroll", avaliar);
      window.removeEventListener("resize", avaliar);
    };
  }, [caminho]);
  return recolhidoEm === caminho;
}
