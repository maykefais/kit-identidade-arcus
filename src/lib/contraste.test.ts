import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { FORCA_MAXIMA_CALOR } from "@/components/painel/mapa-calor";
import { razaoContraste } from "./contraste";

const css = readFileSync("src/app/globals.css", "utf8");
// Os blocos de tema não têm chaves aninhadas.
const bloco = (seletor: string) => css.match(new RegExp(`(?:^|\\n)${seletor} \\{([^}]*)\\}`))?.[1] ?? "";
const hex = (b: string, token: string) => b.match(new RegExp(`--${token}:\\s*(#[0-9A-Fa-f]{6})\\s*;`))?.[1] ?? "";

// Cor `topo` com opacidade `alfa` sobre `base`, ambas #RRGGBB.
function misturar(topo: string, alfa: number, base: string): string {
  const canal = (i: number) => Math.round(parseInt(topo.slice(i, i + 2), 16) * alfa + parseInt(base.slice(i, i + 2), 16) * (1 - alfa));
  return "#" + [1, 3, 5].map((i) => canal(i).toString(16).padStart(2, "0")).join("");
}

describe("razaoContraste", () => {
  it("extremos", () => {
    expect(razaoContraste("#FFFFFF", "#000000")).toBe(21);
    expect(razaoContraste("#EE4B25", "#EE4B25")).toBe(1);
  });
});

describe.each([
  ["claro", ":root"],
  ["escuro", "\\.dark"],
])("tema %s (AA)", (_nome, seletor) => {
  const b = bloco(seletor);
  const t = (token: string) => {
    const v = hex(b, token);
    expect(v, `--${token} precisa ser #RRGGBB`).not.toBe("");
    return v;
  };
  const fundo = () => t("background");
  it.each(["foreground", "muted-foreground", "destructive", "sucesso", "primary-texto"])("%s sobre o fundo >= 4,5", (token) => {
    expect(razaoContraste(t(token), fundo())).toBeGreaterThanOrEqual(4.5);
  });
  it("primary-foreground sobre primary e sobre primary-destaque (passar o mouse, aberto) >= 4,5", () => {
    expect(razaoContraste(t("primary-foreground"), t("primary"))).toBeGreaterThanOrEqual(4.5);
    expect(razaoContraste(t("primary-foreground"), t("primary-destaque"))).toBeGreaterThanOrEqual(4.5);
  });
  // Selos de situação e botão tonal: texto sobre o próprio fundo.
  it.each([
    ["sucesso", "selo-ok"],
    ["accent-foreground", "accent"],
    ["selo-atencao-texto", "selo-atencao"],
  ])("%s sobre %s >= 4,5", (texto, fundoSelo) => {
    expect(razaoContraste(t(texto), t(fundoSelo))).toBeGreaterThanOrEqual(4.5);
  });
  // Barras: as quatro cores (e a hachura, nas mesmas cores) e as pontas do gradiente sem meta contra o trilho opaco
  // (componente gráfico). O azul "no ritmo" não pode ser o azul das barras sem meta.
  it.each(["barra-vermelho", "barra-amarelo", "barra-azul", "barra-verde", "barra-neutra-de", "barra-neutra-ate"])(
    "%s sobre o trilho-barra >= 3",
    (token) => {
      expect(razaoContraste(t(token), t("trilho-barra"))).toBeGreaterThanOrEqual(3);
    },
  );
  it("barra-azul diferente do chart-1", () => {
    expect(t("barra-azul")).not.toBe(t("chart-1"));
  });
  // O amarelo "atrás do esperado" não pode ler como o flame da marca (o #B45309 do claro lia como laranja).
  // Matiz em graus (HSL); o antigo ficava a 15° do flame, o #A16207 fica a 24°.
  it("barra-amarelo a 20° ou mais do flame (chart-2)", () => {
    const matiz = (c: string) => {
      const [r, g, b] = [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
      const max = Math.max(r, g, b);
      const d = max - Math.min(r, g, b);
      const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
      return (h * 60 + 360) % 360;
    };
    expect(matiz(t("barra-amarelo")) - matiz(t("chart-2"))).toBeGreaterThanOrEqual(20);
  });
  // Gaveta do link (no popover): tentativa paga em selo-ok; negada no tom do selo destructive (10% no claro, 20% no
  // escuro), com o selo sem fundo próprio por cima (dois translúcidos somados caem abaixo de 4,5 no escuro).
  it("textos da tentativa sobre o fundo de sucesso e de erro >= 4,5", () => {
    const alfa = seletor === ":root" ? 0.1 : 0.2;
    const erro = misturar(t("destructive"), alfa, t("popover"));
    for (const fundoTentativa of [t("selo-ok"), erro]) {
      expect(razaoContraste(t("foreground"), fundoTentativa)).toBeGreaterThanOrEqual(4.5);
      expect(razaoContraste(t("muted-foreground"), fundoTentativa)).toBeGreaterThanOrEqual(4.5);
    }
    expect(razaoContraste(t("destructive"), erro)).toBeGreaterThanOrEqual(4.5);
  });
  // Busca rápida: título dos grupos e detalhe no painel (popover) e na linha escolhida (secondary).
  it("muted-foreground sobre popover e sobre secondary >= 4,5", () => {
    expect(razaoContraste(t("muted-foreground"), t("popover"))).toBeGreaterThanOrEqual(4.5);
    expect(razaoContraste(t("muted-foreground"), t("secondary"))).toBeGreaterThanOrEqual(4.5);
  });
  // Item focado nos menus (select e dropdown): contorno na cor do texto sobre o popover.
  it("foreground sobre popover >= 3", () => {
    expect(razaoContraste(t("foreground"), t("popover"))).toBeGreaterThanOrEqual(3);
  });
  it("ring sobre o fundo >= 3", () => {
    expect(razaoContraste(t("ring"), fundo())).toBeGreaterThanOrEqual(3);
  });
  // Menu lateral: texto, item ativo, foco e ícone no quadradinho translúcido.
  it("sidebar-foreground sobre sidebar e sidebar-accent-foreground sobre sidebar-accent >= 4,5", () => {
    expect(razaoContraste(t("sidebar-foreground"), t("sidebar"))).toBeGreaterThanOrEqual(4.5);
    expect(razaoContraste(t("sidebar-accent-foreground"), t("sidebar-accent"))).toBeGreaterThanOrEqual(4.5);
  });
  it("sidebar-ring sobre sidebar e ícone no quadradinho >= 3", () => {
    const alfa = b.match(/--icone-menu:\s*rgb\(255 255 255 \/ ([\d.]+)\)/)?.[1];
    expect(alfa, "alfa do --icone-menu").toBeTruthy();
    expect(razaoContraste(t("sidebar-ring"), t("sidebar"))).toBeGreaterThanOrEqual(3);
    expect(razaoContraste(t("sidebar-accent-foreground"), misturar("#FFFFFF", Number(alfa), t("sidebar")))).toBeGreaterThanOrEqual(3);
  });
  it("traço flame do subitem escolhido (primary) sobre sidebar >= 3", () => {
    expect(razaoContraste(t("primary"), t("sidebar"))).toBeGreaterThanOrEqual(3);
  });
  // Ícone de alerta do sino (atrasada, aprovação): primary-texto sobre o próprio tom a 12% no painel opaco (popover).
  it("ícone de alerta do sino: primary-texto sobre primary-texto a 12% no popover >= 3", () => {
    expect(razaoContraste(t("primary-texto"), misturar(t("primary-texto"), 0.12, t("popover")))).toBeGreaterThanOrEqual(3);
  });
  // Contorno de campo e de controle (input): no fundo e no cartão de vidro sobre o brilho flame.
  it("input sobre o fundo e sobre o vidro no brilho flame >= 3", () => {
    const brilho = b.match(/--fundo-app:[^;]*?rgb\(238 75 37 \/ ([\d.]+)\)/)?.[1];
    const card = b.match(/--card:\s*rgb\(255 255 255 \/ ([\d.]+)\)/)?.[1];
    expect(brilho && card, "alfas do brilho e do cartão").toBeTruthy();
    const vidro = misturar("#FFFFFF", Number(card), misturar("#EE4B25", Number(brilho), fundo()));
    expect(razaoContraste(t("input"), fundo())).toBeGreaterThanOrEqual(3);
    expect(razaoContraste(t("input"), vidro)).toBeGreaterThanOrEqual(3);
  });
  // Mapa de calor do painel: o texto na célula mais forte (flame a FORCA_MAXIMA_CALOR% sobre o fundo e sobre o vidro no
  // brilho). O "–" de poucos dados fica no vidro, sem fundo (muted-foreground, já medido abaixo).
  it("foreground na célula mais forte do mapa de calor >= 4,5", () => {
    const brilho = b.match(/--fundo-app:[^;]*?rgb\(238 75 37 \/ ([\d.]+)\)/)?.[1];
    const card = b.match(/--card:\s*rgb\(255 255 255 \/ ([\d.]+)\)/)?.[1];
    const vidro = misturar("#FFFFFF", Number(card), misturar("#EE4B25", Number(brilho), fundo()));
    for (const base of [fundo(), vidro])
      expect(razaoContraste(t("foreground"), misturar(t("chart-2"), FORCA_MAXIMA_CALOR / 100, base))).toBeGreaterThanOrEqual(4.5);
  });
  // Chip "N% da meta" do cartão de número: primary-texto sobre o flame a 10% no fundo e no vidro sobre o brilho flame.
  it("primary-texto sobre o chip da meta (primary a 10%) >= 4,5", () => {
    const brilho = b.match(/--fundo-app:[^;]*?rgb\(238 75 37 \/ ([\d.]+)\)/)?.[1];
    const card = b.match(/--card:\s*rgb\(255 255 255 \/ ([\d.]+)\)/)?.[1];
    const vidro = misturar("#FFFFFF", Number(card), misturar("#EE4B25", Number(brilho), fundo()));
    for (const base of [fundo(), vidro]) expect(razaoContraste(t("primary-texto"), misturar(t("primary"), 0.1, base))).toBeGreaterThanOrEqual(4.5);
  });
  // Frases de incentivo da comissão (próxima faixa, bônus): foreground sobre o verde a 10%, no fundo e no vidro sobre o brilho flame.
  it("foreground sobre o quadro verde (sucesso a 10%) >= 4,5", () => {
    const brilho = b.match(/--fundo-app:[^;]*?rgb\(238 75 37 \/ ([\d.]+)\)/)?.[1];
    const card = b.match(/--card:\s*rgb\(255 255 255 \/ ([\d.]+)\)/)?.[1];
    const vidro = misturar("#FFFFFF", Number(card), misturar("#EE4B25", Number(brilho), fundo()));
    for (const base of [fundo(), vidro]) expect(razaoContraste(t("foreground"), misturar(t("sucesso"), 0.1, base))).toBeGreaterThanOrEqual(4.5);
  });
  // Pior caso: texto no cartão de vidro sobre o ponto mais claro do gradiente (brilho flame).
  it.each(["foreground", "muted-foreground", "destructive", "sucesso", "primary-texto"])("%s sobre o vidro no brilho flame >= 4,5", (token) => {
    const brilho = b.match(/--fundo-app:[^;]*?rgb\(238 75 37 \/ ([\d.]+)\)/)?.[1];
    const card = b.match(/--card:\s*rgb\(255 255 255 \/ ([\d.]+)\)/)?.[1];
    expect(brilho && card, "alfas do brilho e do cartão").toBeTruthy();
    const base = misturar("#EE4B25", Number(brilho), fundo());
    expect(razaoContraste(t(token), misturar("#FFFFFF", Number(card), base))).toBeGreaterThanOrEqual(4.5);
  });
});

// Ícone branco no quadradinho ativo, nas duas pontas do gradiente (os dois temas usam o do :root).
it("branco sobre todo o gradiente do ícone ativo >= 3", () => {
  const [de, ate] = bloco(":root").match(/--icone-menu-ativo:\s*linear-gradient\(135deg, (#[0-9A-Fa-f]{6}), (#[0-9A-Fa-f]{6})\)/)?.slice(1) ?? [];
  expect(de && ate, "cores do --icone-menu-ativo").toBeTruthy();
  expect(razaoContraste("#FFFFFF", de)).toBeGreaterThanOrEqual(3);
  expect(razaoContraste("#FFFFFF", ate)).toBeGreaterThanOrEqual(3);
});
