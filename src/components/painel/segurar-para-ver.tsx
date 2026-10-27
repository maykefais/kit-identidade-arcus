"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Comissão sempre borrada: os valores só aparecem enquanto a pessoa segura o botão (rolar a página com o dedo sobre o
// cartão não revela nada) e somem ao soltar, ao trocar de aba e ao sair da página. Fora daqui, Ganho fica borrado.
const Visivel = createContext(false);

/** `botao={false}`: nada a revelar (sem plano no mês, só o texto): sem o botão, que não mudaria nada. */
export function SegurarParaVer({ rotulo, descricao, botao = true, children }: { rotulo: string; descricao?: ReactNode; botao?: boolean; children: ReactNode }) {
  const [visivel, setVisivel] = useState(false);
  const mostrar = () => setVisivel(true);
  const esconder = () => setVisivel(false);

  useEffect(() => {
    if (!visivel) return;
    // flushSync: esconde na hora, antes de a página ir para o bfcache ou virar a miniatura do alternador de abas.
    const fora = () => flushSync(() => setVisivel(false));
    document.addEventListener("visibilitychange", fora);
    window.addEventListener("pagehide", fora);
    window.addEventListener("blur", fora);
    return () => {
      document.removeEventListener("visibilitychange", fora);
      window.removeEventListener("pagehide", fora);
      window.removeEventListener("blur", fora);
    };
  }, [visivel]);

  return (
    <Card data-segurar="" className="sem-menu-toque select-none" onContextMenu={(e) => e.preventDefault()}>
      <CardHeader>
        <CardTitle>{rotulo}</CardTitle>
        {descricao && <CardDescription>{descricao}</CardDescription>}
        {botao && (
          <CardAction>
            <Button
              type="button"
              variant="outline"
              className={cn("min-h-11 touch-none", visivel && "bg-muted text-foreground")}
              aria-label="Segure para ver os valores"
              aria-pressed={visivel}
              onPointerDown={mostrar}
              onPointerUp={esconder}
              onPointerLeave={esconder}
              onPointerCancel={esconder}
              onKeyDown={(e) => (e.key === " " || e.key === "Enter") && mostrar()}
              onKeyUp={esconder}
              onBlur={esconder}
            >
              {visivel ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
              Segure para ver
            </Button>
          </CardAction>
        )}
      </CardHeader>
      <CardContent>
        <Visivel value={visivel}>{children}</Visivel>
      </CardContent>
    </Card>
  );
}

/** Valor de ganho: borrado e fora da árvore de acessibilidade (aria-hidden e inert) até a pessoa segurar. */
export function Ganho({ children }: { children: ReactNode }) {
  const visivel = useContext(Visivel);
  return visivel ? <span>{children}</span> : <span className="borrado" aria-hidden inert>{children}</span>;
}
