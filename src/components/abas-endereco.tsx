"use client";

import { useSearchParams } from "next/navigation";
import { Tabs } from "@/components/ui/tabs";
import { trocarParametros } from "@/lib/url";

/** Abas com a escolhida no endereço (`?aba=`), sem ir ao servidor: voltar, recarregar e o link abrem a mesma aba (P3). */
export function AbasNoEndereco({ padrao, abas, ...props }: Omit<React.ComponentProps<typeof Tabs>, "value" | "defaultValue" | "onValueChange"> & {
  padrao: string;
  abas: readonly string[];
}) {
  const pedida = useSearchParams().get("aba");
  const aba = abas.find((a) => a === pedida) ?? padrao;
  return <Tabs {...props} value={aba} onValueChange={(nova) => trocarParametros({ aba: nova })} />;
}
