import { LinkVolta } from "@/components/memoria-volta";

/**
 * Topo da página (V1): "← lugar de cima" nas telas fora do menu (P1), sobretítulo com o tipo do registro (P2), título,
 * descrição curta e as ações (uma principal).
 */
export function CabecalhoPagina({
  titulo,
  sobretitulo,
  voltar,
  descricao,
  children,
}: {
  titulo: string;
  sobretitulo?: string;
  voltar?: { href: string; rotulo: string };
  descricao?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      {voltar && <LinkVolta {...voltar} />}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid min-w-0 gap-1">
          {sobretitulo && <p className="text-sm font-medium text-muted-foreground">{sobretitulo}</p>}
          <h1 className="text-2xl leading-tight font-bold tracking-tight break-words">{titulo}</h1>
          {descricao && <p className="text-sm text-muted-foreground">{descricao}</p>}
        </div>
        {children && <div className="flex flex-wrap gap-2">{children}</div>}
      </div>
    </div>
  );
}
