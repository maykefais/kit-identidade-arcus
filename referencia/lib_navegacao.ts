import type { Permissao } from "@/lib/auth/niveis";
import type { Database } from "@/lib/supabase/tipos";

type Enums = Database["public"]["Enums"];
export type Area = Enums["area_permissao"];

type Destino = { titulo: string; href: string };
/** Item do menu. Com filhos, é um grupo (`chave`): o Painel e Configurações, que não tem área própria. */
export type ItemMenu = Destino & { area?: Area; /** Rótulo da barra inferior do celular, quando o título não cabe. */ curto?: string; chave?: "painel" | "configuracoes"; filhos?: Destino[] };
type ItemDeArea = ItemMenu & { area: Area };

export type Inicio = "/" | "/meu-painel";

export const ITENS_MENU: readonly ItemDeArea[] = [
  { area: "painel", chave: "painel", titulo: "Painel", href: "/" },
  { area: "reunioes", titulo: "Reuniões", href: "/reunioes" },
  { area: "negociacoes", titulo: "Negociações", href: "/negociacoes" },
  { area: "pedidos", titulo: "Pedidos", href: "/pedidos" },
  { area: "links", titulo: "Links de pagamento", curto: "Links", href: "/links" },
  { area: "aprovacoes", titulo: "Aprovações", href: "/aprovacoes" },
  { area: "avisos", titulo: "Avisos", href: "/avisos" },
  { area: "metas", titulo: "Metas", href: "/metas" },
  { area: "bonificacoes", titulo: "Bonificações", href: "/bonificacoes" },
  { area: "comissoes", titulo: "Comissões", href: "/comissoes" },
  { area: "produtos", titulo: "Produtos", href: "/produtos" },
  { area: "usuarios", titulo: "Usuários", href: "/usuarios" },
];

const FILHOS_PAINEL = [
  { titulo: "Meu painel", href: "/meu-painel" },
  { titulo: "Painel do time", href: "/" },
  { titulo: "Painel de marketing", href: "/marketing" },
];

// Configurações (decisão do Mayke, 24/10/2026): cadastros que mudam pouco; Bonificações e Comissões ficam no menu.
const AREAS_CONFIGURACOES: readonly Area[] = ["metas", "produtos", "usuarios"];

/**
 * O painel (quadro geral) é visível a todos; as outras áreas pedem nível acima de "nenhum". Aprovações também abre
 * para quem corrige reuniões ("Aprovar" em Reuniões): é lá que a supervisão decide as reuniões em análise. Quem vê
 * Reuniões tem também "Meu painel" e "Painel de marketing" (submenu do Painel); a TV fica só com o Painel do time
 * (abre `/marketing` pelo endereço, sem menu). Metas, Produtos e Usuários
 * vão para o grupo Configurações, no fim (sem nenhuma delas, sem o grupo); o grupo leva ao primeiro filho.
 */
export function itensVisiveis(permissoes: { area: Area; nivel: Enums["nivel_permissao"] }[]): ItemMenu[] {
  const liberadas = new Set(permissoes.filter((p) => p.nivel !== "nenhum").map((p) => p.area));
  if (permissoes.some((p) => p.area === "reunioes" && p.nivel === "aprovar")) liberadas.add("aprovacoes");
  const visiveis = ITENS_MENU.filter((item) => item.area === "painel" || liberadas.has(item.area));
  const configuracoes = visiveis.filter((item) => AREAS_CONFIGURACOES.includes(item.area));
  const itens: ItemMenu[] = visiveis
    .filter((item) => !AREAS_CONFIGURACOES.includes(item.area))
    .map((item) => (item.area === "painel" && liberadas.has("reunioes") ? { ...item, filhos: FILHOS_PAINEL } : item));
  if (configuracoes.length)
    itens.push({ chave: "configuracoes", titulo: "Configurações", href: configuracoes[0].href, filhos: configuracoes });
  return itens;
}

/** Onde cada um começa: closer e SDR só com o próprio alcance em Reuniões no Meu painel; o resto no Painel do time. */
export function inicioDe(eu: { admin: boolean; funcao: string }, permissoes: Permissao[]): Inicio {
  const proprio = permissoes.some((p) => p.area === "reunioes" && p.nivel !== "nenhum" && p.escopo === "proprio");
  return !eu.admin && (eu.funcao === "sdr" || eu.funcao === "closer") && proprio ? "/meu-painel" : "/";
}

export function itemAtivo(href: string, caminho: string): boolean {
  if (href === "/") return caminho === "/";
  return caminho === href || caminho.startsWith(`${href}/`);
}

/** Caminho que o menu marca: o painel de outra pessoa (`/meu-painel?pessoa=`) conta como o Painel do time. */
export function caminhoDoMenu(caminho: string, busca: Pick<URLSearchParams, "has">): string {
  return caminho === "/meu-painel" && busca.has("pessoa") ? "/" : caminho;
}

/** Item de menu ativo: o pai com submenu fica ativo quando um filho está. */
export function itemNoCaminho(item: ItemMenu, caminho: string): boolean {
  return item.filhos ? item.filhos.some((f) => itemAtivo(f.href, caminho)) : itemAtivo(item.href, caminho);
}

/** Item de uma área pelo primeiro segmento da URL ("reunioes"); o painel fica em "/". */
export function itemPorSegmento(segmento: string): ItemDeArea | undefined {
  return ITENS_MENU.find((item) => item.href !== "/" && item.href === `/${segmento}`);
}

const AREAS_BARRA_INFERIOR: readonly Area[] = ["painel", "reunioes", "negociacoes", "pedidos"];

/** Celular: a barra inferior leva às áreas do dia a dia que a pessoa pode ver (o Painel, ao início dela); o resto fica no Menu. */
export function itensBarraInferior(itens: readonly ItemMenu[], inicio: Inicio): ItemDeArea[] {
  return itens
    .filter((item): item is ItemDeArea => item.area !== undefined && AREAS_BARRA_INFERIOR.includes(item.area))
    .map((item) => (item.area === "painel" ? { ...item, href: inicio } : item));
}

/** Celular: a área do Menu em que a pessoa está (para a barra mostrar "Metas" no lugar de "Menu"). */
export function areaNoMenu(itens: readonly ItemMenu[], caminho: string): ItemDeArea | undefined {
  const item = itemPorSegmento(caminho.split("/")[1] ?? "");
  const visivel = itens.some((i) => i.href === item?.href || i.filhos?.some((f) => f.href === item?.href));
  return item && visivel && !AREAS_BARRA_INFERIOR.includes(item.area) ? item : undefined;
}

export type AcaoRapida = { area: Area; titulo: string; href: string };

// Os registros do dia a dia do closer (decisão do Mayke, 19/10/2026) e o comunicado da liderança (entrega 5 do
// redesenho) e o link de pagamento que o closer manda na call: produto e usuário ficam nas telas deles.
const ACOES_RAPIDAS: readonly AcaoRapida[] = [
  { area: "reunioes", titulo: "Nova reunião", href: "/reunioes/nova" },
  { area: "negociacoes", titulo: "Registrar contato", href: "/negociacoes/contato" },
  { area: "pedidos", titulo: "Novo pedido", href: "/pedidos/novo" },
  { area: "links", titulo: "Gerar link", href: "/links/novo" },
  { area: "avisos", titulo: "Novo comunicado", href: "/avisos/novo" },
];

/**
 * Botão "+": os registros que a pessoa pode fazer ("Editar" ou acima na área, como nas páginas). A negociação nasce
 * do follow-up da reunião.
 */
export function acoesRapidas(permissoes: { area: Area; nivel: Enums["nivel_permissao"] }[]): AcaoRapida[] {
  return ACOES_RAPIDAS.filter((acao) => permissoes.some((p) => p.area === acao.area && (p.nivel === "editar" || p.nivel === "aprovar")));
}
