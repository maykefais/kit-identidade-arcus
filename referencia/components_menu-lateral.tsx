"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import {
  Bell,
  CalendarCheck,
  ChevronDown,
  CreditCard,
  Gift,
  Handshake,
  LayoutDashboard,
  Package,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Target,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BotaoNovo } from "@/components/acao-rapida";
import { caminhoDoMenu, itemAtivo, itemNoCaminho, type AcaoRapida, type Area, type Inicio, type ItemMenu } from "@/lib/navegacao";
import { cn } from "@/lib/utils";

export const ICONES_AREA: Record<Area, LucideIcon> = {
  painel: LayoutDashboard,
  reunioes: CalendarCheck,
  negociacoes: Handshake,
  pedidos: ShoppingCart,
  aprovacoes: ShieldCheck,
  avisos: Bell,
  metas: Target,
  bonificacoes: Gift,
  comissoes: Wallet,
  links: CreditCard,
  produtos: Package,
  usuarios: Users,
};

// Item do menu como no esboço: 44 px de altura, ícone num quadradinho de 30 px (gradiente flame no ativo).
const ITEM = "h-11 px-2.5 font-medium py-[7px] data-[active=true]:font-semibold data-[active=true]:shadow-[0_4px_14px_rgb(40_35_63/0.08)]";
const QUADRADINHO =
  "grid size-[30px] shrink-0 place-items-center rounded-[9px] bg-icone-menu text-sidebar-accent-foreground group-data-[active=true]/menu-button:bg-(image:--icone-menu-ativo) group-data-[active=true]/menu-button:text-white group-data-[active=true]/menu-button:shadow-[0_6px_14px_rgb(238_75_37/0.35)]";
// Submenu (Meu painel, Painel do time, Painel de marketing): o texto do filho alinha com o rótulo do pai e o fio cai sob o ícone.
const SUBMENU = "ml-[27px] pl-[16px]";
// Subitem de 44 px; o escolhido sem fundo (o pai já tem): texto em negrito e um traço flame sobre o fio da esquerda.
const SUBITEM =
  "h-11 font-medium data-[active=true]:bg-transparent data-[active=true]:font-semibold data-[active=true]:text-sidebar-foreground data-[active=true]:hover:bg-sidebar-accent";
const TRACO =
  "before:absolute before:top-2 before:bottom-2 before:-left-[17.5px] before:hidden before:w-0.5 before:rounded-full before:bg-primary has-[[data-active=true]]:before:block";
// Seta do grupo: 44 px no canto direito do item (o rótulo do pai deixa o espaço dela).
const SETA =
  "absolute top-0 right-0 grid size-11 place-items-center rounded-xl text-sidebar-foreground/70 outline-hidden ring-sidebar-ring hover:bg-foreground/10 hover:text-sidebar-foreground focus-visible:ring-2";

// Grupo aberto ou fechado: guardado por grupo (`menu-aberto:<chave>`); sem localStorage, vale até recarregar.
const memoria = new Map<string, boolean>();
const ouvintes = new Set<() => void>();
function assinar(aoMudar: () => void) {
  ouvintes.add(aoMudar);
  return () => void ouvintes.delete(aoMudar);
}
function lerAberto(chave: string): boolean | undefined {
  if (memoria.has(chave)) return memoria.get(chave);
  try {
    const valor = localStorage.getItem(`menu-aberto:${chave}`);
    return valor === null ? undefined : valor === "1";
  } catch {
    return undefined;
  }
}
function guardarAberto(chave: string, aberto: boolean) {
  memoria.set(chave, aberto);
  try {
    localStorage.setItem(`menu-aberto:${chave}`, aberto ? "1" : "0");
  } catch {
    // Sem armazenamento: fica na memória da página.
  }
  ouvintes.forEach((aoMudar) => aoMudar());
}
/** Sem nada guardado, o grupo abre quando contém a tela atual. */
function useAberto(chave: string, contemAtual: boolean): [boolean, () => void] {
  const guardado = useSyncExternalStore(assinar, () => lerAberto(chave), () => undefined);
  const aberto = guardado ?? contemAtual;
  return [aberto, () => guardarAberto(chave, !aberto)];
}

type Props = { item: ItemMenu; caminho: string; inicio: Inicio; recolhido: boolean; fechar: () => void };

function Rotulo({ item }: { item: ItemMenu }) {
  const Icone = item.area ? ICONES_AREA[item.area] : Settings;
  return (
    <>
      <span className={QUADRADINHO}>
        <Icone aria-hidden />
      </span>
      <span>{item.titulo}</span>
    </>
  );
}

/**
 * Painel e Configurações: a seta mostra ou esconde os filhos; o nome do Painel leva ao início da pessoa e o de
 * Configurações abre e fecha. Recolhido (computador), o ícone abre um menu suspenso com os filhos.
 */
function Grupo({ item, filhos, caminho, inicio, recolhido, fechar }: Props & { filhos: NonNullable<ItemMenu["filhos"]> }) {
  const chave = item.chave ?? item.href;
  const ativo = itemNoCaminho(item, caminho);
  const [aberto, alternar] = useAberto(chave, ativo);
  const [suspenso, setSuspenso] = useState(false);
  const id = `submenu-${chave}`;
  // O aria-current fica num item só: no filho visível ou, com os filhos escondidos, no pai.
  const atualNoPai = ativo && (recolhido ? !suspenso : !aberto) ? "page" : undefined;

  if (recolhido)
    return (
      <SidebarMenuItem>
        <DropdownMenu open={suspenso} onOpenChange={setSuspenso}>
          <DropdownMenuTrigger asChild>
            {/* Recolhido, o rótulo some: o nome do botão vem do aria-label. */}
            <SidebarMenuButton isActive={ativo} tooltip={item.titulo} aria-label={item.titulo} aria-current={atualNoPai} className={ITEM}>
              <Rotulo item={item} />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="start" sideOffset={12} className="w-auto min-w-48 rounded-2xl p-1.5">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="px-3">{item.titulo}</DropdownMenuLabel>
              {filhos.map((filho) => {
                const filhoAtivo = itemAtivo(filho.href, caminho);
                return (
                  <DropdownMenuItem
                    key={filho.href}
                    asChild
                    className="min-h-11 rounded-xl px-3 text-base font-medium aria-[current=page]:font-semibold aria-[current=page]:text-foreground"
                  >
                    <Link href={filho.href} aria-current={filhoAtivo ? "page" : undefined}>
                      {filho.titulo}
                    </Link>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    );

  return (
    <SidebarMenuItem>
      {item.chave === "painel" ? (
        <SidebarMenuButton asChild isActive={ativo} className={cn(ITEM, "pr-11")}>
          <Link href={inicio} aria-current={atualNoPai} onClick={fechar}>
            <Rotulo item={item} />
          </Link>
        </SidebarMenuButton>
      ) : (
        <SidebarMenuButton
          isActive={ativo}
          aria-current={atualNoPai}
          aria-expanded={aberto}
          aria-controls={id}
          onClick={alternar}
          className={cn(ITEM, "pr-11")}
        >
          <Rotulo item={item} />
        </SidebarMenuButton>
      )}
      <button
        type="button"
        aria-label={`${aberto ? "Esconder" : "Mostrar"} ${item.titulo}`}
        aria-expanded={aberto}
        aria-controls={id}
        onClick={alternar}
        className={SETA}
      >
        <ChevronDown className={cn("size-4 motion-safe:transition-transform", !aberto && "-rotate-90")} aria-hidden />
      </button>
      <SidebarMenuSub id={id} hidden={!aberto} className={SUBMENU}>
        {filhos.map((filho) => {
          const filhoAtivo = itemAtivo(filho.href, caminho);
          return (
            <SidebarMenuSubItem key={filho.href} className={TRACO}>
              <SidebarMenuSubButton asChild isActive={filhoAtivo} className={SUBITEM}>
                <Link href={filho.href} aria-current={filhoAtivo ? "page" : undefined} onClick={fechar}>
                  <span>{filho.titulo}</span>
                </Link>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          );
        })}
      </SidebarMenuSub>
    </SidebarMenuItem>
  );
}

export function MenuLateral({ itens, acoes, inicio }: { itens: ItemMenu[]; acoes: AcaoRapida[]; inicio: Inicio }) {
  const caminho = caminhoDoMenu(usePathname(), useSearchParams());
  // No celular o menu é uma gaveta: fecha ao escolher o destino (lá o "Novo" é o "+" flutuante).
  const { isMobile, setOpenMobile, state } = useSidebar();
  // Recolhido (só no computador), os filhos vão para o menu suspenso do pai.
  const recolhido = state === "collapsed" && !isMobile;
  const fechar = () => setOpenMobile(false);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={inicio} aria-label="Arcus, Sistema Comercial: início" onClick={fechar}>
                {/* Menu claro: logo para fundo claro (escuro no tema escuro); recolhido, só o símbolo. */}
                <Image
                  src="/marca/arcus-logo-claro.png"
                  alt=""
                  width={96}
                  height={28}
                  priority
                  className="group-data-[collapsible=icon]:hidden dark:hidden"
                />
                <Image
                  src="/marca/arcus-fundo-escuro.png"
                  alt=""
                  width={97}
                  height={28}
                  className="hidden dark:block dark:group-data-[collapsible=icon]:hidden"
                />
                <Image
                  src="/marca/arcus-simbolo-claro.png"
                  alt=""
                  width={30}
                  height={30}
                  className="mx-auto hidden group-data-[collapsible=icon]:block dark:group-data-[collapsible=icon]:hidden"
                />
                <Image
                  src="/marca/arcus-simbolo.png"
                  alt=""
                  width={30}
                  height={30}
                  className="mx-auto hidden dark:group-data-[collapsible=icon]:block"
                />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {!isMobile && acoes.length > 0 && (
            <SidebarMenuItem className="mt-2">
              <BotaoNovo acoes={acoes} />
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {itens.map((item) => {
                const props = { item, caminho, inicio, recolhido, fechar };
                if (item.filhos) return <Grupo key={item.href} filhos={item.filhos} {...props} />;
                const ativo = itemNoCaminho(item, caminho);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={ativo} tooltip={item.titulo} className={ITEM}>
                      <Link href={item.href} aria-label={recolhido ? item.titulo : undefined} aria-current={ativo ? "page" : undefined} onClick={fechar}>
                        <Rotulo item={item} />
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
