"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Props = {
  titulo: string;
  descricao: string;
  rotuloConfirmar?: string;
  destrutivo?: boolean;
  /** Roda ao confirmar; o diálogo fica aberto, com o botão carregando, até terminar. */
  aoConfirmar: () => Promise<void> | void;
  /** O gatilho (um botão). */
  children: React.ReactElement;
};

/** Confirmação para ações que não se desfazem (excluir, cancelar, aprovar, recusar). */
export function ConfirmarAcao({ titulo, descricao, rotuloConfirmar = "Confirmar", destrutivo, aoConfirmar, children }: Props) {
  const [aberto, setAberto] = useState(false);
  const [carregando, setCarregando] = useState(false);

  async function confirmar() {
    setCarregando(true);
    try {
      await aoConfirmar();
      setAberto(false);
    } catch {
      toast.error("Não foi possível concluir.", { description: "Tente de novo; se continuar, avise a liderança." });
    } finally {
      setCarregando(false);
    }
  }

  return (
    <AlertDialog open={aberto} onOpenChange={(valor) => !carregando && setAberto(valor)}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{titulo}</AlertDialogTitle>
          <AlertDialogDescription>{descricao}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={carregando}>Cancelar</AlertDialogCancel>
          <Button variant={destrutivo ? "destructive" : "default"} carregando={carregando} onClick={confirmar}>
            {rotuloConfirmar}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
