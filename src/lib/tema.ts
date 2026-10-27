export const CHAVE_TEMA = "tema";

export type PreferenciaTema = "claro" | "escuro" | "sistema";

export function lerPreferencia(valor: string | null): PreferenciaTema {
  return valor === "claro" || valor === "escuro" ? valor : "sistema";
}

export function temaEscuro(preferencia: PreferenciaTema, sistemaEscuro: boolean): boolean {
  return preferencia === "escuro" || (preferencia === "sistema" && sistemaEscuro);
}

// Roda inline no <head>, antes da primeira pintura (evita o flash do tema). Repete a regra acima.
export const SCRIPT_TEMA = `(function(){try{var p=localStorage.getItem("${CHAVE_TEMA}");var e=p==="escuro"||(p!=="claro"&&matchMedia("(prefers-color-scheme: dark)").matches);var d=document.documentElement;d.classList.toggle("dark",e);d.style.colorScheme=e?"dark":"light"}catch(_){}})()`;
