"use client";

import { useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { AVISOS_MUDARAM } from "@/app/(app)/sino";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

/** Atualiza a tela sem recarregar (o PWA no iPhone não tem o botão do navegador): refaz os dados do servidor e o sino. */
export function Atualizar() {
  const router = useRouter();
  const [atualizando, iniciar] = useTransition();
  const pediu = useRef(false);
  // Sinal de atualização (pedido do Mayke, 24/10): barra fina sob o topo e cartões pulsando enquanto atualiza; com o dado
  // novo, os blocos da tela reaparecem em sequência, os cartões sobem e os minigráficos se redesenham. Só sinaliza no <html>; as animações ficam no globals.css (motion-safe).
  useEffect(() => {
    const html = document.documentElement;
    if (atualizando) {
      delete html.dataset.revelar;
      html.dataset.atualizando = "";
      return () => delete html.dataset.atualizando; // sai também se o botão desmontar no meio
    }
    if (!pediu.current) return;
    pediu.current = false;
    delete html.dataset.atualizando;
    document.querySelectorAll<HTMLElement>('#conteudo [data-slot="card"]').forEach((c, i) => c.style.setProperty("--ordem", String(Math.min(i, 12))));
    document.querySelectorAll<HTMLElement>("#conteudo > *").forEach((c, i) => c.style.setProperty("--ordem-bloco", String(Math.min(i, 8))));
    html.dataset.revelar = "";
    const fim = setTimeout(() => delete html.dataset.revelar, 1400);
    return () => {
      clearTimeout(fim);
      delete html.dataset.revelar;
    };
  }, [atualizando]);

  function atualizar() {
    if (atualizando) return;
    pediu.current = true;
    window.dispatchEvent(new Event(AVISOS_MUDARAM)); // o refresh não refaz a leitura do sino
    iniciar(() => router.refresh());
  }
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {/* aria-disabled em vez de disabled: o foco do teclado não se perde enquanto atualiza. */}
        <Button variant="ghost" size="icon" aria-label="Atualizar" aria-disabled={atualizando} aria-busy={atualizando || undefined} onClick={atualizar} className="aria-disabled:opacity-50">
          <RefreshCw aria-hidden className={atualizando ? "motion-safe:animate-spin" : undefined} />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Atualizar</TooltipContent>
    </Tooltip>
  );
}
