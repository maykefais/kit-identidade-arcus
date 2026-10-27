"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

/** Botão de envio de <form action>: fica carregando enquanto a ação do servidor roda. */
export function BotaoEnviar(props: Omit<React.ComponentProps<typeof Button>, "type" | "carregando">) {
  const { pending } = useFormStatus();
  return <Button type="submit" carregando={pending} {...props} />;
}
