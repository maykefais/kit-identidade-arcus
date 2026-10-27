import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { AcaoRapida } from "@/components/acao-rapida";
import { AlternarTema } from "@/components/alternar-tema";
import { Atualizar } from "@/components/atualizar";
import { BuscaRapida } from "@/components/busca-rapida";
import { ContaTopo } from "@/components/conta-topo";
import { EsqueletoApp } from "@/components/esqueletos";
import { MemoriaVolta } from "@/components/memoria-volta";
import { MenuLateral } from "@/components/menu-lateral";
import { NavegacaoInferior } from "@/components/navegacao-inferior";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { temNivel } from "@/lib/auth/niveis";
import { lerPermissoes } from "@/lib/auth/permissoes";
import { exigirColaborador } from "@/lib/auth/sessao";
import { acoesRapidas, inicioDe, itensVisiveis } from "@/lib/navegacao";
import { temCloserNoAcesso } from "./reunioes/opcoes";
import { Sino } from "./sino";

// Com cacheComponents, dados de sessão (cookies) precisam ficar dentro de <Suspense>.
async function Protegido({ children }: { children: React.ReactNode }) {
  const eu = await exigirColaborador();
  const [permissoes, cookieStore] = await Promise.all([lerPermissoes(eu.id), cookies()]);
  const itens = itensVisiveis(permissoes);
  const inicio = inicioDe(eu, permissoes);
  // O "Novo" só oferece o que a pessoa consegue concluir (N21): reunião pede um closer no acesso.
  const todas = acoesRapidas(permissoes);
  const semReuniao = todas.some((a) => a.area === "reunioes") && !(await temCloserNoAcesso(eu, permissoes));
  const acoes = semReuniao ? todas.filter((a) => a.area !== "reunioes") : todas;

  // Áreas seguras do iPhone: entalhe no topo, barra de início embaixo e laterais quando deitado.
  return (
    <>
      {/* Primeiro item do Tab: pula o menu e o topo (só aparece com o foco). */}
      <a
        href="#conteudo"
        className="sr-only z-50 rounded-[10px] bg-popover text-sm font-semibold text-popover-foreground shadow-lg outline-none focus:not-sr-only focus:fixed focus:px-4 focus:top-[max(0.5rem,env(safe-area-inset-top))] focus:left-[max(0.5rem,env(safe-area-inset-left))] focus:inline-flex focus:min-h-11 focus:items-center focus:ring-3 focus:ring-ring"
      >
        Pular para o conteúdo
      </a>
      <SidebarProvider defaultOpen={cookieStore.get("sidebar_state")?.value !== "false"}>
        <MenuLateral itens={itens} acoes={acoes} inicio={inicio} />
        {/* min-w-0: sem ele, o conteúdo largo empurra a página para a direita entre 768 e ~870 px (menu aberto). */}
        <SidebarInset className="min-w-0">
          <header data-cromo className="relative shrink-0 pt-[calc(env(safe-area-inset-top)+0.5rem)] md:pt-[env(safe-area-inset-top)] pr-[max(1rem,env(safe-area-inset-right))] pl-[max(1rem,env(safe-area-inset-left))]">
            <div className="flex h-14 items-center gap-2 md:gap-3">
              <SidebarTrigger size="icon" className="-ml-1 hidden md:inline-flex" />
              {/* Celular: a marca no topo; o menu fica na barra inferior. */}
              <Link href={inicio} aria-label="Arcus, Sistema Comercial: início" className="flex h-11 items-center rounded-md md:hidden">
                <Image src="/marca/arcus-logo-claro.png" alt="" width={96} height={28} priority className="dark:hidden" />
                <Image src="/marca/arcus-fundo-escuro.png" alt="" width={97} height={28} className="hidden dark:block" />
              </Link>
              {/* Busca rápida: campo até 460px; no celular vira a lupa, junto dos outros ícones à direita. */}
              <div className="flex min-w-0 flex-1 justify-end md:justify-start">
                <BuscaRapida />
              </div>
              <div className="flex items-center gap-1 md:gap-2">
                <Atualizar />
                <Sino podeVer={temNivel(permissoes, "avisos", "ver")} />
                {/* A 360 px não cabem 5 controles de 44 px com a logo: no celular o tema fica no menu da conta. */}
                <div className="hidden md:flex">
                  <AlternarTema />
                </div>
                <ContaTopo nome={eu.nome} email={eu.email} foto={eu.foto} />
              </div>
            </div>
          </header>
          <div id="conteudo" tabIndex={-1} className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 pt-4 pr-[max(1rem,env(safe-area-inset-right))] pb-[calc(11rem+env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] outline-none md:p-8">
            {children}
          </div>
          <NavegacaoInferior itens={itens} inicio={inicio} />
          <AcaoRapida acoes={acoes} />
          <MemoriaVolta />
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}

export default function LayoutApp({ children }: LayoutProps<"/">) {
  return (
    <Suspense fallback={<EsqueletoApp />}>
      <Protegido>{children}</Protegido>
    </Suspense>
  );
}
