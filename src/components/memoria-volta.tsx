"use client";

import { useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

// Última vista de cada tela (aba, filtros e mês no endereço) e a tela de onde a pessoa veio, por aba do navegador.
const CHAVE = "volta:";
const ler = (chave: string) => {
  try {
    return sessionStorage.getItem(CHAVE + chave);
  } catch {
    return null; // modo privado ou armazenamento bloqueado: a volta usa o endereço padrão
  }
};

/** Guarda o endereço completo de cada tela visitada; no layout, uma vez. */
export function MemoriaVolta() {
  const caminho = usePathname();
  const busca = useSearchParams().toString();
  useEffect(() => {
    try {
      const atual = sessionStorage.getItem(`${CHAVE}atual`);
      if (atual && atual !== caminho) sessionStorage.setItem(`${CHAVE}anterior`, ler(atual) ?? atual);
      sessionStorage.setItem(`${CHAVE}atual`, caminho);
      sessionStorage.setItem(CHAVE + caminho, busca ? `${caminho}?${busca}` : caminho);
    } catch {}
  }, [caminho, busca]);
  return null;
}

/** Tela de onde a pessoa veio (endereço completo), para voltar depois de gravar; sem memória, o padrão. */
export const telaAnterior = (padrao: string) => ler("anterior") ?? padrao;

const semAssinatura = () => () => {};

/**
 * "← lugar de cima" (P1): volta à última vista daquela tela, com aba, filtros e mês. Endereço com parâmetros
 * (ex.: o mês da meta aberta) vale como está; lugar de cima com o mesmo caminho desta tela (correção em `?editar=1`,
 * pedido em `/pedidos/novo?reuniao=`) usa o endereço padrão, senão a memória apontaria para a própria tela.
 */
export function LinkVolta({ href, rotulo }: { href: string; rotulo: string }) {
  const caminho = usePathname();
  const destino = useSyncExternalStore(
    semAssinatura,
    () => (href.includes("?") || href === caminho ? href : (ler(href) ?? href)),
    () => href,
  );
  return (
    <Link
      href={destino}
      aria-label={`Voltar para ${rotulo}`}
      className="-ml-2 inline-flex min-h-11 w-fit items-center gap-1.5 rounded-full px-2 text-sm font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <ArrowLeft className="size-4" aria-hidden />
      {rotulo}
    </Link>
  );
}
