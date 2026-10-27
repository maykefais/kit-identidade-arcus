"use client";

import { useEffect } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CHAVE_TEMA, lerPreferencia, temaEscuro, type PreferenciaTema } from "@/lib/tema";

const CONSULTA_ESCURO = "(prefers-color-scheme: dark)";

function preferenciaSalva(): PreferenciaTema {
  try {
    return lerPreferencia(localStorage.getItem(CHAVE_TEMA));
  } catch {
    return "sistema";
  }
}

function aplicar(preferencia: PreferenciaTema) {
  const escuro = temaEscuro(preferencia, matchMedia(CONSULTA_ESCURO).matches);
  document.documentElement.classList.toggle("dark", escuro);
  document.documentElement.style.colorScheme = escuro ? "dark" : "light";
}

/** Guarda a escolha e aplica (também usado pelo item "Tema" do menu da conta no celular). */
export function escolherTema(preferencia: PreferenciaTema) {
  try {
    localStorage.setItem(CHAVE_TEMA, preferencia);
  } catch {
    // Sem armazenamento: vale só nesta página.
  }
  aplicar(preferencia);
}

export function AlternarTema() {
  // Na preferência "sistema", acompanha a troca de tema do aparelho.
  useEffect(() => {
    const consulta = matchMedia(CONSULTA_ESCURO);
    const aoMudar = () => aplicar(preferenciaSalva());
    consulta.addEventListener("change", aoMudar);
    return () => consulta.removeEventListener("change", aoMudar);
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Alternar tema">
          <Sun className="dark:hidden" />
          <Moon className="hidden dark:block" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => escolherTema("claro")}>
          <Sun /> Claro
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => escolherTema("escuro")}>
          <Moon /> Escuro
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => escolherTema("sistema")}>
          <Monitor /> Do sistema
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
