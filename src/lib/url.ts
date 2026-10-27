/** Troca parâmetros do endereço sem ir ao servidor (o Next sincroniza o useSearchParams); valor vazio sai do endereço. */
export function trocarParametros(mudancas: Record<string, string | undefined>) {
  const url = new URL(window.location.href);
  for (const [chave, valor] of Object.entries(mudancas)) {
    if (valor) url.searchParams.set(chave, valor);
    else url.searchParams.delete(chave);
  }
  window.history.replaceState(null, "", url);
}
