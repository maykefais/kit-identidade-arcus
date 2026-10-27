"use client";

import { useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { ConfirmarAcao } from "@/components/confirmar-acao";
import { CampoAreaTexto, CampoInteiro, CampoMoeda, CampoOpcoes, CampoSelecao, CampoTexto, useFormulario } from "@/components/formulario";
import { Grafico } from "@/components/grafico";
import { TabelaDados } from "@/components/tabela-dados";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { formatar } from "@/lib/formatos";

const STATUS = {
  aguardando: "Aguardando",
  tentativa_1: "Tentativa 1",
  condicao: "Condição",
  pagou_sinal: "Pagou sinal",
  nutricao: "Nutrição",
  fechou: "Fechou",
} as const;
type Status = keyof typeof STATUS;
const OPCOES_STATUS = Object.entries(STATUS).map(([valor, rotulo]) => ({ valor, rotulo }));
const TEMPERATURAS = ["frio", "morno", "quente", "forecast"] as const;

type Negociacao = {
  empresa: string;
  closer: string;
  status: Status;
  temperatura: (typeof TEMPERATURAS)[number];
  valor: number;
};

const NEGOCIACOES: Negociacao[] = Array.from({ length: 32 }, (_, i) => ({
  empresa: `Loja Exemplo ${String(i + 1).padStart(2, "0")}${i % 5 === 0 ? " Moda Íntima" : ""}`,
  closer: `Closer ${"ABC"[i % 3]}`,
  status: (Object.keys(STATUS) as Status[])[i % 6],
  temperatura: TEMPERATURAS[(i * 7) % 4],
  valor: 450_000 + ((i * 137_000) % 1_800_000),
}));

const esperar = (ms: number) => new Promise((resolver) => setTimeout(resolver, ms));

const coluna = createColumnHelper<Negociacao>();
const COLUNAS = [
  coluna.accessor("empresa", { header: "Empresa" }),
  coluna.accessor("closer", { header: "Closer" }),
  coluna.accessor("status", { header: "Status", cell: (c) => STATUS[c.getValue()] }),
  coluna.accessor("temperatura", {
    header: "Temperatura",
    cell: (c) => (
      <Badge variant={c.getValue() === "forecast" ? "default" : "secondary"} className="capitalize">
        {c.getValue()}
      </Badge>
    ),
  }),
  coluna.accessor("valor", {
    header: "Valor",
    meta: { alinhar: "direita" },
    cell: (c) => formatar(c.getValue(), "moeda"),
  }),
  coluna.display({
    id: "acoes",
    header: () => <span className="sr-only">Ações</span>,
    cell: (c) => (
      <ConfirmarAcao
        titulo="Excluir negociação?"
        descricao={`${c.row.original.empresa} sai da lista e não dá para desfazer. (Exemplo: nada é gravado.)`}
        rotuloConfirmar="Excluir"
        destrutivo
        aoConfirmar={async () => {
          await esperar(600);
          toast.success("Negociação excluída", { description: "Exemplo: nada foi gravado." });
        }}
      >
        <Button variant="ghost" size="icon-sm" aria-label={`Excluir ${c.row.original.empresa}`}>
          <Trash2 />
        </Button>
      </ConfirmarAcao>
    ),
  }),
];

/** Ação principal da tela: um único botão em destaque, no cabeçalho. */
export function AcaoPrincipalExemplo({ rotulo = "Nova negociação" }: { rotulo?: string }) {
  return (
    <Button onClick={() => toast("Exemplo", { description: "Aqui abriria o formulário." })}>
      <Plus data-icon="inline-start" />
      {rotulo}
    </Button>
  );
}

export function BotoesExemplo() {
  const [salvando, setSalvando] = useState(false);
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        carregando={salvando}
        onClick={async () => {
          setSalvando(true);
          await esperar(1200);
          setSalvando(false);
          toast.success("Alterações salvas");
        }}
      >
        Salvar
      </Button>
      <Button variant="outline">Secundário</Button>
      <Button variant="secondary">Aprovar</Button>
      <Button variant="ghost">Discreto</Button>
      <Button disabled>Desabilitado</Button>
      <Button variant="outline" onClick={() => toast.error("Não foi possível salvar.", { description: "Confira o valor e tente de novo." })}>
        Simular erro
      </Button>
      <ConfirmarAcao
        titulo="Cancelar o pedido?"
        descricao="O pedido volta para rascunho e o financeiro é avisado. (Exemplo: nada é gravado.)"
        rotuloConfirmar="Cancelar pedido"
        destrutivo
        aoConfirmar={async () => {
          await esperar(600);
          toast.success("Pedido cancelado", { description: "Exemplo: nada foi gravado." });
        }}
      >
        <Button variant="destructive">Cancelar pedido</Button>
      </ConfirmarAcao>
      <div className="flex w-full flex-wrap gap-2">
        <Badge>Forecast</Badge>
        <Badge variant="secondary">Aprovada</Badge>
        <Badge variant="outline">Aguardando</Badge>
        <Badge variant="destructive">Recusada</Badge>
      </div>
    </div>
  );
}

export function TabelaExemplo() {
  return (
    <TabelaDados
      colunas={COLUNAS}
      dados={NEGOCIACOES}
      busca="Buscar empresa ou closer"
      filtros={[{ coluna: "status", titulo: "Status", opcoes: OPCOES_STATUS }]}
      linhasPorPagina={10}
      vazio={{ titulo: "Nenhuma negociação aberta", descricao: "As negociações aparecem aqui quando um closer registra o follow-up." }}
    />
  );
}

const MESES = ["Mai", "Jun", "Jul", "Ago", "Set", "Out"];
const CONTRATOS = MESES.map((mes, i) => ({ mes, contratos: 10 + ((i * 5) % 9) }));

export function GraficoExemplo() {
  return (
    <Grafico
      dados={CONTRATOS}
      eixoX="mes"
      series={[{ chave: "contratos", rotulo: "Contratos" }]}
      rotulo="Contratos fechados por mês, de maio a outubro"
    />
  );
}

const esquemaExemplo = z.object({
  empresa: z.string().trim().min(2, "Informe o nome da empresa"),
  status: z.enum(Object.keys(STATUS) as [Status, ...Status[]], { error: "Escolha o status" }),
  temperatura: z.enum(TEMPERATURAS, { error: "Escolha a temperatura" }),
  valor: z.number({ error: "Informe um valor válido" }).int().positive("O valor precisa ser maior que zero"),
  parcelas: z.number({ error: "Informe as parcelas" }).int().min(1, "Pelo menos 1 parcela").max(12, "Até 12 parcelas"),
  proximoContato: z.iso.date({ error: "Informe a data do próximo contato" }),
  anotacao: z.string().trim().max(500, "Até 500 caracteres"),
});

export function FormularioExemplo() {
  const [enviado, setEnviado] = useState<z.output<typeof esquemaExemplo> | null>(null);
  const formulario = useFormulario(esquemaExemplo, {
    defaultValues: { empresa: "", proximoContato: "", anotacao: "" },
  });
  const { control } = formulario;

  async function enviar(dados: z.output<typeof esquemaExemplo>) {
    await esperar(800);
    setEnviado(dados);
    toast.success("Negociação validada", { description: "Exemplo: nada foi gravado." });
  }

  return (
    <form onSubmit={formulario.handleSubmit(enviar)} noValidate className="grid gap-6">
      <FieldGroup>
        <CampoTexto control={control} nome="empresa" rotulo="Empresa" placeholder="Nome da loja" />
        <CampoSelecao control={control} nome="status" rotulo="Status" opcoes={OPCOES_STATUS} />
        <CampoOpcoes
          control={control}
          nome="temperatura"
          rotulo="Temperatura"
          opcoes={TEMPERATURAS.map((t) => ({ valor: t, rotulo: t[0].toUpperCase() + t.slice(1) }))}
        />
        <CampoMoeda control={control} nome="valor" rotulo="Valor negociado" />
        <CampoInteiro control={control} nome="parcelas" rotulo="Parcelas" descricao="Só números inteiros." />
        <CampoTexto control={control} nome="proximoContato" rotulo="Próximo contato" tipo="date" />
        <CampoAreaTexto control={control} nome="anotacao" rotulo="Anotação" descricao="Opcional, até 500 caracteres." />
      </FieldGroup>
      <div className="flex gap-2">
        <Button type="submit" carregando={formulario.formState.isSubmitting}>
          Validar
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            formulario.reset();
            setEnviado(null);
          }}
        >
          Limpar
        </Button>
      </div>
      {enviado && (
        <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs" aria-label="Dados validados">
          {JSON.stringify(enviado, null, 2)}
        </pre>
      )}
    </form>
  );
}
