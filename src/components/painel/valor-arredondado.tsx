import { formatar, formatarArredondado, formatarReais, type Formato } from "@/lib/formatos";

/**
 * "R$ 412 mil" na tela; o exato no `title` (passar o mouse) e para o leitor de tela. `reais`: moeda em reais inteiros
 * ("R$ 1.012"), para custos em que "R$ 1 mil" esconderia a diferença.
 */
export function ValorArredondado({ valor, formato, reais }: { valor: number; formato: Formato; reais?: boolean }) {
  const exato = formatar(valor, formato);
  return (
    <span title={exato} className="whitespace-nowrap">
      <span aria-hidden>{reais ? formatarReais(Math.round(valor / 100) * 100) : formatarArredondado(valor, formato)}</span>
      <span className="sr-only">{exato}</span>
    </span>
  );
}
