import { Skeleton } from "@/components/ui/skeleton";

/** Fallback de <Suspense> das páginas: título, cartões e um bloco, no lugar da tela em branco. */
export function EsqueletoPagina({ cartoes = 4 }: { cartoes?: number }) {
  return (
    <div className="flex flex-col gap-8" aria-busy="true">
      <span className="sr-only">Carregando…</span>
      <div className="grid gap-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      {cartoes > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: cartoes }, (_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      )}
      <Skeleton className="h-72 rounded-xl" />
    </div>
  );
}

/** Fallback da área logada enquanto a sessão é conferida: menu lateral e página em esqueleto. */
export function EsqueletoApp() {
  return (
    <div className="flex min-h-svh w-full">
      <div className="hidden w-64 shrink-0 bg-sidebar md:block" />
      <div className="flex flex-1 flex-col">
        <div className="pt-[calc(env(safe-area-inset-top)+0.5rem)] md:pt-[env(safe-area-inset-top)]">
          <div className="h-14" />
        </div>
        <div className="mx-auto w-full max-w-7xl p-4 md:p-8">
          <EsqueletoPagina />
        </div>
      </div>
    </div>
  );
}
