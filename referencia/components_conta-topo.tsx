"use client";

import { useEffect, useRef } from "react";
import { ChevronDown, LogOut, Moon, Sun } from "lucide-react";
import { escolherTema } from "@/components/alternar-tema";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { iniciais } from "@/lib/formatos";

/** Conta no topo: foto (ou iniciais) e nome truncado; no celular só a foto. O menu tem "Sair" (POST em /sair) e, no celular, o tema. */
export function ContaTopo({ nome, email, foto }: { nome: string; email: string; foto: string | null }) {
  const img = useRef<HTMLImageElement>(null);
  // Foto que falhou antes da hidratação (o onError já passou): some e deixa as iniciais, que ficam por baixo.
  useEffect(() => {
    const el = img.current;
    if (el && el.complete && el.naturalWidth === 0) el.hidden = true;
  }, []);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        data-controle // toque de 44px no celular (regra do globals.css)
        aria-label={`Conta: ${nome}`}
        className="vidro flex h-10 max-w-[220px] items-center gap-2.5 rounded-xl p-1 pr-1.5 text-[12.5px] font-semibold text-foreground outline-none hover:bg-foreground/8 focus-visible:ring-2 aria-expanded:bg-foreground/8 focus-visible:ring-ring md:pr-2"
      >
        <span aria-hidden className="relative grid size-[30px] shrink-0 place-items-center overflow-hidden rounded-[9px] bg-accent text-[11px] text-accent-foreground">
          {iniciais(nome)}
          {foto && (
            // Foto da conta Google (host no img-src do CSP): <img> simples de 30 px por cima das iniciais.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              ref={img}
              src={foto}
              alt=""
              width={30}
              height={30}
              referrerPolicy="no-referrer"
              onError={(e) => (e.currentTarget.hidden = true)}
              className="absolute inset-0 size-full object-cover"
            />
          )}
        </span>
        {/* Nome só a partir de lg: entre 768 e 1.023 px, com o menu aberto, ele espremia a busca até sumir. */}
        <span className="hidden truncate lg:inline">{nome}</span>
        <ChevronDown aria-hidden className="hidden size-3.5 shrink-0 text-muted-foreground lg:inline" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuLabel className="grid leading-tight">
          <span className="truncate font-medium">{nome}</span>
          <span className="truncate text-xs font-normal text-muted-foreground">{email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {/* Celular: o tema sai do topo (não cabe com o Atualizar a 360 px) e vem para cá; o texto troca pelo tema da página. */}
        <DropdownMenuItem
          className="md:hidden"
          onSelect={() => escolherTema(document.documentElement.classList.contains("dark") ? "claro" : "escuro")}
        >
          <Moon aria-hidden className="dark:hidden" />
          <span className="dark:hidden">Tema escuro</span>
          <Sun aria-hidden className="hidden dark:block" />
          <span className="hidden dark:inline">Tema claro</span>
        </DropdownMenuItem>
        <form action="/sair" method="post">
          <DropdownMenuItem asChild>
            <button type="submit" className="w-full">
              <LogOut aria-hidden />
              Sair
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
