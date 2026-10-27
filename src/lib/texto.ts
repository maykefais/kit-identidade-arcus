/** Minúsculas e sem acento, para busca ("Negociação" encontra "negociacao"). */
export function normalizar(texto: string): string {
  return texto.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
}

export function contemTexto(valor: unknown, busca: string): boolean {
  const alvo = normalizar(busca);
  if (!alvo) return true;
  if (valor == null) return false;
  return normalizar(String(valor)).includes(alvo);
}
