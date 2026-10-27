import Image from "next/image";

/** Telas fora da área logada (entrar, acesso negado): textura Indigo da marca ao lado do conteúdo. */
export function TelaMarca({
  titulo,
  descricao,
  children,
}: {
  titulo: string;
  descricao: string;
  children: React.ReactNode;
}) {
  return (
    <main className="grid flex-1 lg:grid-cols-[1.1fr_1fr]">
      <section
        className="hidden flex-col justify-between bg-navy bg-cover bg-center p-12 text-cream lg:flex"
        style={{ backgroundImage: "url(/marca/textura-indigo.jpg)" }}
      >
        <Image src="/marca/arcus-fundo-escuro.png" alt="Arcus" width={139} height={40} priority />
        <div className="grid max-w-md gap-4">
          <p className="text-xs font-semibold tracking-[0.18em] text-ambar uppercase">Sistema Comercial</p>
          <p className="text-4xl leading-[1.05] font-bold tracking-tight">
            Reuniões, negociações, pedidos e metas num só lugar.
          </p>
        </div>
      </section>

      <section className="flex flex-col items-center justify-center gap-10 p-6 sm:p-12">
        <div className="lg:hidden">
          <Image src="/marca/arcus-logo-claro.png" alt="Arcus" width={137} height={40} priority className="dark:hidden" />
          <Image src="/marca/arcus-fundo-escuro.png" alt="Arcus" width={139} height={40} priority className="hidden dark:block" />
        </div>
        <div className="grid w-full max-w-sm gap-6">
          <div className="grid gap-2">
            <h1 className="text-3xl font-bold tracking-tight">{titulo}</h1>
            <p className="text-muted-foreground">{descricao}</p>
          </div>
          {children}
        </div>
        <p className="text-xs text-muted-foreground">Acesso restrito a colaboradores do Grupo Arcus.</p>
      </section>
    </main>
  );
}
