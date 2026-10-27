"use client";

import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

/**
 * Painel para formulário curto ou filtros: no celular abre de baixo (ao alcance do polegar, respeitando a
 * barra de início do iPhone); no computador, pela direita. O conteúdo rola se passar da altura.
 */
export function Gaveta({
  titulo,
  descricao,
  gatilho,
  aberto,
  aoMudar,
  voltarFoco,
  children,
}: {
  titulo: string;
  descricao?: string;
  /** Botão que abre (opcional quando o estado é controlado de fora). */
  gatilho?: React.ReactElement;
  aberto: boolean;
  aoMudar: (aberto: boolean) => void;
  /** Sem `gatilho` (aberta de um menu): põe o foco de volta ao fechar. */
  voltarFoco?: () => void;
  children: React.ReactNode;
}) {
  const celular = useIsMobile();
  return (
    <Sheet open={aberto} onOpenChange={aoMudar}>
      {gatilho && <SheetTrigger asChild>{gatilho}</SheetTrigger>}
      <SheetContent
        side={celular ? "bottom" : "right"}
        onCloseAutoFocus={voltarFoco && ((e) => (e.preventDefault(), voltarFoco()))}
        {...(!descricao && { "aria-describedby": undefined })}
        className={cn(
          "overflow-y-auto pb-6",
          celular && "max-h-[90dvh] rounded-t-2xl pb-[calc(1.5rem+env(safe-area-inset-bottom))]",
        )}
      >
        {celular && <div aria-hidden className="mx-auto mt-2 h-1.5 w-12 shrink-0 rounded-full bg-foreground/15" />}
        <SheetHeader className={cn("pr-14", celular && "pt-0")}>
          <SheetTitle>{titulo}</SheetTitle>
          {descricao && <SheetDescription>{descricao}</SheetDescription>}
        </SheetHeader>
        {children}
      </SheetContent>
    </Sheet>
  );
}
