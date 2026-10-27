import type { FieldErrors, FieldValues, Resolver } from "react-hook-form";
import type { z } from "zod";

type Esquema = z.ZodType<FieldValues, FieldValues>;

/**
 * Resolver do React Hook Form para um esquema Zod. A ação do servidor valida de novo com o mesmo esquema.
 * (Escrito aqui porque o @hookform/resolvers conflita com o zod 4 por uma dependência opcional.)
 */
export function resolverZod<E extends Esquema>(esquema: E): Resolver<z.input<E>, unknown, z.output<E>> {
  return async (valores) => {
    const resultado = await esquema.safeParseAsync(valores);
    if (resultado.success) return { values: resultado.data, errors: {} };

    const erros: Record<string, unknown> = {};
    for (const problema of resultado.error.issues) {
      const caminho = problema.path.length ? problema.path.map(String) : ["root"];
      let alvo = erros;
      caminho.forEach((parte, i) => {
        if (i === caminho.length - 1) alvo[parte] ??= { type: problema.code, message: problema.message };
        else alvo = (alvo[parte] ??= {}) as Record<string, unknown>;
      });
    }
    return { values: {}, errors: erros as FieldErrors<z.input<E>> };
  };
}
