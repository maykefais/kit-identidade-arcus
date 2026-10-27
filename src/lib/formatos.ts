// Dinheiro sempre em centavos; percentual como fração (0,125 = 12,5%); multiplicador em vezes (3,84 = "3,84x", o ROAS).
const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const moedaCompacta = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  notation: "compact",
  maximumFractionDigits: 1,
});
const decimal = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const numero = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });
const numeroCompacto = new Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 1 });
const percentual = new Intl.NumberFormat("pt-BR", { style: "percent", maximumFractionDigits: 1 });

export type Formato = "moeda" | "numero" | "percentual" | "multiplicador";

export function formatar(valor: number, formato: Formato = "numero"): string {
  if (formato === "moeda") return moeda.format(valor / 100);
  if (formato === "percentual") return percentual.format(valor);
  if (formato === "multiplicador") return `${decimal.format(valor)}x`;
  return numero.format(valor);
}

/** "1 venda", "3 vendas": o número formatado com o singular só no 1. */
export const plural = (n: number, um: string, varios: string) => `${formatar(n)} ${n === 1 ? um : varios}`;

/** Valor exato sem os centavos quando são zero ("R$ 21.900", "R$ 21.900,50"): venda individual no painel. */
export const formatarReais = (centavos: number) => formatar(centavos, "moeda").replace(/,00$/, "");

export function formatarPercentual(fracao: number): string {
  return percentual.format(fracao);
}

/** Versão curta para eixos de gráfico ("R$ 120 mil"). */
export function formatarCompacto(valor: number, formato: Formato = "numero"): string {
  if (formato === "moeda") return moedaCompacta.format(valor / 100);
  if (formato === "percentual") return percentual.format(valor);
  if (formato === "multiplicador") return `${decimal.format(valor)}x`;
  return numeroCompacto.format(valor);
}

/** Centavos → "1.234,56" (campo de valor, sem símbolo). */
export function formatarDecimal(centavos: number): string {
  return decimal.format(centavos / 100);
}

/** Texto digitado ("1.234,56", "R$ 10") → centavos; null se inválido ou negativo. */
export function paraCentavos(texto: string): number | null {
  // Milhar com ponto só em grupos de 3 ("1.234,56"); "10.50" é inválido, não R$ 1.050.
  const partes = /^(\d{1,3}(?:\.\d{3})+|\d+)(?:,(\d{1,2}))?$/.exec(texto.replace(/R\$|\s/g, ""));
  if (!partes) return null;
  const centavos = Number(partes[1].replaceAll(".", "")) * 100 + Number((partes[2] ?? "").padEnd(2, "0"));
  return Number.isSafeInteger(centavos) ? centavos : null;
}

/** "2026-10-17" → "17/10/2026" (data sem hora, sem conversão de fuso). */
export function formatarData(iso: string): string {
  const [ano, mes, dia] = iso.slice(0, 10).split("-");
  return `${dia}/${mes}/${ano}`;
}

/** "Carla Souza Lima" → "Carla". */
export const primeiroNome = (nome: string) => nome.trim().split(/\s+/)[0] ?? nome;

/**
 * Nome curto para listas com várias pessoas: o primeiro nome; se outro da lista tem o mesmo, mais a inicial do último
 * sobrenome ("Ana S."), ou o sobrenome inteiro quando a inicial também se repete ("Ana Souza" e "Ana Silva").
 */
export function nomesCurtos(nomes: string[]): (nome: string) => string {
  const ultimo = (n: string) => n.trim().split(/\s+/).slice(1).at(-1) ?? "";
  const porPrimeiro = new Map<string, Set<string>>();
  for (const n of nomes) porPrimeiro.set(primeiroNome(n), (porPrimeiro.get(primeiroNome(n)) ?? new Set()).add(n.trim()));
  return (nome) => {
    const p = primeiroNome(nome);
    const mesmos = [...(porPrimeiro.get(p) ?? [])].filter((n) => n !== nome.trim());
    const u = ultimo(nome);
    if (!mesmos.length || !u) return p;
    return mesmos.some((n) => ultimo(n)[0] === u[0]) ? `${p} ${u}` : `${p} ${u[0]}.`;
  };
}

/** "Mariana Thenorio de Albuquerque" → "MA": primeira letra do primeiro e do último nome (avatar sem foto). */
export function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  return ((partes[0]?.[0] ?? "") + (partes.length > 1 ? partes.at(-1)![0] : "")).toUpperCase();
}

const inteiro = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });
const milhoes = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });

/** Para cartões: moeda em reais, mil ou mi ("R$ 412 mil", "R$ 1,24 mi"); número e percentual inteiros. O exato vai no `title`. */
export function formatarArredondado(valor: number, formato: Formato): string {
  if (formato === "percentual") return `${inteiro.format(Math.round(valor * 100) || 0)}%`;
  if (formato === "numero") return inteiro.format(Math.round(valor) || 0);
  if (formato === "multiplicador") return `${decimal.format(valor)}x`;
  const reais = Math.abs(valor) / 100;
  const sinal = valor < 0 && Math.round(reais) > 0 ? "-" : "";
  if (Math.round(reais) < 1000) return `${sinal}R$ ${inteiro.format(Math.round(reais))}`;
  const mil = Math.round(reais / 1000);
  if (mil < 1000) return `${sinal}R$ ${inteiro.format(mil)} mil`;
  return `${sinal}R$ ${milhoes.format(Math.round(reais / 10_000) / 100)} mi`;
}

const diaSP = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" });

/** "agora", "há 12 min", "há 2 h", "ontem" (dia do calendário em São Paulo) ou "19/10". */
export function haQuanto(instante: string, agora: Date): string {
  const t = new Date(instante);
  const min = Math.floor((agora.getTime() - t.getTime()) / 60_000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  const dia = diaSP.format(t);
  if (dia === diaSP.format(agora)) return `há ${Math.floor(min / 60)} h`;
  if (dia === diaSP.format(new Date(agora.getTime() - 86_400_000))) return "ontem";
  return `${dia.slice(8)}/${dia.slice(5, 7)}`;
}
