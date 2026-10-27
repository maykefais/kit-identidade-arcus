"use client";

import { useId, useState, type ReactNode } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export type OpcaoSecao = { chave: string; rotulo: string; titulo?: string; conteudo: ReactNode };

/**
 * Cartão com título e seletor próprio (faturamento, cash collect, contratos…): o conteúdo de cada opção vem pronto de
 * quem chama (pode ser montado no servidor); aqui só fica qual está à vista.
 */
export function SecaoComSeletor({
  titulo,
  rotuloSeletor,
  opcoes,
  padrao,
  nivel = 2,
}: {
  titulo: string;
  rotuloSeletor: string;
  opcoes: OpcaoSecao[];
  /** Opção inicial; sem ela, a primeira. */
  padrao?: string;
  /** Nível do título: 3 quando a seção fica dentro de outra com título (o painel da pessoa). */
  nivel?: 2 | 3;
}) {
  const id = useId();
  const Titulo = nivel === 3 ? "h3" : "h2";
  const [chave, setChave] = useState(padrao ?? opcoes[0]?.chave);
  const atual = opcoes.find((o) => o.chave === chave) ?? opcoes[0];
  if (!atual) return null;
  return (
    <Card aria-labelledby={id} role="region">
      <CardHeader className="flex flex-wrap items-center justify-between gap-3">
        <Titulo id={id} className="text-sm font-semibold">
          {atual.titulo ?? titulo}
        </Titulo>
        {opcoes.length > 1 && (
          <ToggleGroup type="single" variant="outline" size="sm" value={atual.chave} onValueChange={(v) => v && setChave(v)} aria-label={rotuloSeletor}>
            {opcoes.map((o) => (
              <ToggleGroupItem key={o.chave} value={o.chave}>
                {o.rotulo}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        )}
      </CardHeader>
      <CardContent>{atual.conteudo}</CardContent>
    </Card>
  );
}
