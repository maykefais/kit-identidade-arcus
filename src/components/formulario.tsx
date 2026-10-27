"use client";

import { useState } from "react";
import {
  Controller,
  useForm,
  type Control,
  type ControllerRenderProps,
  type FieldPath,
  type FieldValues,
  type UseFormProps,
} from "react-hook-form";
import type { z } from "zod";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { formatarDecimal, paraCentavos } from "@/lib/formatos";
import { resolverZod } from "@/lib/formulario/resolver-zod";
import { cn } from "@/lib/utils";

/** useForm já ligado ao esquema Zod (validação ao sair do campo). */
export function useFormulario<E extends z.ZodType<FieldValues, FieldValues>>(
  esquema: E,
  opcoes?: Omit<UseFormProps<z.input<E>, unknown, z.output<E>>, "resolver">,
) {
  return useForm<z.input<E>, unknown, z.output<E>>({ mode: "onTouched", ...opcoes, resolver: resolverZod(esquema) });
}

type BaseCampo<T extends FieldValues, S extends FieldValues> = {
  control: Control<T, unknown, S>;
  nome: FieldPath<T>;
  rotulo: string;
  descricao?: string;
  desabilitado?: boolean;
};

function Campo<T extends FieldValues, S extends FieldValues>({
  control,
  nome,
  rotulo,
  descricao,
  desabilitado,
  render,
}: BaseCampo<T, S> & { render: (campo: ControllerRenderProps<T, FieldPath<T>>, invalido: boolean) => React.ReactNode }) {
  return (
    <Controller
      control={control}
      name={nome}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} data-disabled={desabilitado}>
          <FieldLabel htmlFor={field.name}>{rotulo}</FieldLabel>
          {render(field, fieldState.invalid)}
          {descricao && <FieldDescription>{descricao}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}

export function CampoTexto<T extends FieldValues, S extends FieldValues>({
  tipo = "text",
  placeholder,
  aoSair,
  mascara,
  teclado,
  autoComplete,
  min,
  max,
  ...base
}: BaseCampo<T, S> & {
  tipo?: "text" | "email" | "tel" | "date" | "time" | "url";
  /** Menor e maior data aceitas no seletor (`tipo="date"`), como "AAAA-MM-DD". */
  min?: string;
  max?: string;
  placeholder?: string;
  aoSair?: () => void;
  /** Formata enquanto digita (CPF, CNPJ, CEP, telefone); o esquema guarda só os dígitos. */
  mascara?: (valor: string) => string;
  /** Teclado do celular (ex.: "numeric" no CPF). */
  teclado?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  autoComplete?: string;
}) {
  return (
    <Campo
      {...base}
      render={(campo, invalido) => (
        <Input
          {...campo}
          id={campo.name}
          type={tipo}
          inputMode={teclado}
          autoComplete={autoComplete}
          min={min}
          max={max}
          placeholder={placeholder}
          value={mascara ? mascara(campo.value ?? "") : (campo.value ?? "")}
          onChange={mascara ? (e) => campo.onChange(mascara(e.target.value)) : campo.onChange}
          aria-invalid={invalido}
          disabled={base.desabilitado}
          onBlur={() => {
            campo.onBlur();
            aoSair?.();
          }}
        />
      )}
    />
  );
}

export function CampoAreaTexto<T extends FieldValues, S extends FieldValues>({
  placeholder,
  ...base
}: BaseCampo<T, S> & { placeholder?: string }) {
  return (
    <Campo
      {...base}
      render={(campo, invalido) => (
        <Textarea {...campo} id={campo.name} placeholder={placeholder} value={campo.value ?? ""} aria-invalid={invalido} />
      )}
    />
  );
}

export function CampoSelecao<T extends FieldValues, S extends FieldValues>({
  opcoes,
  placeholder = "Selecione",
  aoMudar,
  numero,
  ...base
}: BaseCampo<T, S> & {
  opcoes: { valor: string; rotulo: string }[];
  placeholder?: string;
  aoMudar?: (valor: string) => void;
  /** O campo guarda número (ex.: parcelas): a opção escolhida volta como número. */
  numero?: boolean;
}) {
  return (
    <Campo
      {...base}
      render={(campo, invalido) => (
        <Select
          name={campo.name}
          // Número no formulário (ex.: parcelas) aparece marcado: o Select compara texto.
          value={campo.value == null ? "" : String(campo.value)}
          onValueChange={(valor) => {
            campo.onChange(numero ? Number(valor) : valor);
            aoMudar?.(valor);
          }}
          disabled={base.desabilitado}
        >
          <SelectTrigger id={campo.name} aria-invalid={invalido} onBlur={campo.onBlur} className="w-full">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {opcoes.map((opcao) => (
              <SelectItem key={opcao.valor} value={opcao.valor}>
                {opcao.rotulo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    />
  );
}

/** Poucas opções numa escolha de um toque (celular); tocar de novo na marcada desmarca (""). */
export function CampoOpcoes<T extends FieldValues, S extends FieldValues>({
  opcoes,
  multiplo,
  ...base
}: BaseCampo<T, S> & { opcoes: { valor: string; rotulo: string }[]; /** Várias escolhas (o valor é uma lista). */ multiplo?: boolean }) {
  return (
    <Campo
      {...base}
      render={(campo, invalido) => {
        const comum = {
          variant: "outline" as const,
          id: campo.name,
          "aria-label": base.rotulo,
          "aria-invalid": invalido,
          onBlur: campo.onBlur,
          disabled: base.desabilitado,
          className: "w-full flex-wrap sm:w-fit", // no computador, o trilho abraça as opções
        };
        const itens = opcoes.map((opcao) => (
          <ToggleGroupItem
            key={opcao.valor}
            value={opcao.valor}
            className="grow sm:min-w-28 sm:grow-0"
          >
            {opcao.rotulo}
          </ToggleGroupItem>
        ));
        return multiplo ? (
          <ToggleGroup type="multiple" {...comum} value={campo.value ?? []} onValueChange={campo.onChange}>
            {itens}
          </ToggleGroup>
        ) : (
          <ToggleGroup type="single" {...comum} value={campo.value ?? ""} onValueChange={campo.onChange}>
            {itens}
          </ToggleGroup>
        );
      }}
    />
  );
}

/** Contagem inteira (ex.: contratos); vazio vira undefined. */
export function CampoInteiro<T extends FieldValues, S extends FieldValues>(base: BaseCampo<T, S>) {
  return (
    <Campo
      {...base}
      render={({ ref, name, value, onChange, onBlur }, invalido) => (
        <Input
          ref={ref}
          id={name}
          name={name}
          inputMode="numeric"
          placeholder="0"
          className="tabular-nums"
          aria-invalid={invalido}
          disabled={base.desabilitado}
          value={typeof value === "number" ? String(value) : ""}
          onChange={(e) => {
            const digitos = e.target.value.replace(/\D/g, "");
            onChange(digitos ? Number(digitos) : undefined);
          }}
          onBlur={onBlur}
        />
      )}
    />
  );
}

/** Valor em reais digitado como "1.234,56"; o formulário recebe centavos (undefined se vazio, NaN se inválido). */
export function CampoMoeda<T extends FieldValues, S extends FieldValues>(
  base: BaseCampo<T, S>,
) {
  return <CampoDecimal {...base} prefixo="R$" />;
}

/** Percentual com até 2 casas ("85,5"); o formulário recebe centésimos de ponto (85,5% = 8550). */
export function CampoPercentual<T extends FieldValues, S extends FieldValues>(
  base: BaseCampo<T, S>,
) {
  return <CampoDecimal {...base} sufixo="%" />;
}

/** Multiplicador como ROAS ("4,5"); o formulário recebe centésimos (4,50x = 450). */
export function CampoMultiplicador<
  T extends FieldValues,
  S extends FieldValues,
>(base: BaseCampo<T, S>) {
  return <CampoDecimal {...base} sufixo="x" />;
}

function CampoDecimal<T extends FieldValues, S extends FieldValues>({
  prefixo,
  sufixo,
  ...base
}: BaseCampo<T, S> & { prefixo?: string; sufixo?: string }) {
  return (
    <Campo
      {...base}
      render={({ ref, name, value, onChange, onBlur }, invalido) => (
        <EntradaDecimal
          ref={ref}
          nome={name}
          valor={value}
          aoMudar={onChange}
          aoSair={onBlur}
          invalido={invalido}
          desabilitado={base.desabilitado}
          prefixo={prefixo}
          sufixo={sufixo}
        />
      )}
    />
  );
}

/** Campo de valor sem o formulário (ex.: passo a passo do pagamento): mesmo texto cru ao digitar e formatado fora do foco. */
export function EntradaDecimal({
  ref,
  nome,
  valor,
  aoMudar,
  aoSair,
  invalido,
  desabilitado,
  prefixo,
  sufixo,
}: {
  ref?: React.Ref<HTMLInputElement>;
  nome: string;
  valor: unknown;
  aoMudar: (centesimos: number | undefined) => void;
  aoSair?: () => void;
  invalido?: boolean;
  desabilitado?: boolean;
  prefixo?: string;
  sufixo?: string;
}) {
  // Enquanto digita, mostra o texto cru; fora do foco, o valor formatado (acompanha reset do formulário).
  const [texto, setTexto] = useState<string | null>(null);
  const formatado =
    typeof valor === "number" && Number.isFinite(valor)
      ? formatarDecimal(valor)
      : "";
  const unidade =
    "pointer-events-none absolute top-1/2 -translate-y-1/2 text-sm text-muted-foreground";

  return (
    <div className="relative">
      {prefixo && <span className={cn(unidade, "left-2.5")}>{prefixo}</span>}
      <Input
        ref={ref}
        id={nome}
        name={nome}
        inputMode="decimal"
        placeholder="0,00"
        className={cn("tabular-nums", prefixo && "pl-9", sufixo && "pr-8")}
        aria-invalid={invalido}
        disabled={desabilitado}
        value={texto ?? formatado}
        onFocus={() => setTexto(formatado)}
        onChange={(e) => {
          setTexto(e.target.value);
          // Vazio = sem valor; texto inválido = NaN, que o Zod recusa (nunca vira "vazio" em silêncio).
          aoMudar(
            e.target.value.trim()
              ? (paraCentavos(e.target.value) ?? Number.NaN)
              : undefined,
          );
        }}
        onBlur={() => {
          setTexto(null);
          aoSair?.();
        }}
      />
      {sufixo && <span className={cn(unidade, "right-3")}>{sufixo}</span>}
    </div>
  );
}
