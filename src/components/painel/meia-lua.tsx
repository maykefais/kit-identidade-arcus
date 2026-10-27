import type { ReactNode } from "react";

const R = 110;
const CX = 130;
const CY = 130;

/** Arcos da meia-lua, da esquerda para a direita, um por valor e proporcionais à soma; sem soma (ou valor ≤ 0), null. */
export function arcosMeiaLua(valores: number[]): (string | null)[] {
  const total = valores.reduce((a, v) => a + Math.max(v, 0), 0);
  const ponto = (f: number) => {
    const a = Math.PI * (1 - f);
    return `${(CX + R * Math.cos(a)).toFixed(2)},${(CY - R * Math.sin(a)).toFixed(2)}`;
  };
  let acumulado = 0;
  return valores.map((v) => {
    if (!(total > 0) || v <= 0) return null;
    const de = acumulado / total;
    acumulado += v;
    return `M${ponto(de)} A${R},${R} 0 0,1 ${ponto(acumulado / total)}`;
  });
}

/**
 * Meia-lua em fatias (`painel-v18.html`, `.gauge`): trilho e uma fatia por valor, sem animação. O centro (`children`) fica
 * sobre o arco; os valores ficam na legenda de quem chama e o `rotulo` resume tudo para o leitor de tela.
 */
export function MeiaLua({ fatias, rotulo, children }: { fatias: { valor: number; cor: string }[]; rotulo: string; children?: ReactNode }) {
  const arcos = arcosMeiaLua(fatias.map((f) => f.valor));
  return (
    <div className="grid justify-items-center">
      <svg viewBox="0 0 260 140" className="col-start-1 row-start-1 w-full max-w-62.5" role="img" aria-label={rotulo}>
        <path d={`M20,130 A${R},${R} 0 0,1 240,130`} fill="none" stroke="var(--trilho-barra)" strokeWidth={22} />
        {arcos.map((d, i) => d && <path key={i} d={d} fill="none" stroke={fatias[i].cor} strokeWidth={22} />)}
      </svg>
      {children && <div className="col-start-1 row-start-1 self-end pb-1 text-center">{children}</div>}
    </div>
  );
}
