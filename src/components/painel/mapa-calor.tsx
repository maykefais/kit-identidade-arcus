import { formatar, formatarArredondado } from "@/lib/formatos";

type Celula = { reunioes: number; vendas: number; taxa: number | null; intensidade: number | null };

// Força máxima do flame na célula: com o texto na cor do tema, 4,5:1 nos dois temas (contraste.test.ts).
export const FORCA_MAXIMA_CALOR = 60;
// Piso de 14%: a célula de 0% (com dados) já tem cor e não se confunde com a pontilhada de poucos dados.
const fundo = (i: number) => `color-mix(in srgb, var(--chart-2) ${Math.round(14 + (FORCA_MAXIMA_CALOR - 14) * i)}%, transparent)`;

/**
 * Mapa de calor (`painel-v18.html`, `.calor`): conversão por dia da semana × faixa de horário, numa tabela (o número
 * está em cada célula; a cor só reforça). Célula com menos de 3 reuniões: "–" e "poucos dados".
 */
export function MapaCalor({ dias, faixas, celulas }: { dias: string[]; faixas: string[]; celulas: Celula[][] }) {
  return (
    <div className="grid gap-3">
      <table className="w-full table-fixed border-separate border-spacing-1 text-center text-xs tabular-nums">
        <caption className="pb-1 text-left text-xs text-muted-foreground">Conversão das reuniões em venda, por dia e horário</caption>
        <thead>
          <tr>
            <td className="w-9" />
            {faixas.map((f) => (
              <th key={f} scope="col" className="font-normal text-muted-foreground">
                <span aria-hidden>{f.split("–")[0]}</span>
                <span className="sr-only">{f}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dias.map((d, i) => (
            <tr key={d}>
              <th scope="row" className="text-left font-normal text-muted-foreground">
                {d}
              </th>
              {celulas[i].map((c, j) => (
                <td
                  key={faixas[j]}
                  title={`${formatar(c.vendas)} ${c.vendas === 1 ? "venda" : "vendas"} em ${formatar(c.reunioes)} ${c.reunioes === 1 ? "reunião" : "reuniões"}`}
                  className={c.intensidade == null ? "h-8 rounded-md border border-dashed border-border" : "h-8 rounded-md font-semibold"}
                  style={c.intensidade == null ? undefined : { background: fundo(c.intensidade) }}
                >
                  {c.taxa == null ? (
                    <>
                      <span aria-hidden className="font-normal text-muted-foreground">–</span>
                      <span className="sr-only">poucos dados</span>
                    </>
                  ) : (
                    formatarArredondado(c.taxa, "percentual")
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p aria-hidden className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
        <span>converte menos</span>
        <span className="h-2 min-w-16 flex-1 rounded-full" style={{ background: `linear-gradient(90deg, ${fundo(0)}, ${fundo(1)})` }} />
        <span>converte mais</span>
        <span className="w-full">– poucos dados (menos de 3 reuniões)</span>
      </p>
    </div>
  );
}
