"use client";

import { useSyncExternalStore } from "react";
import { Toaster } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

function assinar(aoMudar: () => void) {
  const observador = new MutationObserver(aoMudar);
  observador.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observador.disconnect();
}

const escuroAgora = () => document.documentElement.classList.contains("dark");

/** Avisos de sucesso e erro, no tema escolhido. Uso: `toast.success("Salvo")` (import de "sonner"). */
export function Avisos() {
  const escuro = useSyncExternalStore(assinar, escuroAgora, () => false);
  const celular = useIsMobile(); // mesmo corte da barra inferior e do "+"
  return (
    <Toaster
      theme={escuro ? "dark" : "light"}
      // No computador, embaixo: em cima o aviso nascia sob o cursor, sobre os botões do cabeçalho da página, e parava
      // de contar o tempo enquanto o mouse estava em cima. No celular continua em cima (embaixo ficam a barra e o "+").
      position={celular ? "top-right" : "bottom-right"}
      // Sem o "x": tinha 20px (abaixo dos 44px de toque) e rótulo em inglês; o aviso some sozinho ou arrastando.
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{ classNames: { toast: "font-sans! shadow-md!" } }}
    />
  );
}
